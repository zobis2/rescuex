const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// Set up AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const sanitizeText=(text)=>{
   if(!text)return"";
    if(text.length<3){
        return text;
    }
    // text=text.replaceAll("[0m","");
    const removeIndex=text.indexOf("[0m");
    if(removeIndex<0){return text;}
    text=text.substring(0,removeIndex-1)
    return text;
}
function parseLogFile(logData) {
    const lines = logData.split('\n');
    let insights = {
        startTime: null,
        endTime: null,
        ramUsed: null,
        cpuUsed: null,
        os: null,
        downloadTime: null,
        generateTime: null,
        startOrthophotoAfter: null,
        settingsApplied: {},
        photos: [],
    };

    let downloadStartTime = null;
    let generateStartTime = null;
    let i=0
    for (let line of lines) {
        // Extract start time
// console.log(i++,line);
        // Extract orthophoto creation start time
        if (line.includes('running "/code/SuperBuild/install/bin/odm_orthophoto')) {
            insights.startOrthophotoAfter = line.substring(2,line.indexOf("[INFO"));
            continue;
        }
        if (line.includes('ODM app finished')) {
            const timeString = line.split('-')[1].trim();
            insights.endTime = sanitizeText(timeString);
            break;
        }
        if (line.includes('Initializing ODM')) {
            const timeString = line.split('-')[1].trim();
            insights.startTime = sanitizeText(timeString);
            continue;
        }
        // Extract settings
        if (line.includes('[INFO]    ==============')) {
            continue;
        }
        if (line.includes('[INFO]    Rerun all -- Removing old data')) {
            continue;
        }
        if (line.includes('[INFO]    ')) {
            const setting = line.split('[INFO]    ')[1].trim();
            const [key, value] = setting.split(': ');
            if(key.includes(' ')) {
                continue;
            }
            insights.settingsApplied[key] = sanitizeText(value).trim();
            continue;
        }
        // Extract photo matching info
        if (line.includes('DEBUG: Matching')) {
            const parts = line.split(' ');

            // Extract file names
            const file1 = parts[4].replace(',', '').trim();
            const file2 = parts[6].replace(',', '').trim();
            let file3 = null;
            if (parts[8] && !parts[8].startsWith('Matcher:')) {
                file3 = parts[8].replace(',', '').trim();
            }

            // Extract matcher info
            const matcherIndex = line.indexOf('Matcher:') + 8;
            const matcherEndIndex = line.indexOf('T-desc:');
            let matcher = line.substring(matcherIndex).trim();
            if (matcherEndIndex !== -1) {
                matcher = line.substring(matcherIndex, matcherEndIndex).trim();
            }

            // Extract status
            const statusIndex = line.indexOf('Matches:') + 8;
            const statusText = line.substring(statusIndex).trim();
            const status = statusText.includes('Success') ? 'SUCCESS' : 'FAILED';

            // Extract additional info
            const additionalInfoIndex = line.indexOf('Matcher:');
            const additionalInfo = line.substring(additionalInfoIndex).trim();

            insights.photos.push({
                files: file3 ? [file1, file2, file3] : [file1, file2],
                matcher,
                status,
                additionalInfo
            });

            continue;
        }


        // Extract RAM, CPU, and OS information
        if (line.includes('CPU:')) {
            insights.cpuUsed = line.split('CPU:')[1].trim();
            continue;
        }
        if (line.includes('RAM:')) {
            insights.ramUsed = line.split('RAM:')[1].trim();
            continue;
        }
        if (line.includes('OS:')) {
            insights.os = line.split('OS:')[1].trim();
            continue;
        }
        // Extract end time[39m[INFO]    - Tue Aug 06 10:56:19  2024[0m

    }
    const timeTaken=calculateTimeTaken(insights.startTime,insights.endTime);
    insights.timeTaken = timeTaken;
    return insights;
}
const calculateTimeTaken = (startTime, endTime) => {
    // startTime=sanitizeText(startTime);
    // endTime=sanitizeText(endTime);
    const diffMs = new Date(endTime) - new Date(startTime);
    const diffHrs = Math.floor(diffMs / 3600000); // hours
    const diffMins = Math.floor((diffMs % 3600000) / 60000); // minutes
    const diffSecs = Math.floor((diffMs % 60000) / 1000); // seconds
    return `${diffHrs}h ${diffMins}m ${diffSecs}s`;
};
async function fetchLogFileFromS3(bucket, key) {
    const params = {
        Bucket: bucket,
        Key: key
    };

    try {
        const data = await s3.getObject(params).promise();
        const logData = data.Body.toString('utf-8');
        const insights = parseLogFile(logData);
        console.log(insights);
        return insights;
    } catch (err) {
        console.error('Error fetching log file from S3', err);
        throw err;
    }
}
module.exports = {fetchLogFileFromS3};
// // Replace with your bucket name and key
// const bucketName = 'prod-drone-yard-droneyard-dronephotosbucket1549df6-1xcxnmmtvojj';
// const key = 'Electra_ConstructionBRKikar_Hamedina_Tower_CBRfloor_28BRCeilingBRtop-reinforcement/output/odm_Electra_ConstructionBRKikar_Hamedina_Tower_CBRfloor_28BRCeilingBRtop-reinforcement-process.log';
//
// fetchLogFileFromS3(bucketName, key)
//     .then(insights => {
//         // Do something with insights
//     })
//     .catch(err => {
//         console.error('Error:', err);
//     });
