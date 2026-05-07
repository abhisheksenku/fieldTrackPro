const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 20,

    message: {
        message: 'Too many authentication attempts. Try again later.'
    },

    standardHeaders: true,

    legacyHeaders: false
});

const pingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,

    max: 120,

    message: {
        message: 'Too many GPS requests.'
    },

    standardHeaders: true,

    legacyHeaders: false
});

module.exports = {
    authLimiter,
    pingLimiter
};