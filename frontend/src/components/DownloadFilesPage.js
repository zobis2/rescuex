import React, { useState, useEffect } from 'react';
import { downloadSingleFile, downloadZip, listAllKeys, listItems } from '../api/dowloadApi';
import {S3_BUCKET_NAME} from "../utils/consts";

const DownloadFilesPage = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [directories, setDirectories] = useState([]);
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await listItems(currentPath)
                setDirectories(response.directories);
                setFiles(response.files);
                setMessage('');
            } catch (error) {
                console.error('Error listing items', error);
                setMessage('Error listing items');
            }
        };
        fetchItems();
    }, [currentPath]);

    const downloadFile = async (key) => {
        try {
            setMessage('Downloading file...');
            const response = await downloadSingleFile(S3_BUCKET_NAME, key)
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', key.split('/').pop());
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMessage('File downloaded successfully');
        } catch (error) {
            console.error('Error downloading file', error);
            setMessage('Error downloading file');
        }
    };
    const downloadFolder = async (prefix) => {
        try {
            setMessage('Downloading folder... This may take a while.');
            const response = await listAllKeys(prefix)
            const files = response.keys;
            if (files.length > 0) {
                setMessage('Downloading files...');
                const downloadResponse = await downloadZip(S3_BUCKET_NAME, files, prefix)
                const url = window.URL.createObjectURL(new Blob([downloadResponse]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'files.zip');
                document.body.appendChild(link);
                link.click();
                link.remove();
                setMessage('Folder downloaded successfully');
            } else {
                setMessage('No files under this folder');
            }
        } catch (error) {
            console.error('Error downloading folder', error);
            setMessage('Error downloading folder');
        }
    };


    return (
        <div>
            <h1>Download Files</h1>
            {currentPath && (
                <button onClick={() => setCurrentPath(currentPath.split('/').slice(0, -2).join('/') + '/')}>Back</button>
            )}
            <div>
                <h2>Directories</h2>
                <ul>
                    {directories.map(dir => (
                        <li key={dir}>
                            <button onClick={() => setCurrentPath(dir)}>{dir}</button>
                            <button onClick={() => downloadFolder(dir)}>Download Folder</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Files</h2>
                <ul>
                    {files.map(file => (
                        <li key={file}>
                            <button onClick={() => downloadFile(file)}>{file}</button>
                        </li>
                    ))}
                </ul>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};

export default DownloadFilesPage;
