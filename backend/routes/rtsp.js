const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const axios = require("axios");
const fs = require('fs').promises; // Use the Promise-based fs module
const router = express.Router();

const CAMERA_IP = process.env.CAMERA_IP || '192.168.1.200';  // Use environment variable for the camera IP
const streamLink = 'rtsp://admin:TaylorBruno8282@46.210.90.138:1024/';

const cameras = [
    { id: 1, url: streamLink },
    { id: 2, url: `rtsp://${CAMERA_IP}:554/chID=2&streamType=main&linktype=tcp` },
    { id: 3, url: `rtsp://${CAMERA_IP}:554/chID=3&streamType=main&linktype=tcp` },
    { id: 4, url: `rtsp://${CAMERA_IP}:554/chID=4&streamType=main&linktype=tcp` },
    { id: 5, url: `rtsp://${CAMERA_IP}:554/chID=5&streamType=main&linktype=tcp` },
    { id: 6, url: `rtsp://${CAMERA_IP}:554/chID=6&streamType=main&linktype=tcp` },
    { id: 7, url: `rtsp://${CAMERA_IP}:554/chID=7&streamType=main&linktype=tcp` },
    { id: 8, url: `rtsp://${CAMERA_IP}:554/chID=8&streamType=main&linktype=tcp` },
];

// Utility function to execute shell commands
const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });
    });
};

router.get('/snapshot/', async (req, res) => {
    // const cameraId = parseInt(req.params.id, 10);
    // const camera = cameras.find(c => c.id === cameraId);
    const selectedCamera=req.query;
    if (!selectedCamera) {
        return res.status(404).send('Camera not found');
    }
    const{router_ip,RTSP_port,username,password,camera_name,HTTP_port}=selectedCamera;
    // console.log(new Date(),"snapshot request", camera_name);

    const camera={
        rtsp_url:`rtsp://${username}:${password}@${router_ip}:${RTSP_port}/`
        ,http_url:`http://${router_ip}:${HTTP_port}/`
    };

    try {

        // setImageSrc(null);
        // try{
        //
        //     const http_check = await axios.get(camera.http_url);
        // let x=0;
        // }
        // catch(error){
        //     debugger;
        //     return;// Clear any previous errors on successful fetch
        //
        // }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `camera${camera_name}-${timestamp}.jpg`;
        const filepath = path.join('/tmp/', filename);
        // Capture a single frame from the RTSP stream
        let command = `ffmpeg -i "${camera.url}" -frames:v 1 -q:v 2 "${filepath}"`;
         command = `ffmpeg -rtsp_transport tcp -i "${camera.rtsp_url}" -frames:v 1 -q:v 20 "${filepath}"`;

        await execCommand(command);

        // Read the captured image file
        const data = await fs.readFile(filepath);

        // Convert image data to Base64 and send the response
        const base64Image = Buffer.from(data).toString('base64');
        // console.log(new Date(),"snapshot Sent", camera);

        res.send(`data:image/jpeg;base64,${base64Image}`);

        // Delete the file after sending the response
        await fs.unlink(filepath);
    } catch (error) {
        console.error(`Error capturing image from camera ${camera_name}: ${error.message}`);
        res.status(500).send('Error capturing image');
    }
});

module.exports = router;
