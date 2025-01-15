const shapefile = require('shapefile');
const turf = require('@turf/turf');

// // Function to convert coordinates if necessary
// function convertToLatLon(coordinates) {
//     // Assuming coordinates are in [longitude, latitude] format.
//     // If your data uses a different format, adjust accordingly.
//     return coordinates.map(coord => [coord[0], coord[1]]); // Adjust the conversion as necessary
// }

async function isPointInPolygon(shapefilePath, coordinates) {
    const point = turf.point(coordinates); // Create a Turf.js point from the coordinates
    let found = false;
    let polygonInfo = null;

    try {
        const records = await batchRead('rawDatabase/test.dbf'); // Read the DBF file
        const polyGonInfos={}
        for (let record of records) {
            polyGonInfos[record.OBJECTID]=record;
        }
        const source = await shapefile.open(shapefilePath); // Open the shapefile
        let i=0
        while (true) {
            const result = await source.read(); // Read each feature

            if (result.done) break; // No more features

            const feature = result.value;
            i++;

            // console.log('Polygon Properties:', feature.properties);
            // console.log('Polygon Geometry:', JSON.stringify(feature.geometry));
// Convert polygon coordinates to latitude and longitude
//             const polygonCoordinates = convertToLatLon(feature.geometry.coordinates[0]); // Assuming a single polygon
            // const polygon = turf.polygon([polygonCoordinates]); // Create Turf.js polygon

            // Check if the point is within the polygon
            if (turf.booleanPointInPolygon(point, feature.geometry)  ){
                found = true;
                polygonInfo = feature.properties; // Get polygon properties
                const polyGon=JSON.parse(JSON.stringify(polygonInfo));
                polygonInfo = polyGonInfos[polyGon.OBJECTID];
                let x=0;
                // for (let field in polyGon) {
                //     if (polyGon[field]) {
                //         polyGon[field] = iconv.decode(Buffer.from(polyGon[field].toString(), 'binary'), 'utf-8');
                //     }
                // }
                break; // Exit loop if found
            }
        }
    } catch (error) {
        console.error('Error reading shapefile:', error);
    }

    return found ? polygonInfo : null;
}
const {DBFFile} = require( 'dbffile');
const iconv = require( 'iconv-lite');

async function batchRead(path) {
    let dbf = await DBFFile.open(path);
    console.log(`DBF file contains ${dbf.recordCount} records.`);
    console.log(`Field names: ${dbf.fields.map(f => f.name).join(', ')}`);
    let records = await dbf.readRecords(100); // batch-reads up to 100 records, returned as an array
    for (let record of records) {
        // Decode the Hebrew fields using iconv-lite
        for (let field of dbf.fields) {
            if (record[field.name]) {
                record[field.name] = iconv.decode(Buffer.from(record[field.name].toString(), 'binary'), 'utf-8');
            }
        }
        // console.log(record);
    }
    return records;
}const shapefilePath = 'rawDatabase/test.shp'; // Update with your shapefile path
// const coordinates = [190652,657473 ]; // Example coordinates (longitude, latitude)
const coordinates = [180686,572396 ]; // Example coordinates (longitude, latitude)
// y , x
// 572396 , 180686
// (async () => {
//     const info = await isPointInPolygon(shapefilePath, coordinates);
//     if (info) {
//         console.log('The point is inside the polygon. Polygon info:', JSON.stringify(info));
//     } else {
//         console.log('The point is not inside any polygon.');
//     }
// })();
module.exports = {isPointInPolygon}