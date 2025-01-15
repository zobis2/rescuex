import axios from '../axiosConfig'

const LIST_IMAGES_URL = '/api/folder/list-images'
const THUMBNAILS_URL = '/api/folder/thumbnails'
const GET_IMAGE_URL = (key, bucketName) =>
  `/api/folder/images/${encodeURIComponent(key)}/${bucketName}`
const DELETE_IMAGE_URL = (keyToDelete, bucketName) =>
  `/api/folder/delete-image/${encodeURIComponent(keyToDelete)}/${bucketName}`

const LIST_ZIP_FILES_URL = '/api/folder/list-zip-files'
const LIST_FOLDERS_URL = '/api/folder/list-folders'
const GET_SETTINGS_URL = '/api/folder/get-settings'
const LIST_PREFIX_URL = '/api/folder/list-prefix'
const DELETE_PREFIX_URL = '/api/folder/delete-prefix'
const GENERATE_ZIP_URL = '/api/folder/generate-zip'
const GET_FILE_JSON = '/api/folder/get-file-json'
const GET_NETSETS_URL = '/api/folder/get-netsets'
const SAVE_NETSETS_URL = '/api/folder/save-netsets'
const CREATE_FOLDER_URL = '/api/folder/create'
const CREATE_PROJECT_METADATA_URL = '/api/folder/create-project-metadata'
const CREATE_OBJECT_METADATA_URL = '/api/folder/create-object-metadata'
const CREATE_SUBFOLDERS_URL = '/api/folder/create-subfolders'
const GENERATE_PRESIGNED_URL = '/api/folder/generate-presigned-url'
const LIST_CLIENTS_URL = '/api/folder/list-clients'
const LIST_PROJECTS_URL = '/api/folder/list-projects'
const LIST_FILES_URL = '/api/folder/list-files'
const GET_METADATA_URL = '/api/folder/get-metadata'

export const getImageKeys = async (bucketName, projectName) => {
  try {
    const response = await axios.get(LIST_IMAGES_URL, {
      params: { bucketName, projectName },
    })
    return response.data.imageKeys
  } catch (error) {
    throw new Error('Error fetching image keys')
  }
}

export const postThumbnails = async (keys, bucketName) => {
  try {
    const response = await axios.post(THUMBNAILS_URL, {
      keys,
      BUCKET_NAME: bucketName,
    })
    return response.data
  } catch (error) {
    throw new Error('Error posting thumbnails')
  }
}

