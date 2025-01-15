// const { listObjects } = require("../services/listFiles");
// const {awsS3} = require("../services/awsServices");
//
// const isPotentialDateFolder = (folderName) => {
//     // Check if the folder name contains only digits and dashes
//     return /^[\d-]+$/.test(folderName);
// };
//
// const isValidDateFolder = (folderName) => {
//     // Regular expression to match the dd-mm-yy format
//     const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
//     return dateRegex.test(folderName);
// };
//
// const deleteUnused = async () => {
//     const bucketName = 'atom-construction-bucket-eu';
//     const prefix = '';
//     const keys = await listObjects(bucketName, prefix);
//
//     let filteredKeys = [];
//
//     keys.forEach(({ Key }) => {
//         // Split the key into its components
//         const folders = Key.split('/');
//
//         // Check if any folder name is "undefined"
//         const hasUndefined = folders.some(folder => folder.toLowerCase().includes('undefined'));
//
//         if (hasUndefined) {
//             filteredKeys.push(Key);
//         } else {
//             // Only check for date format if the folder name has potential date format characters
//             const hasBadDateStructure = folders.some(folder =>
//                 isPotentialDateFolder(folder) && !isValidDateFolder(folder)
//             );
//
//             if (hasBadDateStructure) {
//                 filteredKeys.push(Key);
//             }
//         }
//     });
//
//     console.log("Keys with bad structure:", filteredKeys);
//
//     const deleteParams = {
//         Bucket: bucketName,
//         Delete: { Objects: [] }
//     };
//
//     // Add all objects to the delete list
//     filteredKeys.map(f=>f).forEach((stringKey) => {
//         if (stringKey) {
//             deleteParams.Delete.Objects.push({ Key: stringKey });
//         }
//     });
//
//     // Check if deleteParams has objects to delete
//     if (deleteParams.Delete.Objects.length === 0) {
//         return console.error({ error: 'No valid keys provided for deletion' });
//     }
//
//     // Batch delete if necessary (limit to 1000 per request)
//     const batchSize = 1000;
//     for (let i = 0; i < deleteParams.Delete.Objects.length; i += batchSize) {
//         const batch = deleteParams.Delete.Objects.slice(i, i + batchSize);
//         const batchDeleteParams = { ...deleteParams, Delete: { Objects: batch } };
//
//         // Delete batch of objects
//         await awsS3.deleteObjects(batchDeleteParams).promise();
//     }
//     // Log or process the filtered keys with bad structure
//     // You can proceed to delete them or perform any other action as needed
// };
//
// deleteUnused();
