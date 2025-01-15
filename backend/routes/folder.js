const express = require('express')
const AWS = require('aws-sdk')
const router = express.Router()
const yaml = require('js-yaml')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()
const sharp = require('sharp')
const { listObjects, listFolders } = require('../services/listFiles')

router.delete('/delete-image/:key/:bucketName', async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key)
    const bucketName = decodeURIComponent(req.params.bucketName)

    const params = {
      Bucket: bucketName,
      Key: key,
    }
    await s3.deleteObject(params).promise()
    res.status(200).send({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error(`Error deleting image ${key}:`, error)
    next(error) // Pass the error to the error handling middleware
  }
})

// Endpoint to generate and serve thumbnails in batches
router.post('/thumbnails', async (req, res) => {
  try {
    const { keys, BUCKET_NAME } = req.body

    const thumbnails = await Promise.all(
      keys.map(async (key) => {
        const decodedKey = decodeURIComponent(key)
        const thumbnailKey = `thumbnails/${decodedKey}`

        try {
          // Check if the thumbnail already exists in S3
          await s3
            .headObject({ Bucket: BUCKET_NAME, Key: thumbnailKey })
            .promise()

          // If the thumbnail exists, get the S3 URL
          const thumbnailUrl = s3.getSignedUrl('getObject', {
            Bucket: BUCKET_NAME,
            Key: thumbnailKey,
            Expires: 60, // URL expiration time in seconds
          })

          return { key, url: thumbnailUrl }
        } catch (error) {
          if (error.code !== 'NotFound') {
            console.error(
              `Error checking for thumbnail ${thumbnailKey}: ${error.message}`
            )
            throw new Error('Error checking for thumbnail')
          }
        }

        // Generate and upload thumbnail if it doesn't exist
        const image = await s3
          .getObject({ Bucket: BUCKET_NAME, Key: decodedKey })
          .promise()
        const thumbnail = await sharp(image.Body)
          .resize({ width: 200 })
          .toBuffer()

        await s3
          .putObject({
            Bucket: BUCKET_NAME,
            Key: thumbnailKey,
            Body: thumbnail,
            ContentType: 'image/jpeg',
            // ACL: 'public-read'  // Adjust as needed
          })
          .promise()

        const thumbnailUrl = s3.getSignedUrl('getObject', {
          Bucket: BUCKET_NAME,
          Key: thumbnailKey,
          Expires: 60,
        })

        return { key, url: thumbnailUrl }
      })
    )

    res.json(thumbnails)
  } catch (error) {
    console.error(`Error processing thumbnails: ${error.message}`)
    res.status(500).send('Error generating thumbnails')
  }
})