export const fetchImageBlob = async (key, bucketName) => {
  try {
    const response = await axios.get(GET_IMAGE_URL(key, bucketName), {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching image blob')
  }
}

export const deleteImage = async (keyToDelete, bucketName) => {
  try {
    const response = await axios.delete(
      DELETE_IMAGE_URL(keyToDelete, bucketName)
    )
    return response.data
  } catch (error) {
    throw new Error('Error deleting image')
  }
}

export const getZipFiles = async (bucketName, projectName) => {
  try {
    const response = await axios.get(LIST_ZIP_FILES_URL, {
      params: { bucketName, projectName },
    })
    return response.data.zipFiles
  } catch (error) {
    throw new Error('Error fetching zip files')
  }
}

export const listFolders = async function (bucketName, prefix = '') {
  try {
    const response = await axios.get(LIST_FOLDERS_URL, {
      params: { bucketName, prefix },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching folders')
  }
}

export const getFolderSettings = async function (bucketName, projectName) {
  try {
    const response = await axios.get(GET_SETTINGS_URL, {
      params: { bucketName, projectName },
    })
    return response.data
  } catch (error) {
    throw new Error('Failed to fetch settings')
  }
}

export const listPrefixFiles = async function (bucketName, projectName) {
  try {
    const response = await axios.get(LIST_PREFIX_URL, {
      params: { bucketName, prefix: projectName },
    })
    return response.data
  } catch (error) {
    throw new Error('Failed to list prefix files')
  }
}

export const removePrefix = async function (bucketName, prefix) {
  try {
    const response = await axios.post(DELETE_PREFIX_URL, {
      bucketName,
      prefix,
    })
    return response.data
  } catch (error) {
    throw new Error('Failed to delete prefix')
  }
}

export const generateZip = async function (bucketName, projectName) {
  try {
    const response = await axios.post(GENERATE_ZIP_URL, {
      bucketName,
      projectName,
    })
    return response.data
  } catch (error) {
    throw new Error('Failed to generate zip file')
  }
}

export const getFileJson = async (bucketName, key) => {
  try {
    const response = await axios.get(GET_FILE_JSON, {
      params: {
        bucketName,
        Key: key,
      },
    })
    return response.data
  } catch (error) {
    throw new Error('Failed to get file json')
  }
}

export const getNetSets = async (S3_BUCKET_NAME, hierarchy) => {
  try {
    const response = await axios.get(GET_NETSETS_URL, {
      params: {
        bucketName: S3_BUCKET_NAME,
        client: hierarchy.client,
        project: hierarchy.project,
        floor: hierarchy.floor,
        element: hierarchy.element,
        object: hierarchy.object,
      },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching netsets')
  }
}

export const postNetSets = async (S3_BUCKET_NAME, hierarchy, newNetSets) => {
  try {
    const response = await axios.post(SAVE_NETSETS_URL, {
      bucketName: S3_BUCKET_NAME,
      client: hierarchy.client,
      project: hierarchy.project,
      floor: hierarchy.floor,
      element: hierarchy.element,
      object: hierarchy.object,
      netSets: newNetSets,
    })
    return response.data
  } catch (error) {
    throw new Error('Error saving netsets')
  }
}

export const createFolder = async (bucketName, folderPath) => {
  try {
    const response = await axios.post(CREATE_FOLDER_URL, {
      bucketName,
      path: folderPath,
    })
    return response.data
  } catch (error) {
    throw new Error('Error creating folder')
  }
}

export const createProjectMetadata = async (
  bucketName,
  parts,
  projectMetadata
) => {
  try {
    const response = await axios.post(CREATE_PROJECT_METADATA_URL, {
      bucketName,
      client: parts[1],
      project: parts[2],
      metadata: projectMetadata,
    })
    return response.data
  } catch (error) {
    throw new Error('Error creating project metadata')
  }
}

export const createObjectMetadata = async (
  bucketName,
  parts,
  objectMetadata
) => {
  try {
    const response = await axios.post(CREATE_OBJECT_METADATA_URL, {
      bucketName,
      client: parts[1],
      project: parts[2],
      floor: parts[3],
      element: parts[4],
      object: parts[5],
      metadata: objectMetadata,
    })
    return response.data
  } catch (error) {
    throw new Error('Error creating object metadata')
  }
}

export const createSubfolders = async (bucketName, folderPath) => {
  try {
    const response = await axios.post(CREATE_SUBFOLDERS_URL, {
      bucketName,
      path: folderPath,
    })
    return response.data
  } catch (error) {
    throw new Error('Error creating subfolders')
  }
}

export const generatePresignedUrl = async (bucketName, s3Key) => {
  try {
    const response = await axios.get(GENERATE_PRESIGNED_URL, {
      params: {
        bucketName,
        key: s3Key,
      },
    })
    return response.data
  } catch (error) {
    throw new Error('Error generating pre-signed URL')
  }
}

export const listClients = async (bucketName) => {
  try {
    const response = await axios.get(LIST_CLIENTS_URL, {
      params: { bucketName },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching client list')
  }
}

export const listProjects = async (bucketName, client) => {
  try {
    const response = await axios.get(LIST_PROJECTS_URL, {
      params: { bucketName, client },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching project list')
  }
}

export const listFiles = async (folderPath, bucketName) => {
  try {
    const response = await axios.get(LIST_FILES_URL, {
      params: { folderPath, bucketName },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching file list')
  }
}

export const getMetadata = async (bucketName, metadataKey) => {
  try {
    const response = await axios.get(GET_METADATA_URL, {
      params: { bucketName, Key: metadataKey },
    })
    return response.data
  } catch (error) {
    throw new Error('Error fetching metadata')
  }
}
