const {cloudwatchlogs} = require("./awsServices");


async function fetchLogStreams(logGroupName) {
    let nextToken = null;
    let logStreams = [];

    while (true) {
        const params = {
            logGroupName,
            nextToken,
        };

        try {
            const logData = await cloudwatchlogs.describeLogStreams(params).promise();
            logStreams = logStreams.concat(logData.logStreams);
            nextToken = logData.nextToken;

            if (!nextToken) {
                break;
            }
        } catch (error) {
            console.error('Error describing log streams', error);
                return [];
        }
    }

    return logStreams;
}

async function fetchLogEvents(logGroupName, logStreamName) {
    let nextToken = null;
    let results=[];
    while (true) {
        const params = {
            logGroupName,
            logStreamName,
            startFromHead: true,
            nextToken,
        };

        try {
            const logData = await cloudwatchlogs.getLogEvents(params).promise();
            nextToken = logData.nextForwardToken;

            logData.events.forEach((event) => {
                // console.log(`[${logStreamName}] ${event.message}`);
                // console.log(`[${new Date(event.timestamp).toISOString()}] ${event.message}`);
                results.push(event);
            });

            if (logData.events.length === 0) {
                break;
            }
        } catch (error) {
            console.error('Error fetching logs', error);
            break;
        }
    }
    return results;
}

async function fetchAllLogs(logGroupName) {
    let logStreams = await fetchLogStreams(logGroupName);
    if(logStreams.length === 0) return [];
    logStreams.sort((a, b) => a.creationTime - b.creationTime);
    logStreams =[logStreams[logStreams.length - 1]]; //fetch last logs
    for (const logStream of logStreams) {
       const logs= await fetchLogEvents(logGroupName, logStream.logStreamName);
        return logs;
    }
}





const {awsBatch} = require("./awsServices");

async function getBatchJobLogStream(jobId) {
    const params = {
        jobs: [jobId]
    };

    try {
        const data = await awsBatch.describeJobs(params).promise();
        if (data.jobs.length === 0) {
            console.error('No jobs found with the provided jobId');
            return null;
        }

        const job = data.jobs[0];
        const logStreamName = job.container && job.container.logStreamName;

        if (!logStreamName) {
            console.error('No log stream name found for the job');
            return null;
        }

        return logStreamName;
    } catch (error) {
        console.error('Error describing the job', error);
        return null;
    }
}

async function getJobIdByName(jobName, jobQueue) {
    const params = {
        jobQueue: jobQueue,
        filters: [
            {
                name: 'JOB_NAME',

                values: [jobName]
            }
        ],
        maxResults: 100  // You can increase this if necessary
    };

    try {
        const data = await awsBatch.listJobs(params).promise();

        const jobSummary = data.jobSummaryList.find(job => job.jobName === jobName);

        if (!jobSummary) {
            console.error(`Job with name ${jobName} not found`);
            return null;
        }

        return jobSummary.jobId;
    } catch (error) {
        console.error('Error listing jobs', error);
        return null;
    }
}

async function getJobSummaries(jobName, jobQueue) {
    const params =  {
        jobQueue: jobQueue,
        filters: [
            {
                name: 'JOB_NAME',
                values: [jobName]
            }
        ],
        maxResults: 100  // Increase this if necessary
    };

    try {
        const data = await awsBatch.listJobs(params).promise();
        return data.jobSummaryList;
    } catch (error) {
        console.error('Error retrieving job summaries', error);
        return [];
    }
}

const getLogsForProject=async(projectName)=>{
    const jobQueue='DroneYardJobQueue1BD9E56-5FrS0hM7STlj5PR4';

    const jobSummaryList = await getJobSummaries("DroneYard-"+projectName, jobQueue);


    const logGroupName = '/aws/batch/job';  // Replace with your actual log group name

    // Process each job to fetch logs and append them to the job summary
    const jobsWithLogs = await Promise.all(
        jobSummaryList.map(async (jobSummary) => {
            const logStreamName = await getBatchJobLogStream(jobSummary.jobId);
            let logs = [];
            let startTime = null;
            let endTime = null;

            if (logStreamName) {
                logs = await fetchLogEvents(logGroupName, logStreamName);
                startTime = logs.length > 0 ? logs[0].timestamp : null;
                endTime = logs.length > 0 ? logs[logs.length - 1].timestamp : null;
            }

            return {
                ...jobSummary,
                startTime,
                endTime,
                logs
            };
        })
    );

    return jobsWithLogs;
}

module.exports = {fetchAllLogs,getLogsForProject}
