const express = require('express');
const { writeProject, readProjects, updateProject, getProjectImages} = require('../services/google/googleSheets');
const {isPointInPolygon} = require("../services/shapes/polygoneFinder");
const router = express.Router();
const spreadsheetId = '1MvTdL_LA-Qiz5vZI8DsD_qIY-Yya3Ywg9XaVbnNSAjE';
router.post('/polygon/query', async (req, res) => {
    try {
        const {coordinates} = req.body; // { city, street, number }
        const shapefilePath = 'rawDatabase/test.shp';
        const info = await isPointInPolygon(shapefilePath, coordinates);

        res.json(info);
    } catch (error) {
        console.error('Error fetching polygon info:', error);
        res.status(500).json({ error: 'Failed to fetch  polygon info' });
    }
});
router.post('/get-images', async (req, res) => {
    try {
        const projectDetails = req.body; // { city, street, number }
        const images = await getProjectImages(projectDetails); // Fetch images
        res.json(images);
    } catch (error) {
        console.error('Error fetching project images:', error);
        res.status(500).json({ error: 'Failed to fetch project images' });
    }
});
// Get all projects
router.get('/get', async (req, res) => {
    try {
        const projects = await readProjects(spreadsheetId);
        res.json(projects);
    } catch (error) {
        console.error('Error reading projects:', error);
        res.status(500).send('Error reading projects');
    }
});

// Add a new project
router.post('/', async (req, res) => {
    try {
        const project = req.body.values;
        await writeProject(spreadsheetId, project);
        res.status(201).send('Project added');
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).send('Error adding project');
    }
});

// Update an existing project
router.put('/:rowNumber', async (req, res) => {
    try {
        const project = req.body.values;
        const { rowNumber } = req.params;
        await updateProject(spreadsheetId, rowNumber, project);
        res.status(200).send('Project updated');
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).send('Error updating project');
    }
});

module.exports = router;
