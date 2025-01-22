require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`Error handling request for ${req.method} ${req.url}:`, err);
    res.status(500).json({ message: 'An internal server error occurred.' });
});
// Middleware to log all requests
app.use((req, res, next) => {
    console.log(new Date(),`Incoming request: ${req.method} ${req.url}`);
    next();
});

const placeHolderRoutes = require('./routes/placeHolders');
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const userRoutes = require('./routes/user');

// const downloadRoutes = require('./routes/download');
// const calcQuantitiesRoute = require('./routes/calcQuantities');
// const awsLogsRoute = require('./routes/awsLogs');
// const folderRoutes = require('./routes/folder');
// const uploadRoutes = require('./routes/upload');
// const captureImageRoutes = require('./routes/captureImage');
// const rtspRoutes = require('./routes/rtsp');

//
// app.use('/api/folder', folderRoutes);
// app.use('/api/captureImage/', captureImageRoutes);
// app.use('/api/calcQuantities', calcQuantitiesRoute);
app.use('/api/auth/', authRoutes);
app.use('/api/placeHolder/', placeHolderRoutes);
app.use('/api/projects/', projectsRoutes);
app.use('/api/users/', userRoutes);

// app.use('/api/download', downloadRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/awsLogs', awsLogsRoute);
// app.use('/api/rtsp', rtspRoutes);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
