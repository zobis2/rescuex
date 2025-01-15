import React, { useEffect, useState } from 'react';
import ImageGallery from "../OrthoPhoto/ImageGallery";
import settingsOptions from '../../utils/orthophoto/settings.json';
import {sleep} from "../Upload/utils";
import LiveLogViewer from "../OrthoPhoto/LiveLogViewer";
import { S3_BUCKET_NAME, S3_BUCKET_ORTHOPHOTO } from '../../utils/consts';
import { executeOrthophoto, uploadOrthophotoSettings } from '../../api/uploadApi';
import { extractBestFrames } from '../../api/streamApi';

const VideoToOrthoPhoto = ({ video }) => {
    debugger;
    console.log(settingsOptions);
    const {key,duration,size,endDate,startDate}=video;
    const [startTime, setStartTime] = useState(0);
    // const [videoKey, setVideoKey] = useState(key);
    const [endTime, setEndTime] = useState(0);
    const [frameInterval, setFrameInterval] = useState(1)
    const [projectName, setProjectName] = useState('');
    const [extractedFrames, setExtractedFrames] = useState(false);
    const [executed, setExecute] = useState(false);
    const [running, setRunning] = useState(false);
    const [message, setMessage] = useState('');

    const handleProjectNameChange = (event) => {
        const value = event.target.value;
        if (/^[a-zA-Z0-9_-]{1,40}$/.test(value) || value === '') {
            setProjectName(value);
        }
    };
    const s3_bucket_video = S3_BUCKET_NAME
    const s3_bucket_orthophoto = S3_BUCKET_ORTHOPHOTO;
    const handleExecuteWithSettings = async () => {
        try {
            setRunning(true);
            setMessage('Starting Auto Process');

            console.log(new Date(),"handleExtractBestFrames");
        // await handleExtractBestFrames();
            setExecute(false);
            setMessage('Pushing Settings');
            debugger;
            const settingsResponse = await uploadOrthophotoSettings(settingsOptions["ultra"], s3_bucket_orthophoto, projectName)
            console.log(new Date(),settingsResponse);
            setMessage('Execute OrthoPhoto With Settings');

            const response = await executeOrthophoto(s3_bucket_orthophoto, projectName)
            setMessage('Execute OrthoPhoto With Settings Successfully');

            console.log('Execution successful', response);
            await sleep(20000);
            setExecute(true);
            setRunning(false);
        } catch (error) {
            console.error('Execution failed', error);
        }
    };
    const handleExtractBestFrames = async () => {
        try {
            setRunning(true);

            setMessage(`'Extracting Best Frames... StartSeconds ${startTime}. 
            End Seconds: ${endTime}`);
            setExtractedFrames(false);
            const response = await extractBestFrames(
                s3_bucket_video, 
                s3_bucket_orthophoto, 
                key, 
                startTime, 
                endTime, 
                projectName,
                frameInterval
            )

            if (response.success) {
                setExtractedFrames(true);

                // alert('Best frames extracted and uploaded successfully!');
            } else {
                console.error('Frame extraction failed');
            }
        } catch (error) {
            console.error('Error extracting frames', error);
        }
        setRunning(false);

    };

    useEffect(() => {
        // Prompt or input for startTime, endTime, and projectName
        setStartTime(0);  // initialize as needed or pull from video metadata
        setEndTime(duration.replace(" minutes","")*60);    // initialize as needed or pull from video metadata
        // setProjectName(''); // initialize if available
    }, [ video]);
    return (
        <div>
            <div>
                <label>Start Time</label>
                <input
                    type="number"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Enter start time (seconds)"
                />
                <label>End Time</label>
                <input
                    type="number"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Enter end time (seconds)"
                />
                <label>Frame Interval</label>
                <input
                    type="number"
                    value={frameInterval}
                    onChange={(e) => setFrameInterval(e.target.value)}
                    step="1"
                    placeholder="Frame Interval (seconds)"
                />
                <label>Project Name</label>
                <input
                    type="text"
                    className="form-control"
                    id="projectName"
                    placeholder={"projectName"}
                    value={projectName}
                    onChange={handleProjectNameChange}
                    pattern="^[a-zA-Z0-9_-]{1,40}$"
                    title="Project name must be a single word, up to 40 characters long, and can only include letters, numbers, underscores, and hyphens."

                />
                {/*{key}*/}
                <button onClick={handleExecuteWithSettings} disabled={running}>Execute Auto OrthoPhoto</button>

                <button onClick={handleExtractBestFrames} disabled={running} >Extract Best Frames</button>
                <div>
                    <p>
                        {message}
                    </p>
                </div>
                {extractedFrames && (<div>

                    <ImageGallery bucketName={s3_bucket_orthophoto} projectName={projectName}/>

                </div>)}
                {executed && <LiveLogViewer bucketName={s3_bucket_orthophoto} projectName={projectName}/>}

            </div>
        </div>
    );
};

export default VideoToOrthoPhoto;
