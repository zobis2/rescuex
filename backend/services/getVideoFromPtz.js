// const axios = require('axios');
// const xml2js = require('xml2js');
//
// // Camera credentials and IP address
// const cameraIp = '46.210.86.7:81';
// const username = 'admin';
// const password = 'TBIY2012ACPropto';
//
// // Function to search for the latest video files
// async function searchLatestVideos() {
//     const searchUrl = `http://${cameraIp}/ISAPI/ContentMgmt/search`;
//
//     const searchBody = `<?xml version="1.0" encoding="utf-8"?>
//     <CMSearchDescription>
//         <searchID>unique-search-id</searchID>
//         <trackList>
//             <trackID>101</trackID>
//         </trackList>
//         <timeSpanList>
//             <timeSpan>
//                 <startTime>2024-08-14T13:00:00Z</startTime>
//                 <endTime>2024-08-14T14:59:59Z</endTime>
//             </timeSpan>
//         </timeSpanList>
//         <maxResults>100</maxResults>
//         <searchResultPostion>0</searchResultPostion>
//         <metadataList>
//             <metadataDescriptor>//recordType.meta.std-cgi.com</metadataDescriptor>
//         </metadataList>
//     </CMSearchDescription>`;
//
//     try {
//         const response = await axios.post(searchUrl, searchBody, {
//             auth: {
//                 username: username,
//                 password: password,
//             },
//             headers: {
//                 'Content-Type': 'application/xml',
//             },
//         });
//
//         if (response.status === 200) {
//             const parsedResult = await xml2js.parseStringPromise(response.data);
//             const rtspLinks = [];
//
//             // Assuming XML response uses a specific namespace, similar to Python's implementation
//             const namespace = 'http://www.hikvision.com/ver20/XMLSchema';
//             const matchList = parsedResult['CMSearchResult']['matchList'][0]['searchMatchItem'];
//
//             matchList.forEach((item) => {
//                 const playbackURI = item['mediaSegmentDescriptor'][0]['playbackURI'][0];
//                 rtspLinks.push(playbackURI);
//             });
//
//             return rtspLinks;
//         } else {
//             throw new Error(`Failed to search for video files. Status code: ${response.status}`);
//         }
//     } catch (error) {
//         throw new Error(`An error occurred during the request: ${error.message}`);
//     }
// }
//
// // Main function to execute the search process
// async function main() {
//     try {
//         const rtspLinks = await searchLatestVideos();
//         if (rtspLinks.length > 0) {
//             console.log('RTSP Links found:');
//             rtspLinks.forEach((link) => {
//                 console.log(link);
//             });
//         } else {
//             console.log('No RTSP links found');
//         }
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//     }
// }
//
// main();
