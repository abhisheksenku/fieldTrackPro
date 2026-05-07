const Attendance = require("../models/Attendance");
const Zone = require("../models/Zone");
const LiveLocation = require("../models/LiveLocation");
const User = require("../models/User");
const createAuditLog = require("../utils/auditLogger");
const { Parser } = require("json2csv");
const sendEmail = require("../utils/sendEmail");
/**
 * THE CORE ENGINE: Haversine Formula
 * Calculates the great-circle distance between two points on Earth in meters.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.floor(R * c);
};

/**
 * @desc    Handle an employee punching in or out (Mode A: Geo-Fenced)
 * @route   POST /api/attendance/punch
 * @access  Private
 */
const handlePunch = async (req, res) => {
  try {
    const { latitude, longitude, action } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude || !action) {
      return res
        .status(400)
        .json({ message: "GPS coordinates and action are required." });
    }
    if (!["Punch In", "Punch Out"].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be "Punch In" or "Punch Out".',
      });
    }

    // 1. Fetch all active zones
    let zones = [];

    if (req.user.trackingMode === "Geo-Fenced") {
      if (!req.user.assignedZone) {
        return res.status(400).json({
          message: "No zone assigned to user",
        });
      }

      const assignedZone = await Zone.findById(req.user.assignedZone);

      if (!assignedZone) {
        return res.status(404).json({
          message: "Assigned zone not found",
        });
      }

      zones = [assignedZone];
    } else {
      zones = await Zone.find();
    }
    if (zones.length === 0) {
      return res
        .status(400)
        .json({ message: "No active zones configured by Admin." });
    }

    // 2. Find the closest zone to the user
    let nearestZone = null;
    let shortestDistance = Infinity;

    zones.forEach((zone) => {
      const dist = calculateDistance(
        zone.latitude,
        zone.longitude,
        latitude,
        longitude,
      );
      if (dist < shortestDistance) {
        shortestDistance = dist;
        nearestZone = zone;
      }
    });

    // 3. Validation Logic: Are they inside the radius of the closest zone?
    let isInsideZone = true;

    if (req.user.trackingMode === "Geo-Fenced") {
      isInsideZone = shortestDistance <= nearestZone.radius;
    }

    const status = isInsideZone ? "Success" : "Failed";

    // 4. Create the Immutable Audit Log
    const log = await Attendance.create({
      user: userId,
      action: action,
      status: status,
      distanceMeters:
        req.user.trackingMode === "Geo-Fenced" ? shortestDistance : null,
      recordedLocation: { latitude: latitude, longitude: longitude },
      nearestZone:
        req.user.trackingMode === "Geo-Fenced" ? nearestZone._id : null,
    });
    await createAuditLog({
      userId,
      actionType: action,
      targetId: log._id,
      targetModel: "Attendance",
      details: {
        latitude,
        longitude,
      },
      ipAddress: req.ip,
    });

    // 5. Populate and Broadcast via Socket.IO
    const populatedLog = await Attendance.findById(log._id)
      .populate("user", "name email role")
      .populate("nearestZone", "name");

    const io = req.app.get("io");
    if (io) {
      io.emit("newAttendanceLog", populatedLog);
    }

    // 6. Respond based on status
    if (req.user.trackingMode === "Geo-Fenced" && !isInsideZone) {
      return res.status(403).json({
        message: `Access Denied: You are ${shortestDistance}m away. Must be within ${nearestZone.radius}m of ${nearestZone.name}.`,
        log: populatedLog,
      });
    }
    res.status(200).json({
      message:
        req.user.trackingMode === "Geo-Fenced"
          ? `Successfully punched ${action.split(" ")[1].toLowerCase()} at ${nearestZone.name}.`
          : `Successfully punched ${action.split(" ")[1].toLowerCase()}.`,
      log: populatedLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all attendance logs (For Admin/Editor Dashboard)
 * @route   GET /api/attendance/logs
 * @access  Private (Admin & Editor only)
 */
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const status = req.query.status;

    const action = req.query.action;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (action) {
      query.action = action;
    }

    let logsQuery = Attendance.find(query)
      .populate("user", "name email role")
      .populate("nearestZone", "name")
      .sort({ createdAt: -1 });

    if (search) {
      logsQuery = logsQuery.populate({
        path: "user",
        match: {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      });
    }

    const logs = await logsQuery.skip(skip).limit(limit);

    const filteredLogs = logs.filter((log) => log.user);

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      logs: filteredLogs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Receive live GPS ping and update user's last activity (Mode B: Remote)
 * @route   POST /api/attendance/ping
 * @access  Private
 */
const handleRemotePing = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required." });
    }

    // 1. Save the coordinate to the breadcrumb trail
    await LiveLocation.create({
      user: userId,
      latitude: latitude,
      longitude: longitude,
    });
    await createAuditLog({
      userId,
      actionType: "Remote Ping",
      targetModel: "LiveLocation",
      details: { latitude, longitude },
      ipAddress: req.ip,
    });
    // 2. Update User's last activity timestamp for stale-checking
    await User.findByIdAndUpdate(userId, { lastPing: new Date() });

    // 3. Broadcast instantly to the Admin Map
    const io = req.app.get("io");
    if (io) {
      io.emit("liveLocationUpdate", {
        userId,
        name: req.user.name,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    }
    res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Manual Audit Correction (Editor power to fix mistakes)
 * @route   PUT /api/attendance/logs/:id
 * @access  Private (Admin & Editor only)
 */
const updateLogStatus = async (req, res) => {
  try {
    const { action, createdAt, status } = req.body;
    const logId = req.params.id;

    if (!["Punch In", "Punch Out"].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be "Punch In" or "Punch Out".',
      });
    }

    // Update the log and mark it as edited for transparency
    const updatedLog = await Attendance.findByIdAndUpdate(
      logId,
      { action, createdAt, status, isEdited: true },
      { new: true },
    )
      .populate("user", "name email")
      .populate("nearestZone", "name");
    await createAuditLog({
      userId: req.user._id,
      actionType: "Audit Correction",
      targetId: updatedLog._id,
      targetModel: "Attendance",
      details: { action, createdAt, status },
      ipAddress: req.ip,
    });
    res.status(200).json(updatedLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Identify users in Remote mode who have stopped pinging
 * @route   GET /api/attendance/stale-users
 * @access  Private (Admin & Editor only)
 */
const getStaleUsers = async (req, res) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const staleUsers = await User.find({
      trackingMode: "Remote",
      lastPing: { $lt: tenMinutesAgo },
    }).select("name email lastPing");

    for (const user of staleUsers) {
      await createAuditLog({
        userId: req.user._id,
        actionType: "Stale User Detected",
        targetId: user._id,
        targetModel: "User",
        details: {
          staleUser: user.email,
          lastPing: user.lastPing,
        },
        ipAddress: req.ip,
      });
      const admins = await User.find({
        role: { $in: ["Admin", "Editor"] },
      }).select("email name");

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,

          subject: "FieldTrack Pro - Stale User Alert",

          text: `
Employee ${user.name} has stopped sending GPS updates.

Last Ping:
${user.lastPing}
        `,

          html: `
            <h2>Stale User Alert</h2>

            <p>
                Employee <strong>${user.name}</strong>
                has stopped sending GPS updates.
            </p>

            <p>
                <strong>Last Ping:</strong>
                ${user.lastPing}
            </p>
        `,
        });
      }
      const io = req.app.get("io");

      if (io) {
        io.emit("staleUserDetected", {
          userId: user._id,
          name: user.name,
          email: user.email,
          lastPing: user.lastPing,
        });
      }
    }

    res.status(200).json(staleUsers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error checking stale users",
      error: error.message,
    });
  }
};
const exportAttendanceCSV = async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate("user", "name email")
      .populate("nearestZone", "name")
      .sort({ createdAt: -1 });

    const formattedLogs = logs.map((log) => ({
      employeeName: log.user?.name || "",
      employeeEmail: log.user?.email || "",
      action: log.action,
      status: log.status,
      distanceMeters: log.distanceMeters,
      latitude: log.recordedLocation?.latitude,
      longitude: log.recordedLocation?.longitude,
      nearestZone: log.nearestZone?.name || "",
      edited: log.isEdited,
      createdAt: log.createdAt,
    }));

    const parser = new Parser();

    const csv = parser.parse(formattedLogs);

    res.header("Content-Type", "text/csv");

    res.attachment("attendance-logs.csv");

    return res.send(csv);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error exporting CSV",
      error: error.message,
    });
  }
};
module.exports = {
  handlePunch,
  getLogs,
  handleRemotePing,
  updateLogStatus,
  getStaleUsers,
  exportAttendanceCSV,
};
