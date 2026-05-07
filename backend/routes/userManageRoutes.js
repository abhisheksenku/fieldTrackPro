const express = require('express');

const router = express.Router();

const {
    getUsers,
    updateUserRole,
    updateUserZone,
    deleteUser,
    updateTrackingMode
} = require('../controllers/userController');

const {
    authMiddleware,
    roleMiddleware
} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management APIs
 */

// Protect all routes
router.use(
    authMiddleware,
    roleMiddleware('Admin')
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: john
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - Admin
 *                   - Editor
 *                   - User
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 */
router.put(
    '/:id/role',
    updateUserRole
);

/**
 * @swagger
 * /api/users/{id}/zone:
 *   put:
 *     summary: Assign zone to user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedZone:
 *                 type: string
 *                 nullable: true
 *                 example: 681ad8a9f0f0f0f0f0f0f0f0
 *     responses:
 *       200:
 *         description: Zone assigned successfully
 *       404:
 *         description: User or zone not found
 */
router.put(
    '/:id/zone',
    updateUserZone
);

/**
 * @swagger
 * /api/users/{id}/tracking-mode:
 *   put:
 *     summary: Update tracking mode
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackingMode
 *             properties:
 *               trackingMode:
 *                 type: string
 *                 enum:
 *                   - LIVE
 *                   - INTERVAL
 *                   - OFF
 *     responses:
 *       200:
 *         description: Tracking mode updated successfully
 *       404:
 *         description: User not found
 */
router.put(
    '/:id/tracking-mode',
    updateTrackingMode
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    deleteUser
);

module.exports = router;