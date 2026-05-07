const Consent = require('../models/Consent');

const checkConsent = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const consent = await Consent.findOne({
            user: userId,
            consentGiven: true
        });

        if (!consent) {
            return res.status(403).json({
                message: 'Location tracking consent required'
            });
        }

        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = checkConsent;