const cron = require('node-cron');

const User = require('../models/User');

const sendEmail = require('../utils/sendEmail');

const createAuditLog = require('../utils/auditLogger');

const startStaleUserChecker = (io) => {

    cron.schedule('*/2 * * * *', async () => {

        try {

            const tenMinutesAgo = new Date(
                Date.now() - 10*60*1000
            );

            const staleUsers = await User.find({
                trackingMode: 'Remote',
                lastPing: { $lt: tenMinutesAgo }
            });

            if (staleUsers.length === 0) {
                return;
            }

            const admins = await User.find({
                role: { $in: ['Admin', 'Editor'] }
            }).select('name email');

            for (const staleUser of staleUsers) {

                for (const admin of admins) {

                    await sendEmail({
                        to: admin.email,

                        subject:
                            'FieldTrack Pro - Stale User Alert',

                        text: `
Employee ${staleUser.name} stopped sending GPS updates.

Last Ping:
${staleUser.lastPing}
                        `,

                        html: `
                            <h2>Stale User Alert</h2>

                            <p>
                                Employee
                                <strong>${staleUser.name}</strong>
                                stopped sending GPS updates.
                            </p>

                            <p>
                                <strong>Last Ping:</strong>
                                ${staleUser.lastPing}
                            </p>
                        `
                    });
                }

                await createAuditLog({
                    userId: staleUser._id,
                    actionType: 'Automatic Stale User Detection',
                    targetId: staleUser._id,
                    targetModel: 'User',
                    details: {
                        email: staleUser.email,
                        lastPing: staleUser.lastPing
                    }
                });

                if (io) {

                    io.emit('staleUserDetected', {
                        userId: staleUser._id,
                        name: staleUser.name,
                        email: staleUser.email,
                        lastPing: staleUser.lastPing
                    });
                }
            }

        } catch (error) {

            console.error(
                'Stale User Checker Error:',
                error.message
            );
        }
    });
};

module.exports = startStaleUserChecker;