// Load environment variables from .env file
require('dotenv').config();
const { google } = require('googleapis');

// Google Sheets API configuration
const sheets = google.sheets('v4');

// Authenticate with Google
async function authorize() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    google.options({ auth: authClient });
}

// Function to read data from a Google Sheet
async function readSheet(spreadsheetId, range) {
    await authorize();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        console.log('Sheet Data:', response.data.values);
        return response.data.values;
    } catch (err) {
        console.error('Error reading from sheet:', err);
    }
}

// Function to write data to a Google Sheet
async function writeSheet(spreadsheetId, range, values) {
    await authorize();

    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW', // or 'USER_ENTERED'
            requestBody: {
                values,
            },
        });
        console.log(`Updated ${response.data.updatedCells} cells.`);
    } catch (err) {
        console.error('Error writing to sheet:', err);
    }
}

// Replace with your Google Sheet ID
const spreadsheetId = '1MvTdL_LA-Qiz5vZI8DsD_qIY-Yya3Ywg9XaVbnNSAjE';

// Example usage
(async () => {
    try {
        // Reading data from the sheet
        const readRange = 'Sheet1!A1:B2'; // Adjust range as needed
        const data = await readSheet(spreadsheetId, readRange);
        console.log('Read Data:', data);

        // Writing new data to the sheet
        const writeRange = 'Sheet1!A3:B3'; // Adjust range as needed
        const newValues = [['Hello', 'World']];
        await writeSheet(spreadsheetId, writeRange, newValues);
    } catch (err) {
        console.error('Error in main function:', err);
    }
})();
