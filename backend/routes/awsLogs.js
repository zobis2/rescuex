const { fetchAllLogs, getLogsForProject } = require('../services/fetchLogs')
const AWS = require('aws-sdk')

// Initialize the EC2 client
const ec2 = new AWS.EC2({ region: 'eu-central-1' })
const s3 = new AWS.S3()
const express = require('express')
const { fetchLogFileFromS3 } = require('../services/parseLogFile')
const { listObjects } = require('../services/listFiles')
const router = express.Router()
router.get('/logs', async (req, res) => {
  try {
    // Describe all instances filtered by the 'running' state
    const response = await ec2
      .describeInstances({
        Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
      })
      .promise()

    const runningInstances = []

    // Parse through the response to get instance details
    response.Reservations.forEach((reservation) => {
      reservation.Instances.forEach((instance) => {
        runningInstances.push({
          InstanceId: instance.InstanceId,
          InstanceType: instance.InstanceType,
          PublicIpAddress: instance.PublicIpAddress || 'N/A',
          PrivateIpAddress: instance.PrivateIpAddress || 'N/A',
        })
      })
    })
    const instancesIdsRunning = runningInstances.map((f) => f.InstanceId)
    const { projectName, instanceId, bucketName } = req.query
    const listS3 = await listObjects(bucketName, projectName + '/output_ec2/')
    let logsFromInstances = []
    for (log of listS3) {
      const key = log.Key
      const instanceId = key.match(/i-[a-f0-9]+/)[0]

      const data = await s3
        .getObject({ Bucket: bucketName, Key: key })
        .promise()
      const text = data.Body.toString()
      const logLines = text.split('\n')
      const logRegex =
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6,9}Z)\s+(.*)$/

      const parsedLogs = []

      // Extract timestamp and message for each line
      logLines.forEach((line) => {
        const match = line.match(logRegex)
        if (match) {
          const timestamp = match[1] // Extracted timestamp
          const message = match[2] // Extracted message
          parsedLogs.push({ timestamp, message })
        }
      })
      // Regex patterns for both "Launching DroneYard" and "ODM app finished"
      const startRegex =
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).*Launching DroneYard/
      const endRegex =
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z).*ODM app finished/

      const startMatch = text.match(startRegex)
      const endMatch = text.match(endRegex)

      let startTime = startMatch ? new Date(startMatch[1]) : null
      let endTime = endMatch ? new Date(endMatch[1]) : null
      let status = 'RUNNING'
      if (startTime && endTime) {
        status = 'SUCCEEDED'
      } else if (!instancesIdsRunning.includes(instanceId)) {
        status = 'FAILED'
        endTime = new Date(log.LastModified)
      }

      logsFromInstances.push({
        startTime,
        endTime,
        status,
        logs: parsedLogs,
        instanceId: instanceId,
        LastModified: log.LastModified,
      })

      let x = 0
    }
    logsFromInstances.sort((a, b) => b.LastModified - a.LastModified)

    res.json(logsFromInstances)
    return
    const logGroupName = '/aws/batch/job' // Replace with your log group name
    // Run the function to fetch log events from all log streams
    //         const logs = await fetchAllLogs(logGroupName);
    const logs = await getLogsForProject(projectName)
    res.json(logs)
  } catch (error) {
    res.status(500).send('Error fetching logs')
  }
})

router.get('/getLogInsights', async (req, res) => {
  const { bucketName, projectName } = req.query
  const key = `${projectName}/output/odm_${projectName}-process.log`

  try {
    const insights = await fetchLogFileFromS3(bucketName, key)
    res.json(insights)
  } catch (err) {
    res.status(500).send('Error fetching log file insights')
  }
})
module.exports = router
