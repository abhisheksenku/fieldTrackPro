const express = require('express');
const router = express.Router();
const { handlePunch, getLogs, handleRemotePing, updateLogStatus, getStaleUsers,exportAttendanceCSV} = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const checkConsent = require('../middleware/consentMiddleware');
const { pingLimiter } = require('../middleware/rateLimiter');
// Protect all routes
router.use(authMiddleware);

// Any logged in user can punch
router.post('/punch', checkConsent, handlePunch);
router.post('/ping', pingLimiter, checkConsent, handleRemotePing);
router.put('/logs/:id', roleMiddleware('Admin', 'Editor'), updateLogStatus);
// Only Admins and Editors can view the master logs
router.get('/logs', roleMiddleware('Admin', 'Editor'), getLogs);
// Only Admins can view stale users
router.get('/stale-users', roleMiddleware('Admin'), getStaleUsers);
router.get(
    '/export/csv',
    roleMiddleware('Admin', 'Editor'),
    exportAttendanceCSV
);
module.exports = router;