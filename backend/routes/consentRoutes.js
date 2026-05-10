const express = require('express');

const router = express.Router();

const { saveConsent, getConsentStatus } = require('../controllers/consentController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, saveConsent);
router.get("/", authMiddleware, getConsentStatus);
module.exports = router;