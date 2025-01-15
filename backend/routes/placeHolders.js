const express = require('express');
const multer = require('multer');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
// const TableModule = require('docxtemplater-table-module');

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const {getDocAsWord} = require("../services/google/googleSheets");
const upload = multer({ dest: 'uploads/' });
const officegen = require('officegen');
const {generateDocxFromTemplate, extractPlaceholdersFromDocx} = require("../services/docxJs/replaceTemplates");

const router = express.Router();

// Helper function to extract placeholders from the DOCX
function extractPlaceholders(doc) {
    const placeholders = new Set();

    doc.getFullText().split(/\s+/).forEach((word) => {
        const matches = word.match(/{(.*?)}/g); // Match {placeholder}
        if (matches) {
            matches.forEach((match) => {
                placeholders.add(match.replace(/[{}]/g, '')); // Clean { and }
            });
        }
    });

    return Array.from(placeholders); // Convert Set to Array
}

// Route to download the Google Doc as a DOCX and extract placeholders
router.get('/download-template', async (req, res) => {
    try {
        const googleDocId = '1dpkWC_THDtITQ5WCg_OT4-ytMf3CdhH6IlL21JoGXjg'; // Replace with your Google Doc ID
        const response=await getDocAsWord(googleDocId);
        // const zip = new PizZip(response.data);
        // // const doc = new Docxtemplater(zip, {
        // //     modules: [new TableModule({})], // Attach table module
        // // });
        // const doc = new Docxtemplater(zip
        // );
        // const placeholders = extractPlaceholders(doc);

        // Extract placeholders from the downloaded Google Doc
        const placeholders = await extractPlaceholdersFromDocx(response.data);

        res.json({ placeholders });
    } catch (error) {
        console.error('Error downloading template:', error);
        res.status(500).json({ error: 'Failed to download and process template' });
    }
});
// router.post('/generate-docx', upload.any(), async (req, res) => {
//     try {
//         const  tableNagar  = JSON.parse(req.body.table_nagar); // Receive the table data from the frontend
//
//         // Create a new DOCX document
//         const docx = officegen('docx');
//
//         docx.on('finalize', () => {
//             console.log('DOCX file created successfully.');
//         });
//
//         docx.on('error', (err) => {
//             console.error('Error generating DOCX:', err);
//         });
//
//         // Add a title in Hebrew
//         const titleParagraph = docx.createP();
//         titleParagraph.addText('דוח נגר', { font_size: 24, bold: true, rtl: true });
//
//         // Add the table
//         const tableData = [
//             [
//                 { val: 'רכיב תורם נגר', opts: { b: true, sz: '24' } },
//                 { val: 'גודל', opts: { b: true, sz: '24' } },
//                 { val: 'אחוז מהשטח', opts: { b: true, sz: '24' } },
//                 { val: 'מקדם נגר', opts: { b: true, sz: '24' } },
//                 { val: 'נפח מצטבר ב1:5', opts: { b: true, sz: '24' } },
//                 { val: 'נפח מצטבר ב1:50', opts: { b: true, sz: '24' } },
//             ],
//             ...tableNagar.map((row) => [
//                 { val: row.name, opts: { sz: '20' } },
//                 { val: row.size.toString(), opts: { sz: '20' } },
//                 { val: `${row.percentage}%`, opts: { sz: '20' } },
//                 { val: row.coefficient.toString(), opts: { sz: '20' } },
//                 { val: row.cumulativeVolume1to5.toString(), opts: { sz: '20' } },
//                 { val: row.cumulativeVolume1to50 || '0', opts: { sz: '20' } },
//             ]),
//         ];
//
// // Ensure column widths are defined
//         const table = docx.createTable(tableData, {
//             tableColWidth: 4261, // Default column width
//             borders: true,
//         });
//
//         // Define the output file path (optional if sending directly)
//         const outputPath = path.join(__dirname, '../', 'report.docx');
//         const output = fs.createWriteStream(outputPath);
//
//
//
//         output.on('finish', () => {
//             res.download(outputPath, 'report.docx', (err) => {
//                 if (err) console.error('Error sending file:', err);
//                 fs.unlinkSync(outputPath); // Clean up the generated file
//             });
//         });
//         output.on('error', (err) => {
//             console.error('Stream error:', err);
//             res.status(500).json({ error: 'Failed to generate DOCX' });
//         });
//         // Generate the DOCX document
//         docx.generate(output);
//     } catch (error) {
//         console.error('Error generating DOCX:', error);
//         res.status(500).json({ error: 'Failed to generate DOCX' });
//     }
// });
// Endpoint to generate DOCX with replaced placeholders


