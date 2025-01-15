const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
async function listFolders(bucketName, prefixPath) {
    let allFolders = [];
    let continuationToken = null;

    do {
        const params = {
            Bucket: bucketName,
            Prefix: `${prefixPath}`,
            Delimiter: '/', // This will group common prefixes (folders)
            ContinuationToken: continuationToken
        };

        const data = await s3.listObjectsV2(params).promise();

        // Extract common prefixes (folders)
        const currentFolders = data.CommonPrefixes.map(prefix => ({
            Folder: prefix.Prefix,
            CreationDate: null  // S3 does not directly provide creation dates for folders
        }));

        // Fetch folder creation dates by getting the metadata of the first object within each folder
        for (let folder of currentFolders) {
            const paramsForDate = {
                Bucket: bucketName,
                Prefix: folder.Folder,
                MaxKeys: 1  // Only need the first object to get the creation date
            };

            const folderData = await s3.listObjectsV2(paramsForDate).promise();
            if (folderData.Contents.length > 0) {
                folder.CreationDate = folderData.Contents[0].LastModified;
            }
        }

        allFolders = allFolders.concat(currentFolders);
        continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
    } while (continuationToken);
    allFolders = allFolders.map(item => {
        item.Folder = item.Folder.replace("/","");
        return item;
        })
    return allFolders;
}
async function listObjects(bucketName,prefixPath) {
    let allKeys = [];
    let continuationToken = null;
    do {
        const params = {
            Bucket: bucketName,
            Prefix: `${prefixPath}`,
            ContinuationToken: continuationToken
        };

        const data = await s3.listObjectsV2(params).promise();
        const currentKeys = data.Contents.
        map(item => ({
            Key: item.Key,
            Size: (item.Size / (1024 * 1024)).toFixed(2),LastModified:item.LastModified
        }));

        allKeys = allKeys.concat(currentKeys);
        continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
    } while (continuationToken);
    return allKeys;
}
module.exports={listObjects,listFolders}