// Endpoint to serve full-sized images
router.get('/images/:key/:BUCKET_NAME', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key)
    const BUCKET_NAME = decodeURIComponent(req.params.BUCKET_NAME)
    const image = await s3
      .getObject({ Bucket: BUCKET_NAME, Key: key })
      .promise()
    res.set('Content-Type', image.ContentType)
    res.send(image.Body)
  } catch (error) {
    console.error(`Error fetching image: ${error.message}`)
    res.status(500).send('Error fetching image')
  }
})
// Usage in your route
router.post('/delete-prefix', async (req, res) => {
  const { bucketName, prefix } = req.body

  try {
    let keys = await listObjects(bucketName, prefix)

    // Check if keys array is not empty
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No keys provided for deletion' })
    }

    // Create delete parameters
    const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: [] },
    }

    // Add all objects to the delete list
    keys
      .map((f) => f.Key)
      .forEach((stringKey) => {
        if (stringKey) {
          deleteParams.Delete.Objects.push({ Key: stringKey })
        }
      })

    // Check if deleteParams has objects to delete
    if (deleteParams.Delete.Objects.length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid keys provided for deletion' })
    }

    // Batch delete if necessary (limit to 1000 per request)
    const batchSize = 1000
    for (let i = 0; i < deleteParams.Delete.Objects.length; i += batchSize) {
      const batch = deleteParams.Delete.Objects.slice(i, i + batchSize)
      const batchDeleteParams = { ...deleteParams, Delete: { Objects: batch } }

      // Delete batch of objects
      await s3.deleteObjects(batchDeleteParams).promise()
    }

    res.status(200).json({ message: 'Objects deleted successfully' })
  } catch (error) {
    console.error('Error deleting objects:', error)
    res.status(500).json({ error: 'Failed to delete objects' })
  }
})
router.get('/list-images', async (req, res, next) => {
  const { bucketName, projectName } = req.query

  try {
    let imagesKeys = await listObjects(bucketName, projectName)
    imagesKeys = imagesKeys
      .map((f) => f.Key)
      .filter((item) => item.match(/\.(jpg|jpeg|png)$/i))
      .filter((item) => !item.includes('/output/'))
    res.status(200).json({ imageKeys: imagesKeys })
  } catch (error) {
    console.error('Error listing images:', error)
    next(error)
  }
})
router.get('/list-folders', async (req, res, next) => {
  const { bucketName, prefix } = req.query

  try {
    let folders = await listFolders(bucketName, prefix)
    res.status(200).json(folders)
  } catch (error) {
    console.error('Error listing folders:', error)
    next(error)
  }
})
router.get('/list-prefix', async (req, res, next) => {
  const { bucketName, prefix } = req.query

  try {
    let objects = await listObjects(bucketName, prefix)
    res.status(200).json(objects)
  } catch (error) {
    console.error('Error listing images:', error)
    next(error)
  }
})

router.get('/generate-presigned-url', (req, res) => {
  try {
    const bucketName = req.query.bucketName // e.g., 'atom-construction-bucket-eu'
    const key = req.query.key // e.g., 'rtsp/Ashdar/Ibn Shaprut 3-7/Z on Jib/20240820T072542_20240820T073829.mp4'
    if (!bucketName || !key) {
      return res.status(400).json({ error: 'Bucket name and key are required' })
    }

    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: 60 * 60, // 1 hour expiration
    }

    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating presigned URL', err)
        res.status(500).json({ error: 'Error generating presigned URL' })
      }

      res.json({ url })
    })
  } catch (error) {
    res.status(500).json({ error: 'Error generating presigned URL' })
  }
})

router.delete('/delete-image', async (req, res) => {
  try {
    const { bucketName, key } = req.query

    const params = {
      Bucket: bucketName,
      Key: key,
    }

    await s3.deleteObject(params).promise()
    res.status(200).json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ message: 'Error deleting image' })
  }
})
// In your existing routes file
router.post('/create', async (req, res) => {
  try {
    const { path, bucketName } = req.body

    if (!path) {
      return res.status(400).send('Path is required')
    }

    const params = {
      Bucket: bucketName,
      Key: `${path}/`, // Adding a trailing slash to indicate a folder
    }
    await s3.putObject(params).promise()
    res.status(200).send('Folder created successfully')
  } catch (error) {
    console.error('Error creating folder', error)
    res.status(500).send('Error creating folder')
  }
})
router.post('/create-project-metadata', async (req, res) => {
  try {
    const { bucketName, client, project, metadata } = req.body

    const metadataKey = `clients/${client}/${project}/meta.json`

    const metadataParams = {
      Bucket: bucketName,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
    }

    await s3.putObject(metadataParams).promise()
    res.status(200).json({ message: 'Project metadata created successfully' })
  } catch (error) {
    console.error('Error creating project metadata:', error)
    res.status(500).json({ message: 'Error creating project metadata' })
  }
})

