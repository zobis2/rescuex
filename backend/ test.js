const fs = require('fs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, Media } = require('docx');

// Sample Data
const placeholders = {
    "{serialId}": "12345",
    "{street}": "Sample Street",
    "{streetNumber}": "12",
    "{city}": "Sample City",
    "{gosh}": "678",
    "{img_a}": "path_to_image.jpg", // Replace with actual image path
};

// JSON data for the table
const tableNagarData = JSON.parse('[{"name":"גגות ומרפסות","size":2,"coefficient":0.9,"percentage":"10.00","cumulativeVolume1to5":"27.00","cumulativeVolume1to50":"275.40"}]');

// Function to create a dynamic table
const generateTable = (data) => {
    return new Table({
        rows: data.map((row) =>
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(row.name)] }),
                    new TableCell({ children: [new Paragraph(row.size.toString())] }),
                    new TableCell({ children: [new Paragraph(row.percentage)] }),
                    new TableCell({ children: [new Paragraph(row.coefficient.toString())] }),
                    new TableCell({ children: [new Paragraph(row.cumulativeVolume1to5)] }),
                    new TableCell({ children: [new Paragraph(row.cumulativeVolume1to50 || "0")] }),
                ],
            })
        ),
    });
};

// Function to replace placeholders dynamically
const replacePlaceholders = (text) => {
    return text.replace(/{\w+}/g, (match) => placeholders[match] || match);
};

// Create the document
const doc = new Document();

// Add content dynamically, keeping other text intact
doc.addSection({
    children: [
        new Paragraph(new TextRun(replacePlaceholders("מס\"ד-{serialId}"))),
        new Paragraph(new TextRun(replacePlaceholders("{street} {streetNumber}"))),
        new Paragraph(new TextRun(replacePlaceholders("{city}"))),
        new Paragraph(new TextRun(replacePlaceholders("גוש {gosh} חלקה"))),
        new Paragraph(Media.addImage(doc, fs.readFileSync(placeholders["{img_a}"]))), // Add Image
        generateTable(tableNagarData), // Add Table
    ],
});

// Generate and save the DOCX
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("output.docx", buffer);
    console.log("DOCX generated successfully.");
});
