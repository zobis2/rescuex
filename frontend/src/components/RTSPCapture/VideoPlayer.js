import React, { useEffect, useState } from 'react';
import { generatePresignedUrl } from '../../api/folderApi';
import axios from '../../axiosConfig';
import { S3_BUCKET_NAME } from '../../utils/consts';

const VideoPlayer = ({ s3Key }) => {
    const [videoUrl, setVideoUrl] = useState('');
    debugger;
    useEffect(() => {
        setVideoUrl('')
        const fetchPresignedUrl = async () => {
            try {
                const response = await generatePresignedUrl(S3_BUCKET_NAME, s3Key)
                setVideoUrl(response.url);
            } catch (error) {
                console.error('Error fetching presigned URL:', error);
            }
        };

        fetchPresignedUrl();
    }, [s3Key]);

    return (
        <div>
            {videoUrl ? (
                <div>

                   <h2>
                       {s3Key}
                   </h2>
                    <video controls style={{width: '100%', maxWidth: '600px', height: 'auto'}}>
                        <source src={videoUrl} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>

            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
};

export default VideoPlayer;
