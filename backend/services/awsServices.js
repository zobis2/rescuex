const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1'
});
// Configure AWS SDK
const cloudwatchlogs = new AWS.CloudWatchLogs();
const awsBatch = new AWS.Batch();
const awsS3 = new AWS.S3();

module.exports={cloudwatchlogs,awsBatch,awsS3}