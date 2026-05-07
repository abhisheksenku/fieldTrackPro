const express = require('express');

const router = express.Router();

const { saveConsent } = require('../controllers/consentController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, saveConsent);

module.exports = router;