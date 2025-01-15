const turf = require('@turf/turf');

// Define the polygon coordinates (make sure to replace these with your actual coordinates)
const polygonCoordinates = [
    [30, 10],
    [40, 40],
    [20, 40],
    [10, 20],
    [30, 10] // Close the polygon
];

// Create a GeoJSON polygon
const polygon = turf.polygon([polygonCoordinates]);

// Define the point coordinates to check
const pointCoordinates = [15, 25]; // Replace with your coordinates
const point = turf.point(pointCoordinates);

// Check if the point is inside the polygon
const isInside = turf.booleanPointInPolygon(point, polygon);

if (isInside) {
    console.log('The point is inside the polygon.');
} else {
    console.log('The point is outside the polygon.');
}
