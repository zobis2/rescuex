require('dotenv').config();
const { google } = require('googleapis');
const {auth} = require("googleapis/build/src/apis/ml");
const sheets = google.sheets('v4');
const drive = google.drive('v3');
const sharp = require('sharp');
const { Readable } = require('stream');

const fs = require('fs'); // Ensure you import the 'fs' module at the top
const RAW_DATA_FOLDER_ID='1TDb3vswpgm_Yl8NK-Amj9tvvLGPgZaPn'

// Authenticate with Google
async function authorize() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'
        ],
    });
    return await auth.getClient();
}
async function listFilesInFolder(folderId) {
    const auth = await getGoogleDriveAuth();
    const allFiles = [];
    let pageToken = null;

    do {
        const res = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType), nextPageToken',
            pageToken: pageToken,
            auth: auth,
        });

        console.log('Response from Google Drive API:', res.data); // Log the full response
        console.log('Files found in folder:', res.data.files); // Log files found in this batch

        allFiles.push(...res.data.files);
        pageToken = res.data.nextPageToken; // Get next page token for pagination
    } while (pageToken);

    return allFiles; // Return all files found
}

async function getFileContent( fileId) {
    const auth=getGoogleDriveAuth()

    const response = await drive.files.get({
        fileId: fileId,
        alt: 'media',
        auth: auth,
    }, { responseType: 'arraybuffer' });

    return Buffer.from(response.data).toString('base64'); // Convert to Base64
}
async function getProjectImages(projectDetails) {
    const {city,street,number} = projectDetails;
    const folders=await listAllFolders();

    // Find the folder that matches each part of the path
    const targetFolder = folders.find(folder =>

        folder.path.includes(city) &&
        folder.path.includes(street) &&
        folder.path.includes(number) &&
        folder.path.includes("3 - GIS")
    );
    const images = await listFilesInFolder( targetFolder.id); // List files in the target folder
    const imagePromises = images.map(async (image) => {
        const base64Content = await getFileContent( image.id); // Convert image to Base64
// Convert Base64 to Buffer for sharp processing
        const imageBuffer = Buffer.from(base64Content, 'base64');

        try {
            const metadata = await sharp(imageBuffer).metadata(); // Get image metadata
            return {
                filename: image.name,
                base64: base64Content,
                width: metadata.width,
                height: metadata.height,
            };
        } catch (error) {
            console.error('Error processing image with sharp:', error);
            return {
                filename: image.name,
                base64: base64Content,
                width: null,
                height: null,
            };
        }
    });
    const imageList = await Promise.all(imagePromises); // Resolve all promises

    let x=0;
    return imageList; // Return the list of images with Base64 content

}
async function listAllFolders( ) {
    const currentPath = 'raw_data';
    const parentId = '1TDb3vswpgm_Yl8NK-Amj9tvvLGPgZaPn'; // Your parent folder ID

    const auth = await getGoogleDriveAuth()
    const drive = google.drive({ version: 'v3', auth });
    let allFolders = [];

    const fetchFolders = async (parent,path) => {
        const response = await drive.files.list({
            q: `'${parent}' in parents and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
            supportsAllDrives: true,
        });

        const folders = response.data.files;

        for (const folder of folders) {
            const newPath = `${path?path:currentPath}/${folder.name}`; // Update the path with the current folder's name
            allFolders.push({ id: folder.id, name: folder.name, path: newPath });

            // Recursively fetch subfolders
            await fetchFolders(folder.id,newPath);
        }
    };

    await fetchFolders(parentId);

    return allFolders;
}
async function listImagesInGISFolder(projectDetails) {

    const auth=getGoogleDriveAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Construct the folder name based on project details
    const folderName = `raw_data`;

    try {
        // Search for the folder ID of "3 - GIS"
        const folderResponse = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
            supportsAllDrives: true,
        });

        const folderId = folderResponse.data.files.length > 0 ? folderResponse.data.files[0].id : null;

        if (!folderId) {
            console.log('GIS folder not found.');
            return [];
        }

        // List all images in the found folder
        const imageResponse = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name)',
            supportsAllDrives: true,
        });

        const images = imageResponse.data.files;
        console.log('Images found:', images);
        return images;
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error; // Handle errors accordingly
    }
}
async function createFolder(auth, folderName, parentId) {
    // Check if the folder already exists
    const response = await drive.files.list({
        q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        auth,
    });

    const existingFolder = response.data.files.length > 0 ? response.data.files[0] : null;

    // If the folder exists, return its ID
    if (existingFolder) {
        console.log(`Folder already exists: ${existingFolder.name} (ID: ${existingFolder.id})`);
        return existingFolder.id;
    }
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };

    const folder = await drive.files.create({
        auth,
        resource: fileMetadata,
        fields: ['id','name'],
        supportsAllDrives: true,
    });

    const folderId = folder.data.id;

    // Share the folder with specified users
    // const emails = ['dev@gilgaleng.com', 'office@gilgaleng.com'];
    // const sharePromises = emails.map(email =>
    //     drive.permissions.create({
    //         resource: {
    //             type: "user",
    //             role: "owner",
    //             emailAddress: email,  // Please set your email address of Google account.
    //         },
    //         fileId: folderId,
    //         fields: "id",
    //         transferOwnership: true,
    //         moveToNewOwnersRoot: true,
    //     }).catch(error => {
    //         console.error(`Failed to share folder with ${email}:`, error);
    //
    //     })
    // );

    // await Promise.all(sharePromises);

    console.log(`Folder created and shared with dev@gilgaleng.com and office@gilgaleng.com: ${folderId}`);
    return folderId;
}
async function createNestedFolders(auth, projectDetails,parentId) {
    // Create the city folder
    const cityFolderId = await createFolder(auth, projectDetails.city, parentId);

    // Create the street and number folder inside the city folder
    const streetNumberFolderId = await createFolder(auth, `${projectDetails.street} ${projectDetails.number}`, cityFolderId);

    return streetNumberFolderId; // Return the ID of the street/number folder
}

function getGoogleDriveAuth() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive'],
    });
    return auth;
}

async function openProjectPathInDrive( projectDetails) {
    const auth = getGoogleDriveAuth();
    // const baseDirId = await createFolder(auth, `${projectDetails.city}/${projectDetails.street} ${projectDetails.number}`, '1TDb3vswpgm_Yl8NK-Amj9tvvLGPgZaPn');
    const baseDirId = await createNestedFolders(auth, projectDetails,RAW_DATA_FOLDER_ID);

    const subDirs = [
        '1 - ניהול פרויקט',
        '2 - מידע מהלקוח',
        '3 - GIS',
        '4 - ניהול מי נגר',
        '5 - אישורים ורעינות',
        '6 - השפלת מי תהום',
        '7 - ביצוע קידוח פיאזומטר',
        '8 - קידוחי ניסיון',
    ];

    for (const dir of subDirs) {
        await createFolder(auth, dir, baseDirId);
        console.log(`Subfolder created for ${dir}`);

    }
    return true;
}
async function getDocAsWord(googleDocId) {

// Authenticate with Google using a Service Account
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // Export the Google Doc as DOCX
    const response = await drive.files.export(
        { fileId: googleDocId, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { responseType: 'arraybuffer' }
    );
    return response;
}

// Read all projects from the sheet
async function readProjects(spreadsheetId) {
    const authClient = await authorize();
    const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId,
        range: 'projects!A2:K', // Full range to include all columns
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
        rowNumber: parseInt(row[0]), // Ensure it's a number
        id: row[1],
        street: row[2],
        number: row[3],
        city: row[4],
        serialId: row[5],
        gosh: row[6],
        halka: row[7],
        cords: row[8],
        rainflow1to5: row[9],
        rainflow1to50: row[10],
    }));
}

// Get the highest rowNumber from the sheet
async function getHighestRowNumber(spreadsheetId) {
    const projects = await readProjects(spreadsheetId);
    const highestRow = projects.reduce((max, project) => Math.max(max, project.rowNumber), 0);
    return highestRow;
}

// Add a new project
async function writeProject(spreadsheetId, values) {
    const authClient = await authorize();
    const newRowNumber = (await getHighestRowNumber(spreadsheetId)) + 1;

    const valuesArray = [
        [
            newRowNumber, // New row number as ID
            values.id,
            values.street,
            values.number,
            values.city,
            values.serialId,
            values.gosh,
            values.halka,
            values.cords,
            values.rainflow1to5,
            values.rainflow1to50,
        ],
    ];

    await sheets.spreadsheets.values.append({
        auth: authClient,
        spreadsheetId,
        range: 'projects!A:K',
        valueInputOption: 'RAW',
        requestBody: { values: valuesArray },
    });
    await openProjectPathInDrive({city:values.city, street:values.street, number:values.number});

}

// Update an existing project by rowNumber
async function updateProject(spreadsheetId, rowNumber, values) {
    const authClient = await authorize();

    const valuesArray = [
        [
            rowNumber,
            values.id,
            values.street,
            values.number,
            values.city,
            values.serialId,
            values.gosh,
            values.halka,
            values.cords,
            values.rainflow1to5,
            values.rainflow1to50,
        ],
    ];

    const range = `projects!A${parseInt(rowNumber) + 1}:K`; // Adding 1 to rowNumber

    await sheets.spreadsheets.values.update({
        auth: authClient,
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: valuesArray },
    });
}
// Function to upload a file to Google Drive
async function uploadFile( auth,filePath,fileBuffer, mimeType, folderId) {
    try{
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            name: filePath.split('/').pop(), // Extract the file name
            parents: [folderId], // Set the parent directory
        };
        // const fileBuffer = fs.readFileSync(filePath);

        const media = {
            mimeType: mimeType,
            body: Readable.from(fileBuffer), // Use Readable.from to create a stream from the buffer
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        return response.data.id; // Return the uploaded file ID
    }
    catch(error){
        console.log("uploadFile",error);
        return null;
    }

}
async function uploadDocxAndJsonToGoogleDrive(jsonData,generatedDocxBuffer,projectDetails) {
    try{
        // Set up Google Drive authentication (assumed you have set up OAuth2)
        const auth=getGoogleDriveAuth()
        const {city,street,number} = projectDetails;


        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, ''); // Get current timestamp
        const cityFolderId=await createFolder(auth, city,RAW_DATA_FOLDER_ID,);
        const projectFolderId=await createFolder(auth, `${street} ${number}`,cityFolderId);
        const negarFolderId=await createFolder(auth, `4 - ניהול מי נגר`,projectFolderId);

        const timestampFolderId=await createFolder(auth, timestamp,negarFolderId);

        // // Save JSON to the folder
        const jsonFilePath = `./raw.json`;
        // await fs.writeFileSync(jsonFilePath, jsonData); // Save the JSON file locally

        // Upload JSON to Google Drive
        const jsonBuffer=new Buffer.from(jsonData)
        const jsonFileId=await uploadFile(auth,jsonFilePath,jsonBuffer, 'application/json', timestampFolderId);

        // Save the DOCX file
        const docxFilePath = `./generated.docx`;
        // await fs.writeFileSync(docxFilePath, generatedDocxBuffer); // Save the DOCX file locally
        //
        // Upload DOCX to Google Drive
        const docxFileId= await uploadFile( auth,docxFilePath,generatedDocxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', timestampFolderId);
        return {jsonFileId, docxFileId};
    }
    catch(error){
        console.error("uploadDocxAndJsonToGoogleDrive",error);
        return null;
    }

}
module.exports = { readProjects, writeProject, updateProject, getHighestRowNumber,getDocAsWord,openProjectPathInDrive,listAllFolders,getProjectImages,uploadDocxAndJsonToGoogleDrive };
