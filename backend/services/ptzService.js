const { PTZCapture } = require('../controllers/ptzCapture'); // Import the PTZCapture class
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const axios = require('../axiosConfig');

const getCameraMetadata = async (bucket, key) => {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    try {
        const data = await s3.getObject(params).promise();
        return JSON.parse(data.Body.toString());
    } catch (error) {
        console.error('Error fetching camera metadata:', error);
        throw new Error('Could not fetch camera metadata.');
    }
};

const captureImageFromPTZ = async (cameraMeta) => {


    // if (!metadata || !metadata.cameras || metadata.cameras.length === 0) {
    //     throw new Error('No camera metadata available');
    // }
    //
    // const cameraMeta = metadata.cameras[0]; // Assuming we use the first camera in the list

    try {
        const response = await axios.post('/flask/capture_image_from_ptz', cameraMeta);

        if (response.status === 200) {
            const { image, pan, tilt, zoom } = response.data;
            return { image, pan, tilt, zoom };
        } else {
            throw new Error('Failed to capture image from PTZ camera.');
        }
    } catch (error) {
        console.error('Error capturing image from PTZ camera:', error);
        throw new Error('Error capturing image from PTZ camera.');
    }
};

module.exports = {
    captureImageFromPTZ,
};
