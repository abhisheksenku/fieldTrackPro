const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({
    userId,
    actionType,
    targetId = null,
    targetModel = null,
    details = {},
    ipAddress = null
}) => {
    try {
        await AuditLog.create({
            user: userId,
            actionType,
            targetId,
            targetModel,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Audit log error:', error.message);
    }
};

module.exports = createAuditLog;