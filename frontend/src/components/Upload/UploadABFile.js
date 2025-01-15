// UploadABFile.js

import React, { useState, useEffect } from 'react';
import { S3_BUCKET_NAME, FILE_TYPES_AB } from '../../utils/consts';
import ValidationDialog from './ValidationDialogAB';
import {formatDate} from "./utils"; // Import ValidationDialog
import { uploadSingleFile } from '../../api/uploadApi';

const UploadABFile = ({
                          file,
                          hierarchy,
                          date,
                          fileType,
                          validationResponse,
                          existingPaths,
                          onUploadComplete,
                          onOverrideDecision
                      }) => {
    const [showOverrideDialog, setShowOverrideDialog] = useState(false);
    const [showValidationDialog, setShowValidationDialog] = useState(false); // State for validation dialog
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        debugger;

        if (validationResponse) {
            if (validationResponse.validationError) {
                setShowValidationDialog(true); // Show validation dialog if there is an error
            } else {
                const fullPath = `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}/${'AB'.toUpperCase()} Versions/${formatDate(date)}/set ${file.name.match(/set (\d+)\.txt/)[1]}/set ab.txt`;
                if (existingPaths.includes(fullPath)) {

                    setShowOverrideDialog(true);
                } else {
                    handleUpload();
                }
            }
        }
    }, [validationResponse]);

    const handleUpload = async (override = false, forceUpload = false) => {
        setIsUploading(true);
        const formData = new FormData();
        const fileName = getNewFileName(fileType, file.name);
        // debugger;
        const fullPath = `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}/${'AB'.toUpperCase()} Versions/${formatDate(date)}/set ${file.name.match(/set (\d+)\.txt/)[1]}/set ab.txt`;

        // Allow upload if forced (user chooses to continue) or if no validation error and no need for override
        if (forceUpload
            || (
                !validationResponse.validationError &&
                (override || !existingPaths.includes(fullPath))

            )

        ) {

            if (validationResponse.buffer) {
                const buffer = atob(validationResponse.buffer);
                const byteArray = new Uint8Array(buffer.length);
                for (let i = 0; i < buffer.length; i++) {
                    byteArray[i] = buffer.charCodeAt(i);
                }
                const modifiedFile = new File([byteArray], fileName, { type: file.type });
                formData.append('file', modifiedFile, fileName);
            } else {
                formData.append('file', file, fileName);
            }
            const folderName = `set ${file.name.split(' ')[1].split('.')[0]}/`;
            formData.append('folderName', folderName);

            formData.append('client', hierarchy.client);
            formData.append('project', hierarchy.project);
            formData.append('floor', hierarchy.floor);
            formData.append('element', hierarchy.element);
            formData.append('object', hierarchy.object);
            formData.append('date', date);
            formData.append('typeUpload', 'AB');
            formData.append('BUCKET_NAME', S3_BUCKET_NAME);
            console.log("upload file:",file.name,override,forceUpload)
            try {
                await uploadSingleFile(formData)
                onUploadComplete(file, true, override);
            } catch (error) {
                console.error('Error uploading file', error);
                onUploadComplete(file, false, override);
            } finally {
                setIsUploading(false);
            }
        } else {
            onUploadComplete(file, false, override);
        }
    };

    const handleOverrideDialogClose = (confirm) => {
        setShowOverrideDialog(false);
        onOverrideDecision(file, confirm);
        if (confirm) {
            handleUpload(true);
        } else {
            onUploadComplete(file, false);
        }
    };

    // Handle user decision from validation dialog
    const handleValidationDecision = (action) => {
        setShowValidationDialog(false);
        switch (action) {
            case 'continue':
                validationResponse.validationError = null;
                const fullPath = `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}/${'AB'.toUpperCase()} Versions/${formatDate(date)}/set ${file.name.match(/set (\d+)\.txt/)[1]}/set ab.txt`;
                if (existingPaths.includes(fullPath)) {

                    setShowOverrideDialog(true);
                break;
                }
                handleUpload(false, true); // Force upload by passing true
                break;
            case 'cancel':
                onUploadComplete(file, false);
                break;
            case 'stop':
                onUploadComplete(file, false, 'stop');
                break;
            default:
                break;
        }
    };

    const getNewFileName = (fileType, originalName) => {
        if (fileType === 'AB') {
            return `set ab.txt`;
        }
        return originalName;
    };

    return (
        <div>
            {showOverrideDialog && (
                <div className="dialog">
                    <h3>Override File</h3>
                    <p>Do you want to override the file: {file.name}?</p>
                    <button onClick={() => handleOverrideDialogClose(true)}>Override</button>
                    <button onClick={() => handleOverrideDialogClose(false)}>Cancel</button>
                </div>
            )}

            {showValidationDialog && (
                <ValidationDialog
                    file={file}
                    error={validationResponse.validationError}
                    onContinue={() => handleValidationDecision('continue')}
                    onCancel={() => handleValidationDecision('cancel')}
                    onStop={() => handleValidationDecision('stop')}
                />
            )}
        </div>
    );
};

export default UploadABFile;
