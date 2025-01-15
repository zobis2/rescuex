const express = require('express');
const router = express.Router();
const { captureImageFromPTZ } = require('../services/ptzService');

router.post('/', async (req, res) => {
    const { camera_metadata } = req.body;

    try {
        const { image, pan, tilt, zoom } = await captureImageFromPTZ(camera_metadata);
        const base64Image = `data:image/jpeg;base64,${image.toString('base64')}`;
        res.status(200).json({ image: base64Image, pan, tilt, zoom });
    } catch (error) {
        console.error('Error capturing image:', error);
        res.status(500).json({ message: 'Error capturing image' });
    }
});

module.exports = router;
