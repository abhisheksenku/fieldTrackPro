const express = require("express");

const router = express.Router();

const {
  getSummaryAnalytics,

  getHourlyAnalytics,

  getZoneAnalytics,

  getStaleUsersAnalytics,
} = require("../controllers/analyticsController");

const {
  authMiddleware,

  roleMiddleware,
} = require("../middleware/authMiddleware");

router.use(authMiddleware, roleMiddleware("Admin", "Editor"));

router.get("/summary", getSummaryAnalytics);

router.get("/hourly", getHourlyAnalytics);

router.get("/zones", getZoneAnalytics);

router.get("/stale-users", getStaleUsersAnalytics);

module.exports = router;
