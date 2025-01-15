const express = require('express');
const {processSectionsInRebarObject, generateObjectQuantitiesExcel} = require("../services/RebarService");
const router = express.Router();

router.post('/calcNetSets', async (req, res) => {
    const { bucket_name, s3_object_folder, nets_areas_dict } = req.body;

    try {
        const { sectionResults, subTablesList } = await processSectionsInRebarObject(bucket_name, s3_object_folder, nets_areas_dict);
        const outputBuffer = await generateObjectQuantitiesExcel(subTablesList, sectionResults);
        res.setHeader('Content-Disposition', 'attachment; filename=quantities.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(outputBuffer);
    } catch (error) {
        console.error('Error generating quantities:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
