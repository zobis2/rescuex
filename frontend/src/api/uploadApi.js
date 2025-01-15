import axios from '../axiosConfig'
const UPLOAD_ORTHOPHOTO_URL = '/api/upload/orthophoto/file'
const UPLOAD_ORTHOPHOTO_SETTINGS_URL = '/api/upload/orthophoto/settings'
const EXECUTE_ORTHOPHOTO = '/api/upload/orthophoto/execute'
const REEXECUTE_ORTHOPHOTO_URL = '/api/upload/orthophoto/reExecute'
const UPLOAD_SINGLE_FILE_URL = '/api/upload/single-file'
const UPLOAD_MULTIPLE_IMAGES_URL = '/api/upload/multiple-images'

export const uploadOrthophoto = async (
  formData,
  file,
  totalFilesUploaded,
  setUploadProgress
) => {
  try {
    const response = await axios.post(UPLOAD_ORTHOPHOTO_URL, formData, {
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent
        const progress = Math.round((loaded / total) * 100)

        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [file.name]: progress,
        }))

        if (progress > 90) {
          totalFilesUploaded[file.name] = progress
        }
      },
    })

    return response.data
  } catch (error) {
    throw new Error('Error uploading orthophoto')
  }
}

export const uploadOrthophotoSettings = async (
  settings,
  bucketName,
  projectName
) => {
  try {
    const response = await axios.post(UPLOAD_ORTHOPHOTO_SETTINGS_URL, {
      settings,
      bucketName,
      projectName,
    })
    return response.data
  } catch (error) {
    throw new Error('Error uploading orthophoto')
  }
}

export const executeOrthophoto = async (bucketName, projectName) => {
  try {
    const response = await axios.post(EXECUTE_ORTHOPHOTO, {
      bucketName,
      projectName,
    })
    return response.data
  } catch (error) {
    throw new Error('Error uploading orthophoto')
  }
}

export const reExecuteOrthophoto = async function (
  bucketName,
  settings,
  projectName
) {
  try {
    const response = await axios.post(REEXECUTE_ORTHOPHOTO_URL, {
      bucketName,
      settings,
      projectName,
    })
    return response.data
  } catch (error) {
    console.error('Error re-executing orthophoto:', error)
    throw new Error('Failed to re-execute orthophoto')
  }
}

export const uploadSingleFile = async (formData) => {
  try {
    const response = await axios.post(UPLOAD_SINGLE_FILE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    throw new Error('Error uploading single file')
  }
}

export const uploadMultipleImages = async (formData) => {
  try {
    const response = await axios.post(UPLOAD_MULTIPLE_IMAGES_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    throw new Error('Error uploading multiple images')
  }
}
