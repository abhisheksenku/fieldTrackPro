const Consent = require('../models/Consent');

const saveConsent = async (req, res) => {
    try {
        const userId = req.user._id;

        const existingConsent = await Consent.findOne({ user: userId });

        if (existingConsent) {
            return res.status(400).json({
                message: 'Consent already recorded'
            });
        }

        const consent = await Consent.create({
            user: userId,
            consentGiven: true,
            ipAddress: req.ip
        });

        res.status(201).json({
            message: 'Consent recorded successfully',
            consent
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { saveConsent };