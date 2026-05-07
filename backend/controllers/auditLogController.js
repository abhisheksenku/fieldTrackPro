const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {

    try {

        const page =
            parseInt(req.query.page) || 1;

        const limit =
            parseInt(req.query.limit) || 10;

        const search =
            req.query.search || '';

        const skip =
            (page - 1) * limit;

        const searchQuery = {

            $or: [

                {
                    actionType: {
                        $regex: search,
                        $options: 'i'
                    }
                },

                {
                    targetModel: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ]
        };

        const total =
            await AuditLog.countDocuments(
                searchQuery
            );

        const logs =
            await AuditLog.find(
                searchQuery
            )

                .populate(
                    'user',
                    'name email role'
                )

                .sort({
                    createdAt: -1
                })

                .skip(skip)

                .limit(limit);

        res.status(200).json({

            logs,

            currentPage: page,

            totalPages:
                Math.ceil(
                    total / limit
                ),

            totalLogs: total
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { getAuditLogs };