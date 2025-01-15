const express = require('express')
const AWS = require('aws-sdk')
const multer = require('multer')
const router = express.Router()
const yaml = require('js-yaml')
const bodyParser = require('body-parser')
const { runWorkflow } = require('../services/orthoPhoto/ec2Runner')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()

// Configure multer to use memory storage
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get(
  '/orthophoto/check-completion/:bucketName/:projectName',
  async (req, res) => {
    const s3 = new AWS.S3()
    const { bucketName, projectName } = req.params
    const params = {
      Bucket: bucketName,
      Prefix: `${projectName}/output/odm_orthophoto/`,
    }

    try {
      const data = await s3.listObjectsV2(params).promise()
      const isComplete = data.Contents.length > 0
      res.json({ isComplete })
    } catch (error) {
      console.error('Error checking completion', error)
      res.status(500).send('Error checking completion')
    }
  }
)
router.post('/orthophoto/reExecute', bodyParser.json(), async (req, res) => {
  const { projectName, bucketName, settings } = req.body
  const settingsBuffer = Buffer.from(yaml.dump(settings))
  const settingsParams = {
    Bucket: bucketName,
    Key: `${projectName}/settings.yaml`,
    Body: settingsBuffer,
    ContentType: 'application/x-yaml',
  }

  await s3.upload(settingsParams).promise()

  const dispatchParams = {
    Bucket: bucketName,
    Key: `${projectName}/dispatch`,
    Body: '',
    ContentType: 'text/plain',
  }

  const dispatchDeleteParams = {
    Bucket: bucketName,
    Key: `${projectName}/dispatch`,
  }

  const listParams = {
    Bucket: bucketName,
    Prefix: `${projectName}/output/`,
  }

  try {
    // List and delete all objects in the output folder
    const listOutput = await s3.listObjectsV2(listParams).promise()
    if (listOutput.Contents.length > 0) {
      const deleteParams = {
        Bucket: bucketName,
        Delete: { Objects: [] },
      }
      listOutput.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key })
      })

      await s3.deleteObjects(deleteParams).promise()
    }

    // Delete the dispatch file
    await s3.deleteObject(dispatchDeleteParams).promise()
    // Upload the dispatch file
    await s3.upload(dispatchParams).promise()
    const DIR = projectName
    const OriginalInstanceId = 'i-00e181e5a65b6da5d'
    const runWorkFlow = await runWorkflow(OriginalInstanceId, DIR)
    const { publicIp, instanceId } = runWorkFlow
    res.status(200).send({ publicIp, instanceId })
  } catch (error) {
    console.error('Error triggering execution', error)
    res.status(500).send('Error triggering execution')
  }
})

router.post('/orthophoto/execute', bodyParser.json(), async (req, res) => {
  const { projectName, bucketName } = req.body
  const params = {
    Bucket: bucketName,
    Key: `${projectName}/dispatch`,
    Body: '',
    ContentType: 'text/plain',
  }

  try {
    await s3.upload(params).promise()
    const DIR = projectName
    const OriginalInstanceId = 'i-00e181e5a65b6da5d'
    const runWorkFlow = await runWorkflow(OriginalInstanceId, DIR)
    const { publicIp, instanceId } = runWorkFlow
    res.status(200).send({ publicIp, instanceId })
  } catch (error) {
    console.error('Error triggering execution', error)
    res.status(500).send('Error triggering execution')
  }
})
// Route to handle settings upload
router.post('/orthophoto/settings/', async (req, res) => {
  const { projectName, bucketName, settings } = req.body

  try {
    const settingsBuffer = Buffer.from(yaml.dump(settings))
    const settingsParams = {
      Bucket: bucketName,
      Key: `${projectName}/settings.yaml`,
      Body: settingsBuffer,
      ContentType: 'application/x-yaml',
    }

    await s3.upload(settingsParams).promise()
    res.status(200).send('Settings uploaded successfully')
  } catch (error) {
    console.error('Error uploading settings', error)
    res.status(500).send('Error uploading settings')
  }
})

// Route to handle file uploads
router.post('/orthophoto/file', upload.single('file'), async (req, res) => {
  const { projectName, bucketName } = req.body
  const file = req.file

  const params = {
    Bucket: bucketName,
    Key: `${projectName}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  try {
    // Check if the file already exists in the bucket
    const headParams = {
      Bucket: bucketName,
      Key: params.Key,
    }

    try {
      const headData = await s3.headObject(headParams).promise()

      // If the file exists and has the same size, return 200 status
      if (headData.ContentLength === file.size) {
        return res.status(200).send('File already exists with the same size')
      }
    } catch (headError) {
      if (headError.code !== 'NotFound') {
        console.error('Error checking existing file', headError)
        return res.status(500).send('Error checking existing file')
      }
    }

    // If the file doesn't exist or has a different size, upload the file
    await s3.upload(params).promise()
    res.status(200).send('File uploaded successfully')
  } catch (error) {
    console.error('Error uploading file', error)
    res.status(500).send('Error uploading file')
  }
})

router.post('/single-file', upload.single('file'), (req, res) => {
  try {
    const {
      client,
      project,
      floor,
      element,
      object,
      date,
      typeUpload,
      BUCKET_NAME,
      folderName,
    } = req.body
    const [year, month, day] = date.split('-')
    let formattedDate = `${day}-${month}-${year.slice(2)}`
    if (date.length === 8) {
      formattedDate = date
    }
    let folderPath = `clients/${client}/${project}/${floor}/${element}/${object}/${typeUpload.toUpperCase()} Versions/${formattedDate}/`
    let file = req.file
    // Adjust the folder path for AB files
    if (typeUpload.toUpperCase() === 'AB') {
      folderPath += `${folderName}`
      file.originalname = 'set ab.txt'
    }
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${folderPath}${file.originalname}`,
      Body: file.buffer,
    }

    s3.upload(params)
      .promise()
      .then(() => {
        // console.log("uploaded path"+params.Key);
        res.status(200).json({ message: 'File uploaded successfully' })
      })
      .catch((err) => {
        console.error('Error uploading file:', err)
        res.status(500).json({ message: 'Error uploading file' })
      })
  } catch (error) {
    console.error('Error upload single-file files:', error)
    next(error)
  }
})

router.post('/multiple-images', upload.array('files', 10), (req, res) => {
  const {
    client,
    project,
    floor,
    element,
    object,
    date,
    typeUpload,
    BUCKET_NAME,
  } = req.body
  const [year, month, day] = date.split('-')
  let formattedDate = `${day}-${month}-${year.slice(2)}`
  if (date.length === 8) {
    formattedDate = date
  }
  const folderName = `clients/${client}/${project}/${floor}/${element}/${object}/${typeUpload.toUpperCase()} Versions/${formattedDate}/AP Images/`
  const files = req.files

  const uploadPromises = files.map((file) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${folderName}${file.originalname}`,
      Body: file.buffer,
    }
    // console.log("uploaded path"+params.Key);

    return s3.upload(params).promise()
  })

  Promise.all(uploadPromises)
    .then(() => {
      res.status(200).json({ message: 'Files uploaded successfully' })
    })
    .catch((err) => {
      console.error('Error uploading files:', err)
      res.status(500).json({ message: 'Error uploading files' })
    })
})
module.exports = router
