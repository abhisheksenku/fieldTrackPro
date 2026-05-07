const Zone = require('../models/Zone');
const createAuditLog = require('../utils/auditLogger');
// Create a new Geo-fence zone: POST /api/zones
// Admin only
const createZone = async (req, res) => {
    try{
        const {name, description, latitude, longitude, radius} = req.body;
        if(!name || !latitude || !longitude || !radius){
            return res.status(400).json({message: 'Name, latitude, longitude and radius are required'});
        }
        const newZone = await Zone.create({name, description, latitude, longitude, radius});
        await createAuditLog({
            userId: req.user._id,
            actionType: "Zone Creation",
            targetId: newZone._id,
            targetModel: "Zone",
            details: { zoneName: newZone.name },
            ipAddress: req.ip,
        });
        res.status(201).json({message: 'Zone created successfully', zone: newZone});
    } catch (error) {
        res.status(500).json({message: 'Error creating zone', error: error.message});
    }
};
// Get all Geo-fence zones: GET /api/zones
// All logged in users can access this
const getZones = async (req, res) => {
    try {
        const zones = await Zone.find().sort({ createdAt: -1 });
        res.status(200).json({zones});
    } catch (error) {
        res.status(500).json({message: 'Error fetching zones', error: error.message});
    }
};
//delete a Geo-fence zone: DELETE /api/zones/:id
// Admin only
const deleteZone = async (req, res) => {
    try {
        const { id } = req.params;
        const zoneToDelete = await Zone.findByIdAndDelete(id);
        if (!zoneToDelete) {
            return res.status(404).json({message: 'Zone not found'});
        }
        await createAuditLog({
            userId: req.user._id,
            actionType: "Zone Deletion",
            targetId: zoneToDelete._id,
            targetModel: "Zone",
            details: { zoneName: zoneToDelete.name },
            ipAddress: req.ip,
        });
        res.status(200).json({message: 'Zone deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting zone', error: error.message});
    }
};
// get zone by id
const getZoneById = async (req, res) => {

    try {

        const zone =
            await Zone.findById(
                req.params.id
            );

        if (!zone) {

            return res.status(404).json({
                message:
                    'Zone not found'
            });
        }

        res.status(200).json(zone);

    } catch (error) {

        res.status(500).json({
            message:
                'Error fetching zone',
            error: error.message
        });
    }
};
// update zone
const updateZone = async (req, res) => {

    try {

        const updatedZone =
            await Zone.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedZone) {

            return res.status(404).json({
                message:
                    'Zone not found'
            });
        }

        res.status(200).json({

            message:
                'Zone updated successfully',

            zone: updatedZone
        });

    } catch (error) {

        res.status(500).json({
            message:
                'Error updating zone',
            error: error.message
        });
    }
};
module.exports = { createZone, getZones, getZoneById, updateZone, deleteZone };