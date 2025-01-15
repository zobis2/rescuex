import axios from "../axiosConfig"
const LIST_ITEMS_URL = '/api/download/list-items'
const DOWNLOAD_FILE_URL = '/api/download/download-file'
const LIST_ALL_KEYS_URL = '/api/download/list-all-keys'
const DOWNLOAD_ZIP_URL = '/api/download/download-zip'

export const listItems = async (currentPath) => {
  try {
    const response = await axios.get(LIST_ITEMS_URL, {
      params: { prefix: currentPath },
    })
    return response.data
  } catch (error) {
    throw new Error('Error listing items')
  }
}

export const downloadSingleFile = async (S3_BUCKET_NAME, key) => {
  try {
    const response = await axios.get(DOWNLOAD_FILE_URL, {
      params: { bucketName: S3_BUCKET_NAME, key },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw new Error('Error downloading file')
  }
}

export const listAllKeys = async (prefix) => {
  try {
    const response = await axios.get(LIST_ALL_KEYS_URL, {
      params: { prefix },
    })
    return response.data
  } catch (error) {
    throw new Error('Error listing all keys')
  }
}

export const downloadZip = async (S3_BUCKET_NAME, files, prefix) => {
  try {
    const response = await axios.post(
      DOWNLOAD_ZIP_URL,
      {
        bucketName: S3_BUCKET_NAME,
        keys: files,
        prefix,
      },
      {
        responseType: 'blob',
      }
    )
    return response.data
  } catch (error) {
    throw new Error('Error downloading zip')
  }
}
