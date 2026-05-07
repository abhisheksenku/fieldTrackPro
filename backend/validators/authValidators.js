const { body } = require('express-validator');

const registerValidator = [

    body('name')
        .notEmpty()
        .withMessage('Name is required'),

    body('email')
        .isEmail()
        .withMessage('Valid email required'),

    body('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters')
];

const loginValidator = [

    body('email')
        .isEmail()
        .withMessage('Valid email required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

module.exports = {
    registerValidator,
    loginValidator
};