router.post('/create-object-metadata', async (req, res) => {
  try {
    const { bucketName, client, project, floor, element, object, metadata } =
      req.body

    const metadataKey = `clients/${client}/${project}/${floor}/${element}/${object}/object meta.json`
    metadata.floor = parseInt(metadata.floor.replace('floor ', ''))

    const metadataParams = {
      Bucket: bucketName,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
    }
    const metadataKeyProject = `clients/${client}/${project}/meta.json`

    let metadataProjectParams = {
      Bucket: bucketName,
      Key: metadataKeyProject,
    }
    const dataProject = await s3.getObject(metadataProjectParams).promise()
    const parsed = JSON.parse(dataProject.Body.toString())
    let currentObjects =
      parsed.objects && parsed.objects.length > 0
        ? [...parsed.objects, metadata]
        : [metadata]
    parsed.objects = currentObjects
    metadataProjectParams = {
      Bucket: bucketName,
      Key: metadataKeyProject,
      Body: JSON.stringify(parsed),
      ContentType: 'application/json',
    }
    await s3.putObject(metadataProjectParams).promise()

    await s3.putObject(metadataParams).promise()
    res.status(200).json({ message: 'Object metadata created successfully' })
  } catch (error) {
    console.error('Error creating object metadata:', error)
    res.status(500).json({ message: 'Error creating object metadata' })
  }
})

router.post('/create-subfolders', jsonParser, async (req, res) => {
  try {
    const { bucketName, path } = req.body
    const subfolders = ['AB Versions', 'AP Versions']
    await Promise.all(
      subfolders.map((subfolder) => {
        const params = {
          Bucket: bucketName,
          Key: `${path}/${subfolder}/`,
        }
        return s3.putObject(params).promise()
      })
    )
    res.status(200).json({ message: 'Subfolders created successfully' })
  } catch (error) {
    console.error('Error creating subfolders:', error)
    res.status(500).json({ message: 'Error creating subfolders' })
  }
})

router.get('/get-metadata', async (req, res) => {
  try {
    const { bucketName, Key } = req.query
    const params = {
      Bucket: bucketName,
      Key,
    }

    const data = await s3.getObject(params).promise()
    res.status(200).json(data.Body.toString())
  } catch (error) {
    console.error('Error fetching settings', error)
    res.status(500).send('Error fetching settings')
  }
})
router.get('/get-file-json', async (req, res) => {
  try {
    const { bucketName, Key } = req.query
    const params = {
      Bucket: bucketName,
      Key,
    }

    const data = await s3.getObject(params).promise()
    const parsed = JSON.parse(data.Body.toString())
    res.status(200).json(parsed)
  } catch (error) {
    console.error('Error fetching settings', error)
    res.status(500).send('Error fetching settings')
  }
})
router.get('/get-settings', async (req, res) => {
  try {
    const { bucketName, projectName } = req.query
    const params = {
      Bucket: bucketName,
      Key: `${projectName}/settings.yaml`,
    }

    const data = await s3.getObject(params).promise()
    const settings = yaml.load(data.Body.toString())
    res.status(200).json(settings)
  } catch (error) {
    console.error('Error fetching settings', error)
    res.status(500).send('Error fetching settings')
  }
})