// Helper: Generate the table section with Officegen
// async function generateTableSection(tableNagar) {
//     const docx = officegen('docx');
//     docx.on('error', (err) => console.error('Officegen error:', err));
//
//         // Add the table
//         const tableData = [
//             [
//                 { val: 'רכיב תורם נגר', opts: { b: true, sz: '24' } },
//                 { val: 'גודל', opts: { b: true, sz: '24' } },
//                 { val: 'אחוז מהשטח', opts: { b: true, sz: '24' } },
//                 { val: 'מקדם נגר', opts: { b: true, sz: '24' } },
//                 { val: 'נפח מצטבר ב1:5', opts: { b: true, sz: '24' } },
//                 { val: 'נפח מצטבר ב1:50', opts: { b: true, sz: '24' } },
//             ],
//             ...tableNagar.map((row) => [
//                 { val: row.name, opts: { sz: '20' } },
//                 { val: row.size.toString(), opts: { sz: '20' } },
//                 { val: `${row.percentage}%`, opts: { sz: '20' } },
//                 { val: row.coefficient.toString(), opts: { sz: '20' } },
//                 { val: row.cumulativeVolume1to5.toString(), opts: { sz: '20' } },
//                 { val: row.cumulativeVolume1to50 || '0', opts: { sz: '20' } },
//             ]),
//         ];
//
//     const outputPath = path.join(__dirname, 'tableSection.docx');
//     const output = fs.createWriteStream(outputPath);
//     // docx.createTable(tableData, { border: true }).generate(output);
//         const table = docx.createTable(tableData, {
//             tableColWidth: 4261, // Default column width
//             borders: true,
//         });
//             docx.generate(output);
//
//     return new Promise((resolve, reject) => {
//         output.on('finish', () => resolve(outputPath));
//         output.on('error', reject);
//     });
// }
// const generateTableAsHTML = (tableNagar) => {
//     let html = '<table border="1" style="border-collapse: collapse;">';
//     html += '<tr><th>רכיב תורם נגר</th><th>גודל</th><th>אחוז מהשטח</th><th>מקדם נגר</th><th>נפח מצטבר ב1:5</th><th>נפח מצטבר ב1:50</th></tr>';
//     tableNagar.forEach(row => {
//         html += `<tr>
//             <td>${row.name}</td>
//             <td>${row.size}</td>
//             <td>${row.percentage}%</td>
//             <td>${row.coefficient}</td>
//             <td>${row.cumulativeVolume1to5}</td>
//             <td>${row.cumulativeVolume1to50 || 0}</td>
//         </tr>`;
//     });
//     html += '</table>';
//     return html;
// };

// router.post('/generate-docx', upload.any(), async (req, res) => {
//     try {
//         // const content = fs.readFileSync(req.files[0].path, 'binary');
//         const googleDocId = '1xcO7ewRKXywUdqYSk9zZw0ymLoWDmxQJ12BtyZfk9dA'; // Replace with your Google Doc ID
//         const response = await getDocAsWord(googleDocId);
//         const zip = new PizZip(response.data);
//         const doc = new Docxtemplater(zip);
//         const data={};
//         // Generate table using officegen
//         // const tablePath = await generateTableSection(JSON.parse(req.body.table_nagar));
//         // const tableContent = fs.readFileSync(tablePath, 'binary');
//         // data.table_nagar = tableContent; // Set as a placeholder
//         const tableNagar = JSON.parse(req.body.table_nagar);
//         const tableHTML = generateTableAsHTML(tableNagar);
//         data.table_nagar=tableHTML;
//         req.body.fields.forEach((field) => {
//             const {key, value} = JSON.parse(field);
//             data[key] = value;
//         });
//         // // Example table data structure (map your table JSON to this format)
//         // const tableNagar = {
//         //     headers: ['רכיב תורם נגר', 'גודל', 'אחוז מהשטח', 'מקדם נגר', 'נפח מצטבר ב1:5', 'נפח מצטבר ב1:50'],
//         //     rows: req.body.table_nagar ? JSON.parse(req.body.table_nagar) : [],
//         // };
//         //
//         // // Set table data in the template with {tableNagar}
//         // data.table_nagar = tableNagar;
//         doc.setData(data);
//         doc.render();
//
//         const buffer = doc.getZip().generate({type: 'nodebuffer'});
//
//         res.setHeader('Content-Disposition', 'attachment; filename="modified.docx"');
//         res.send(buffer);
//         // fs.unlinkSync(req.files[0].path); // Clean up uploaded file
//     } catch (error) {
//         console.error('Error generating DOCX:', error);
//         res.status(500).json({error: 'Failed to generate DOCX'});
//     }
// });
router.post('/generate-docx', upload.any(), async (req, res) => {
    try {
        const docBuffer = await generateDocxFromTemplate(req);
        res.setHeader('Content-Disposition', 'attachment; filename="modified.docx"');
        res.send(docBuffer);
    } catch (error) {
        console.error('Error generating DOCX:', error);
        res.status(500).json({ error: 'Failed to generate DOCX' });
    }
    finally {
        // Clean up all uploaded files
        try {
            for (const file of req.files) {
                await fs.unlink(file.path);
                console.log(`Deleted file: ${file.path}`);
            }
        } catch (err) {
            console.error('Error deleting files:', err);
        }
    }
});

module.exports = router;
