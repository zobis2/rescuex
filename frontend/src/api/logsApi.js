import axios from '../axiosConfig'
const LOG_INSIGHTS_URL = '/api/awsLogs/getLogInsights/'
const LOGS_URL = '/api/awsLogs/logs/'

export const getLogInsights = async (bucketName, projectName) => {
  try {
    const response = await axios.get(LOG_INSIGHTS_URL, {
      params: { bucketName, projectName },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching log insights')
  }
}

export const getLogs = async (
  projectName,
  instanceId = null,
  bucketName = null
) => {
  try {
    const response = await axios.get(LOGS_URL, {
      params: { projectName, instanceId, bucketName },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching logs')
  }
}
