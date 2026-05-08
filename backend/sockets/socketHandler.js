const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const configureSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user.role === "Admin" || socket.user.role === "Editor") {
      socket.join("admin-room");
    }

    socket.join(`user-${socket.user._id}`);

    logger.info(`User connected: ${socket.user.name} (${socket.id})`);

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = configureSocket;
