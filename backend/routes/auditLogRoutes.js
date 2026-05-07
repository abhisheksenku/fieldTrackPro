const express = require('express');

const router = express.Router();

const { getAuditLogs } = require('../controllers/auditLogController');

const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.get(
    '/',
    authMiddleware,
    roleMiddleware('Admin', 'Editor'),
    getAuditLogs
);

module.exports = router;