const express = require('express');

const router = express.Router();

const {
    createZone,
    getZones,
    getZoneById,
    updateZone,
    deleteZone
} = require('../controllers/zoneController');

const {
    authMiddleware,
    roleMiddleware
} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Zones
 *     description: Geo-fence zone management APIs
 */

// Protect all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Get all geo-fence zones
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Zones fetched successfully
 */
router.get('/', getZones);

/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Create a geo-fence zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - latitude
 *               - longitude
 *               - radius
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               radius:
 *                 type: number
 *     responses:
 *       201:
 *         description: Zone created successfully
 */
router.post(
    '/',
    roleMiddleware('Admin'),
    createZone
);

/**
 * @swagger
 * /api/zones/{id}:
 *   get:
 *     summary: Get single zone by ID
 *     tags: [Zones]
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
 *         description: Zone fetched successfully
 *       404:
 *         description: Zone not found
 */
router.get(
    '/:id',
    getZoneById
);

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Update geo-fence zone
 *     tags: [Zones]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               radius:
 *                 type: number
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       404:
 *         description: Zone not found
 */
router.put(
    '/:id',
    roleMiddleware('Admin'),
    updateZone
);

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Delete geo-fence zone
 *     tags: [Zones]
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
 *         description: Zone deleted successfully
 *       404:
 *         description: Zone not found
 */
router.delete(
    '/:id',
    roleMiddleware('Admin'),
    deleteZone
);

module.exports = router;