import React, { useState, useEffect } from 'react';
import { getImageKeys } from '../../api/folderApi';
import { getLogInsights } from '../../api/logsApi';
import { S3_BUCKET_ORTHOPHOTO } from '../../utils/consts';
import ImageGallery from "./ImageGallery";

const DoneLogViewer = ({ bucketName, projectName }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettings, setShowSetting] = useState(false);
    const [externalKeys, setExternalKeys] = useState([]);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await getLogInsights(bucketName, projectName)
                setInsights(data);
                const keys = await getImageKeys(bucketName, projectName)
                // Extract filenames from keys
                const filenamesFromKeys = keys.map(key => key.split('/').pop());

                // Log filenamesFromKeys to debug
                console.log('Filenames from Keys:', filenamesFromKeys);
                debugger;

                // Filter photos by status 'SUCCESS' and create a set of filenames for quick lookup
                const photoFiles = new Set(
                    data.photos
                        .filter(photo => photo.status === 'SUCCESS') // Only take photos with status 'SUCCESS'
                        .flatMap(photo => photo.files)
                );
                // Filter keys that are included in both photos and keys
                const includedInPhotosAndKeys = [...new Set(filenamesFromKeys.filter(filename => photoFiles.has(filename)))];

                // Filter keys that are in keys but not in photos
                const onlyInKeysNotInPhotos = [...new Set(filenamesFromKeys.filter(filename => !photoFiles.has(filename)))];
                const onlyInKeysNotInPhotosKeys = keys.filter(key => !photoFiles.has(key.split('/').pop()));
                setExternalKeys(onlyInKeysNotInPhotosKeys);
                // Log the filtered results to debug
                console.log('Included in both:', includedInPhotosAndKeys);
                console.log('Only in keys, not in photos:', onlyInKeysNotInPhotos);
            } catch (error) {
                setError('Error fetching log file insights');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [bucketName, projectName]);

    if (loading) return <div>Loading Logs and Insights...</div>;
    if (error) return <div>{error}</div>;
    const toggleSettings = () => {
        setShowSetting(prevState => !prevState);
    };
    return (
        <div>
            <h3>Log File Insights</h3>
            {insights ? (
                <div>
                    <p><strong>Start Time:</strong> {insights.startTime}</p>
                    <p><strong>End Time:</strong> {insights.endTime}</p>
                    <p><strong>RAM Used:</strong> {insights.ramUsed}</p>
                    <p><strong>CPU Used:</strong> {insights.cpuUsed}</p>
                    <p><strong>OS:</strong> {insights.os}</p>
                    <p><strong>Orthophoto Started After:</strong> {insights.startOrthophotoAfter}</p>

                    <p><strong>Total Time Taken :</strong> {insights.timeTaken}</p>
                    {/*<p><strong>Time Taken to Download Files:</strong> {insights.downloadTime}</p>*/}
                    {/*<p><strong>Time Taken to Generate Orthophoto:</strong> {insights.generateTime}</p>*/}
                    <p><strong>Settings Applied:</strong></p>
                    <button className="btn btn-primary" onClick={toggleSettings}>
                        {showSettings ? 'Hide Settings' : 'Show Settings'}
                    </button>
                    <ul>
                        {showSettings&&insights.settingsApplied && Object.entries(insights.settingsApplied).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                        ))}
                    </ul>
                    <p ><strong                                 className="btn btn-danger me-2"
                    >Photos That Was not Used:</strong></p>
                    {/*<ul>*/}
                    {/*    {insights.photos && insights.photos.map((photo, index) => (*/}
                    {/*        <li key={index}>*/}
                    {/*            Files: {photo.files.join(', ')}, Status: {photo.status}, Matcher: {photo.matcher},*/}
                    {/*            Additional Info: {photo.additionalInfo}*/}
                    {/*        </li>*/}˚
                    {/*    ))}*/}
                    {/*</ul>*/}
                    <ImageGallery
                        bucketName={S3_BUCKET_ORTHOPHOTO}
                        externalKeys={externalKeys}
                    />

                </div>
            ) : (
                <div>No insights available</div>
            )}
        </div>
    );
};

export default DoneLogViewer;
