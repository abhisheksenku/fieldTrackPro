const mongoose = require("mongoose");
const User = require("../models/User");
const createAuditLog = require("../utils/auditLogger");
const Zone = require("../models/Zone");
//get all users: GET /api/users
// Admin only
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };

    const total = await User.countDocuments(searchQuery);

    const users = await User.find(searchQuery)

      .select("-password")

      .populate("assignedZone")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(limit);

    res.status(200).json({
      users,

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      totalUsers: total,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
//update user role: PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    if (!["Admin", "Editor", "User"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();
    await createAuditLog({
      userId: req.user._id,
      actionType: "Role Change",
      targetId: user._id,
      targetModel: "User",
      details: { updateUser: user.email, newRole: role },
      ipAddress: req.ip,
    });
    res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//delete a user: DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }
    if (user._id.toString() === req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }
    await createAuditLog({
      userId: req.user._id,
      actionType: "User Deletion",
      targetId: user._id,
      targetModel: "User",
      details: { deletedUser: user.email },
      ipAddress: req.ip,
    });
    await user.deleteOne();
    await session.commitTransaction();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateUserZone = async (req, res) => {
  try {
    const userId = req.params.id;

    const { assignedZone } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Allow null for remote users
    if (assignedZone) {
      const zone = await Zone.findById(assignedZone);

      if (!zone) {
        return res.status(404).json({
          message: "Zone not found",
        });
      }
    }

    user.assignedZone = assignedZone || null;

    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("assignedZone");

    res.status(200).json({
      message: "Zone assigned successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const updateTrackingMode = async (req, res) => {
  try {
    const userId = req.params.id;

    const { trackingMode } = req.body;

    if (!["Geo-Fenced", "Remote"].includes(trackingMode)) {
      return res.status(400).json({
        message: "Invalid tracking mode",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.trackingMode = trackingMode;

    // Optional cleanup
    if (trackingMode === "Remote") {
      user.assignedZone = null;
    }

    await user.save();

    await createAuditLog({
      userId: req.user._id,

      actionType: "Tracking Mode Change",

      targetId: user._id,

      targetModel: "User",

      details: {
        updatedUser: user.email,

        trackingMode,
      },

      ipAddress: req.ip,
    });

    const updatedUser = await User.findById(userId)

      .select("-password")

      .populate("assignedZone");

    res.status(200).json({
      message: "Tracking mode updated successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};
module.exports = { getUsers, updateUserRole, deleteUser, updateUserZone, updateTrackingMode };
