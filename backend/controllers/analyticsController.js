const Attendance = require("../models/Attendance");

const User = require("../models/User");

// SUMMARY KPI
const getSummaryAnalytics = async (req, res) => {
  try {
    const totalPunches = await Attendance.countDocuments();

    const successfulPunches = await Attendance.countDocuments({
      status: "Success",
    });

    const failedPunches = await Attendance.countDocuments({
      status: "Failed",
    });

    const complianceRate =
      totalPunches === 0
        ? 0
        : Math.round((successfulPunches / totalPunches) * 100);

    res.status(200).json({
      totalPunches,

      successfulPunches,

      failedPunches,

      complianceRate,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// HOURLY CHART
const getHourlyAnalytics = async (req, res) => {
  try {
    const logs = await Attendance.find();

    const hourCounts = new Array(24).fill(0);

    logs.forEach((log) => {
      const hour = new Date(log.createdAt).getHours();

      hourCounts[hour]++;
    });

    const labels = [];

    const data = [];

    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);

      data.push(hourCounts[i]);
    }

    res.status(200).json({
      labels,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ZONE COMPLIANCE
const getZoneAnalytics = async (req, res) => {
  try {
    const logs = await Attendance.find()

      .populate("nearestZone");

    const zoneStats = {};

    logs.forEach((log) => {
      const zoneName = log.nearestZone?.name || "Unknown Zone";

      if (!zoneStats[zoneName]) {
        zoneStats[zoneName] = {
          success: 0,

          failed: 0,
        };
      }

      if (log.status === "Success") {
        zoneStats[zoneName].success++;
      } else {
        zoneStats[zoneName].failed++;
      }
    });

    res.status(200).json(zoneStats);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// STALE USERS
const getStaleUsersAnalytics = async (req, res) => {
  try {
    const threshold = new Date(Date.now() - 5 * 60 * 1000);

    const staleUsers = await User.find({
      trackingMode: "Remote",

      lastPing: {
        $lt: threshold,
      },
    })

      .select("name email lastPing");

    res.status(200).json({
      count: staleUsers.length,

      users: staleUsers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getSummaryAnalytics,

  getHourlyAnalytics,

  getZoneAnalytics,

  getStaleUsersAnalytics,
};