router.get('/get-file', async (req, res) => {
  try {
    const { bucketName, Key } = req.query
    try {
      // Check if the thumbnail already exists in S3
      await s3.headObject({ Bucket: bucketName, Key }).promise()
    } catch (error) {
      if (error.code !== 'NotFound') {
        console.error(`Error checking for file ${Key}: ${error.message}`)
        throw new Error('Error checking for file')
      } else {
        throw new Error('file Doesnt exists')
      }
    }
    const params = {
      Bucket: bucketName,
      Key,
    }

    const stream = s3.getObject(params).createReadStream()
    res.setHeader('Content-Type', 'image/tiff')
    stream.pipe(res)
  } catch (error) {
    console.error('Error fetching file', error)
    res.status(500).send('Error fetching file')
  }
})
// router.get('/list-projects', async (req, res) => {
//     try {
//         const params = {
//             Bucket: req.query.bucketName?req.query.bucketName:process.env.AWS_BUCKET_NAME,
//             Delimiter: '/',
//         };
//         const data = await s3.listObjectsV2(params).promise();
//         const projects = data.CommonPrefixes.map(prefix => prefix.Prefix.split('/')[0]);
//         res.status(200).json({ projects });
//     } catch (error) {
//         console.error('Error listing clients:', error);
//         res.status(500).json({ message: 'Error listing clients' });
//     }
// });
router.get('/list-clients', async (req, res, next) => {
  try {
    const { bucketName } = req.query

    const params = {
      Bucket: bucketName,
      Prefix: 'clients/',
      Delimiter: '/',
    }
    const data = await s3.listObjectsV2(params).promise()
    const clients = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[1]
    )
    res.status(200).json({ clients })
  } catch (error) {
    console.error('Error listing clients:', error)
    next(error)
  }
})

router.get('/list-projects', async (req, res, next) => {
  try {
    const { client, bucketName } = req.query

    const params = {
      Bucket: bucketName,
      Delimiter: '/',
    }
    if (client) {
      params.Prefix = `clients/${client}/`
    }
    const data = await s3.listObjectsV2(params).promise()
    const projects = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[2]
    )
    const orthoPhoto = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[0]
    )
    if (client) {
      res.status(200).json({ projects })
      return
    }
    res.status(200).json({ projects: orthoPhoto })
  } catch (error) {
    console.error('Error listing projects:', error)
    next(error)
  }
})

router.get('/list-floors', async (req, res, next) => {
  try {
    const { client, project, bucketName } = req.query

    const params = {
      Bucket: bucketName,
      Prefix: `clients/${client}/${project}/`,
      Delimiter: '/',
    }
    const data = await s3.listObjectsV2(params).promise()
    const floors = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[3]
    )
    res.status(200).json({ floors })
  } catch (error) {
    console.error('Error listing floors:', error)
    next(error)
  }
})

router.get('/list-elements', async (req, res, next) => {
  try {
    const { client, project, floor, bucketName } = req.query

    const params = {
      Bucket: bucketName,
      Prefix: `clients/${client}/${project}/${floor}/`,
      Delimiter: '/',
    }
    const data = await s3.listObjectsV2(params).promise()
    const elements = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[4]
    )
    res.status(200).json({ elements })
  } catch (error) {
    console.error('Error listing elements:', error)
    next(error)
  }
})

