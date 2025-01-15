async function processSectionsInRebarObject(bucketName, s3ObjectFolder, netsAreasDict) {
    const rebarObject = new RebarObject(bucketName, s3ObjectFolder);
    await rebarObject.init();

    const apTable = rebarObject.getApObjectTable();

    // Get unique section values
    const sectionValues = [...new Set(apTable.map(item => item.section))];

    // Get Quantities table of all sets
    const quantitiesTable = rebarObject.createObjectQuantitiesTablePerSet(netsAreasDict);

    const sectionResults = { section_results: [] };
    const subTablesList = [];

    for (const section of sectionValues) {
        // Step 1: Create sub table for current section
        const subTable = quantitiesTable.filter(item => item.Section === section);

        // Step 2: Calculate marked object weight and length
        const markedObjectWeight = subTable.reduce((sum, item) => sum + item['AB Weight'], 0);
        const markedObjectLength = subTable.reduce((sum, item) => sum + item['AB Length'], 0);
        const markedSetsAmount = subTable.length;

        // Step 3: Get sets id for the current section not included in the sub table
        const unmarkedSetsId = apTable
            .filter(item => item.section === section && !subTable.some(subItem => subItem['Set ID'] === item.id))
            .map(item => item.id);

        // Step 4: Call getWeightFromAp function for unmarked sets
        const [unmarkedObjectWeight, , , unmarkedObjectLength,] = rebarObject.getWeightFromAp(unmarkedSetsId);
        const unmarkedSetsAmount = unmarkedSetsId.length;

        // Step 5: Calculate total AP quantities of this section
        const sectionSetIdList = apTable.filter(item => item.section === section).map(item => item.id);
        const [totalApWeight, , , totalApLength,] = rebarObject.getWeightFromAp(sectionSetIdList);
        const totalApSetsAmount = sectionSetIdList.length;

        // Step 6: Calculate the total object's AB quantities
        const totalAbWeight = markedObjectWeight + unmarkedObjectWeight;
        const totalAbLength = markedObjectLength + unmarkedObjectLength;

        // Step 7: Calculate the deviation in percentage
        const weightDeviation = Math.round(Math.abs((totalAbWeight - totalApWeight) / totalApWeight) * 100 * 100) / 100;
        const lengthDeviation = Math.round(Math.abs((totalAbLength - totalApLength) / totalApLength) * 100 * 100) / 100;

        // Store results
        subTablesList.push(subTable);
        sectionResults.section_results.push({
            section,
            total_ap_weight: totalApWeight,
            total_ap_length: totalApLength,
            total_ap_sets_amount: totalApSetsAmount,
            total_ab_weight: totalAbWeight,
            total_ab_length: totalAbLength,
            marked_object_weight: markedObjectWeight,
            marked_object_length: markedObjectLength,
            marked_sets_amount: markedSetsAmount,
            unmarked_object_weight: unmarkedObjectWeight,
            unmarked_object_length: unmarkedObjectLength,
            unmarked_sets_amount: unmarkedSetsAmount,
            weight_deviation: weightDeviation,
            length_deviation: lengthDeviation
        });
    }

    return { sectionResults, subTablesList };
}
const ExcelJS = require('exceljs');
const RebarObject = require("../classes/RebarObject");

async function generateObjectQuantitiesExcel(subTablesList, sectionResults) {
    const workbook = new ExcelJS.Workbook();

    sectionResults.section_results.forEach((sectionResult, index) => {
        const worksheet = workbook.addWorksheet(sectionResult.section);

        // Add rows for 'Rebar AP' and 'Rebar AB'
        worksheet.addRow(["AP Rebars", sectionResult.total_ap_weight, sectionResult.total_ap_length, sectionResult.total_ap_sets_amount]);
        worksheet.addRow(["AB Rebars", sectionResult.total_ab_weight, sectionResult.total_ab_length, null]);

        // Add rows for marked and unmarked sets
        worksheet.addRow([]);
        worksheet.addRow(["Marked Sets", sectionResult.marked_object_weight, sectionResult.marked_object_length, sectionResult.marked_sets_amount]);
        worksheet.addRow(["Unmarked Sets", sectionResult.unmarked_object_weight, sectionResult.unmarked_object_length, sectionResult.unmarked_sets_amount]);

        // Add rows for rebar deviation
        worksheet.addRow([]);
        worksheet.addRow(["Deviation in pct", sectionResult.weight_deviation, sectionResult.length_deviation, null]);

        // Add sub table
        const subTable = subTablesList[index];
        subTable.forEach(row => {
            worksheet.addRow([row['Set ID'], row['Marked Area'], row['AB Weight'], row['AB Length'], row['Section']]);
        });

        // Autofit the columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                maxLength = Math.max(maxLength, cell.value ? cell.value.toString().length : 0);
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}
module.exports = { generateObjectQuantitiesExcel,processSectionsInRebarObject };