const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();
const archiver = require('archiver');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

async function createZipFromS3(bucketName,prefix, keys, res) {
    const archive = archiver('zip', {
        zlib: { level: 9 } // Set the compression level
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=files.zip');

    archive.pipe(res); // Pipe the archive directly to the response

    for (const key of keys) {
        if (!key.endsWith('/')) { // Ensure the key is not a folder
            let strippedKey = key.replace(/^clients\//, ''); // Remove the 'clients/' prefix

            try {
                // console.log(strippedKey);
                prefix=prefix.replace("clients/", '');
               let withoutPrefix=strippedKey.replace(prefix,"");
                const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
                archive.append(data.Body, { name: withoutPrefix });
            } catch (error) {
                console.error(`Error fetching key ${key}:`, error);
            }
        }
    }

    await archive.finalize();
}
router.post('/download-zip', async (req, res) => {
    const { bucketName, keys,prefix } = req.body;

    if (!bucketName || !keys || !Array.isArray(keys)) {
        return res.status(400).json({ error: 'Invalid request format. Please provide bucketName and an array of keys.' });
    }

    try {
        await createZipFromS3(bucketName,prefix, keys, res);
    } catch (error) {
        console.error('Error creating zip:', error);
        res.status(500).json({ error: 'An error occurred while creating the zip file.' });
    }
});
router.get('/list-all-keys', async (req, res) => {
      let continuationToken=null;
        const { prefix } = req.query;
        let allKeys=[];

        try {
            do {
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Prefix: prefix,
                    ContinuationToken: continuationToken
                };

                const data = await s3.listObjectsV2(params).promise();
                const keys = data.Contents
                    .map(item => item.Key);

                allKeys = allKeys.concat(keys);
                continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
            } while (continuationToken);
            const files = allKeys.filter(key => !key.endsWith('/'));

            res.status(200).json({ keys:files });


        } catch (error) {
            console.error('Error listing items:', error);
            res.status(500).json({ message: 'Error listing items' });
        }
    });
router.get('/list-items', async (req, res) => {
    const { prefix } = req.query;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const directories = data.CommonPrefixes.map(item => item.Prefix);
        const files = data.Contents.map(item => item.Key).filter(key => key !== prefix);
        res.status(200).json({ directories, files });
    } catch (error) {
        console.error('Error listing items:', error);
        res.status(500).json({ message: 'Error listing items' });
    }
});

router.get('/download-file', (req, res) => {
    const { key,AWS_BUCKET_NAME } = req.query;
    let bucket_name=AWS_BUCKET_NAME?AWS_BUCKET_NAME:process.env.AWS_BUCKET_NAME;
    const params = {
        Bucket: bucket_name,
        Key: key,
    };

    try {
        s3.getObject(params, (err, data) => {
            if (err) {
                console.error('Error downloading file:', err);
                return res.status(500).json({ message: 'Error downloading file' });
            }
            res.attachment(key.split('/').pop());
            res.send(data.Body);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

module.exports = router;
