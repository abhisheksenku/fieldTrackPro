const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/mongodb");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const startStaleUserChecker = require("./utils/staleUserChecker");
const { authLimiter } = require("./middleware/rateLimiter");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io); // Make io accessible in routes/controllers via req.app.get('io')
startStaleUserChecker(io); // Start the stale user checker with the Socket.IO instance
io.on("connection", (socket) => {
  logger.info("New client connected: " + socket.id);
  socket.on("disconnect", () => {
    logger.info("Client disconnected: " + socket.id);
  });
});
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
// Allow the Vite frontend to talk to the Express backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
// import routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authLimiter, authRoutes);
const zoneRoutes = require("./routes/zoneRoutes");
app.use("/api/zones", zoneRoutes);
const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);
const userManageRoutes = require("./routes/userManageRoutes");
app.use("/api/users", userManageRoutes);
const consentRoutes = require("./routes/consentRoutes");
app.use("/api/consent", consentRoutes);
const auditLogRoutes = require("./routes/auditLogRoutes");
app.use("/api/audit-logs", auditLogRoutes);
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);
// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    message: "Something went wrong!",
  });
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
