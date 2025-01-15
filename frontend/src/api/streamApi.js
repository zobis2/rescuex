import axios from '../axiosConfig'
const SAVE_RTSP_STREAM = '/flask/save_rtsp_stream/'
const EXTRACT_BEST_FRAMES = '/flask/extract-best-frames'
const CALC_QUANTITIES_URL = '/flask/calc_quantities'
const COMPARE_REBARS_URL = '/flask/compare_rebars'
const CAPTURE_IMAGE_URL = '/api/captureImage'
const PROJECT_IMAGE_URL = '/api/project-image'
const RTSP_SNAPSHOT_URL = '/api/rtsp/snapshot/'
const VALIDATE_FILE_URL = '/flask/file-validation'

export const saveRtspStream = async (selectedCamera) => {
  try {
    const response = await axios.post(SAVE_RTSP_STREAM, selectedCamera)
    return response.data
  } catch (error) {
    throw new Error('Error saving rtsp stream')
  }
}

export const extractBestFrames = async (
  s3_bucket_video,
  s3_bucket_orthophoto,
  key,
  startTime,
  endTime,
  projectName,
  frameInterval
) => {
  try {
    const response = await axios.post(EXTRACT_BEST_FRAMES, {
      s3_bucket_video,
      s3_bucket_orthophoto,
      video_path: 's3://' + key,
      start_second: startTime,
      end_second: endTime,
      frame_interval: frameInterval,
      projectName,
    })
    return response.data
  } catch (error) {
    throw new Error('Error extracting best frames')
  }
}

export const calcQuantities = async (
  netSets,
  hierarchy,
  S3_BUCKET_NAME,
  setProgress
) => {
  try {
    const response = await axios.post(
      CALC_QUANTITIES_URL,
      {
        nets_areas_dict: netSets,
        s3_object_folder: `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}`,
        bucket_name: S3_BUCKET_NAME,
      },
      {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const { total, loaded } = progressEvent
          const progress = Math.floor((loaded / total) * 100)
          setProgress(progress)
        },
      }
    )
    return response
  } catch (error) {
    throw new Error('Error calculating quantities')
  }
}

export const compareRebars = async (hierarchy, S3_BUCKET_NAME) => {
  try {
    const response = await axios.post(COMPARE_REBARS_URL, {
      s3_object_folder: `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}`,
      bucket_name: S3_BUCKET_NAME,
    })
    return response.data
  } catch (error) {
    throw new Error('Error comparing rebars')
  }
}

export const captureSelectedCamera = async (selectedCamera) => {
  try {
    const response = await axios.post(CAPTURE_IMAGE_URL, {
      camera_metadata: selectedCamera,
    })
    return response.data
  } catch (error) {
    throw new Error('Error capturing image')
  }
}

export const saveProjectImage = async (
  capturedImage,
  pixelPoints,
  worldPoints,
  hierarchy
) => {
  try {
    const response = await axios.post(PROJECT_IMAGE_URL, {
      image: capturedImage,
      pixelPoints,
      worldPoints,
      hierarchy,
    })
    return response.data
  } catch (error) {
    throw new Error('Error projecting image')
  }
}

export const fetchSnapshot = async (selectedCamera) => {
  try {
    const response = await axios.get(RTSP_SNAPSHOT_URL, {
      params: selectedCamera,
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching RTSP snapshot')
  }
}

export const validateFileWithId = async (
  typeUpload,
  fileType,
  BUCKET_NAME,
  file,
  pathAP,
  base64Buffer
) => {
  try {
    const response = await axios.post(VALIDATE_FILE_URL, {
      type: typeUpload,
      fileType,
      BUCKET_NAME,
      set_id: file.name.replace('.txt', '').replace('set ', ''),
      pathAP,
      buffer: base64Buffer,
    })
    return response.data // Return response data if needed
  } catch (error) {
    debugger
    // throw new Error(error)
    throw new Error(error.response.data.error)
  }
}

export const validateFile = async (
  typeUpload,
  fileType,
  BUCKET_NAME,
  base64Buffer
) => {
  try {
    const response = await axios.post(VALIDATE_FILE_URL, {
      type: typeUpload,
      fileType,
      BUCKET_NAME,
      buffer: base64Buffer,
    })
    return response.data // Return response data if needed
  } catch (error) {
    throw new Error('Error validating file with buffer')
  }
}