router.get('/list-objects', async (req, res, next) => {
  try {
    const { client, project, floor, element, bucketName } = req.query

    const params = {
      Bucket: bucketName,
      Prefix: `clients/${client}/${project}/${floor}/${element}/`,
      Delimiter: '/',
    }
    const data = await s3.listObjectsV2(params).promise()
    const objects = data.CommonPrefixes.map(
      (prefix) => prefix.Prefix.split('/')[5]
    )
    res.status(200).json({ objects })
  } catch (error) {
    console.error('Error listing objects:', error)
    next(error)
  }
})
router.get('/list-dates', async (req, res, next) => {
  try {
    const { client, project, floor, element, object, type, bucketName } =
      req.query
    const typePrefix = type === 'AP' ? 'AP Versions' : 'AB Versions'
    const prefix = `clients/${client}/${project}/${floor}/${element}/${object}/${typePrefix}/`

    let params = {
      Bucket: bucketName,
      Prefix: prefix,
    }

    let allObjects = []
    let data

    do {
      data = await s3.listObjectsV2(params).promise()
      allObjects = allObjects.concat(data.Contents)
      params.ContinuationToken = data.NextContinuationToken
    } while (data.IsTruncated)

    const dates = allObjects.map((obj) => {
      const parts = obj.Key.split('/')
      const typeIndex = parts.indexOf(typePrefix) + 1
      return parts[typeIndex]
    })

    const uniqueDates = [
      ...new Set(
        dates.filter((date) => date && /^\d{2}-\d{2}-\d{2}$/.test(date))
      ),
    ]

    res.status(200).json({ dates: uniqueDates })
  } catch (error) {
    console.error('Error listing objects', error)
    next(error)
  }
})
const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year.slice(-2)}`
}

router.get('/list-files', async (req, res, next) => {
  try {
    const {
      bucketName,
      client,
      project,
      floor,
      element,
      object,
      date,
      typeUpload,
      folderPath,
    } = req.query
    const formattedDate = date && date.length > 8 ? formatDate(date) : date
    let path

    if (
      typeUpload &&
      (typeUpload.toUpperCase() === 'AB' || typeUpload.toUpperCase() === 'AP')
    ) {
      path = `clients/${client}/${project}/${floor}/${element}/${object}/${typeUpload.toUpperCase()} Versions/${formattedDate}/`
    } else {
      path = folderPath
    }

    const params = {
      Bucket: bucketName,
      Prefix: path,
    }
    const data = await s3.listObjectsV2(params).promise()
    const files = data.Contents.map((item) =>
      typeUpload && typeUpload.toUpperCase() === 'AP'
        ? item.Key.split('/').pop()
        : item.Key
    )
    res.status(200).json({ files })
  } catch (error) {
    console.error('Error listing files:', error)
    next(error)
  }
})

const lambda = new AWS.Lambda()

router.get('/list-zip-files', async (req, res) => {
  try {
    const { bucketName, projectName } = req.query
    const params = {
      Bucket: bucketName,
      Prefix: `${projectName}/output_zip/`,
    }

    const data = await s3.listObjectsV2(params).promise()
    const zipFiles = data.Contents.map((obj) => obj.Key)
    res.status(200).json({ zipFiles })
  } catch (error) {
    console.error('Error listing zip files', error)
    res.status(500).json({ message: 'Error listing zip files' })
  }
})

router.post('/generate-zip', bodyParser.json(), async (req, res) => {
  try {
    const { bucketName, projectName } = req.body

    const params = {
      FunctionName: 'genreateZipFromKeys', // Replace with your Lambda function name
      InvocationType: 'Event', // Async invocation
      Payload: JSON.stringify({ bucketName, projectName }),
    }

    await lambda.invoke(params).promise()
    res.status(200).json({ message: 'Zip generation started' })
  } catch (error) {
    console.error('Error invoking Lambda function', error)
    res.status(500).json({ message: 'Error invoking Lambda function' })
  }
})
// Get NetSets
router.get('/get-netsets', async (req, res) => {
  try {
    const { bucketName, client, project, floor, element, object } = req.query
    const key = `clients/${client}/${project}/${floor}/${element}/${object}/netsets.json`
    const params = {
      Bucket: bucketName,
      Key: key,
    }
    const data = await s3.getObject(params).promise()
    const stringNetSets = data.Body.toString()
    let netSets = []
    if (stringNetSets.length > 0) {
      netSets = JSON.parse(stringNetSets)
    }
    res.status(200).json(netSets)
  } catch (error) {
    console.error('Error fetching net sets:', error)
    if (error.code === 'NoSuchKey') {
      res.status(200).json([])
    } else {
      res.status(500).json({ message: 'Error fetching net sets' })
    }
  }
})

// Save NetSets
router.post('/save-netsets', async (req, res) => {
  try {
    const { bucketName, client, project, floor, element, object, netSets } =
      req.body
    const key = `clients/${client}/${project}/${floor}/${element}/${object}/netsets.json`
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(netSets),
      ContentType: 'application/json',
    }
    await s3.putObject(params).promise()
    res.status(200).json({ message: 'Net sets saved successfully' })
  } catch (error) {
    console.error('Error saving net sets:', error)
    res.status(500).json({ message: 'Error saving net sets' })
  }
})

module.exports = router
