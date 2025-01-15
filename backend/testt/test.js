const fs = require("fs").promises;
const {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    Media,
    patchDocument,
    PatchType,
    ImageRun, VerticalAlign, TextDirection, HeadingLevel, WidthType, BorderStyle,
} = require("docx");
const PizZip = require("pizzip");

// Sample Data for Placeholders
const placeholders = {
    "{serialId}": "12345",
    "{street}": "Sample Street",
    "{streetNumber}": "12",
    "{city}": "Sample City",
    "{gosh}": "678",
};

// Table Data
const tableData = [
    { name: "גגות ומרפסות", size: 2, percentage: "10.00", coefficient: 0.9, cumulativeVolume1to5: "27.00", cumulativeVolume1to50: "275.40" },
    { name: "גינון כללי", size: 3, percentage: "15.00", coefficient: 0.4, cumulativeVolume1to5: "18.00", cumulativeVolume1to50: "" },
];

const mammoth = require("mammoth");

async function extractTextFromDocx(filePath) {
    try {
        const buffer = await fs.readFile(filePath);
        const { value: text } = await mammoth.extractRawText({ buffer });

        console.log("Extracted Text:", text);
        return text;
    } catch (error) {
        console.error("Error extracting text from DOCX:", error);
    }
}

const extractPlaceholders = async (combinedText) => {

    const regex = /{{(.*?)}}/g;
    const matches = [];
    let match;

    // Extract placeholders accurately
    while ((match = regex.exec(combinedText)) !== null) {
        matches.push(match[1].trim());
    }

    console.log("Placeholders found:", matches);
    return matches;
};
const table = new Table({
    columnWidths: [3505, 5505],
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("עמודה שניה")],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("עמודה ראשונה")],
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children:[new Paragraph("ערך 2")],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("ערך 1")],
                }),
            ],
        }),
    ],
});
const createReversedTableNagar = (data) => {
    const header = [
        "רכיב תורם נגר",
        "גודל",
        "אחוז מהשטח",
        "מקדם נגר",
        "נפח מצטבר ב1:5",
        "נפח מצטבר ב1:50",
    ].reverse(); // Reverse header values

    const headerRow = new TableRow({
        children: header.map((text) =>
            new TableCell({
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                },
                shading: {
                    fill: "FF0000", // Red background
                },
                width: { size: 5000, type: WidthType.DXA },
                height: { value: 500, type: "dxa" },
                children: [
                    new Paragraph({
                        text,
                        alignment: "center", // Center align text
                        spacing: { after: 200 }, // Add spacing
                    }),
                ],
            })
        ),
    });

    const rows = data.map((row) =>
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(row.name)] }),
                new TableCell({ children: [new Paragraph(row.size.toString())] }),
                new TableCell({ children: [new Paragraph(row.percentage)] }),
                new TableCell({ children: [new Paragraph(row.coefficient.toString())] }),
                new TableCell({ children: [new Paragraph(row.cumulativeVolume1to5)] }),
                new TableCell({ children: [new Paragraph(row.cumulativeVolume1to50 || "0")] }),
            ].reverse(), // Reverse row values
        })
    );

    return new Table({
        columnWidths: [5000, 5000, 5000, 2500, 2500, 5000],

        rows: [headerRow, ...rows], // Include header row first
    });
}
;const modifyDocx = async () => {
    try {
        const filePath="template2.docx";
        const templateBuffer = await fs.readFile(filePath);
        const imgBuffer = await fs.readFile("a.png");
        const text=await extractTextFromDocx(filePath);
        const placeHolders=await extractPlaceholders(text)
        // Patch the DOCX template
        const buffer = await patchDocument({
            outputType: "nodebuffer",
            data: templateBuffer,
            patches: {
                serialId: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("12345")],
                },
                street: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("Sample Street")],
                },
                streetNumber: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("12")],
                },
                city: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("Sample City")],
                },
                gosh: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("678")],
                },
                img_a: {
                    type: PatchType.PARAGRAPH,
                    children: [
                        new ImageRun({
                            data: imgBuffer,
                            transformation: { width: 100, height: 100 },
                        }),
                    ],
                },
                table_nagar: {
                    type: PatchType.DOCUMENT,
                    children: [
                        createReversedTableNagar(tableData)
                    ],
                },
                // table_nagar: {
                //     type: PatchType.DOCUMENT,
                //     children: [createTable(tableData)],
                // },
            },
        });

        // Save the modified DOCX
        await fs.writeFile("output.docx", buffer);
        console.log("DOCX generated successfully.");
    } catch (error) {
        console.error("Error generating DOCX:", error);
    }
};

// Run the function
modifyDocx();
