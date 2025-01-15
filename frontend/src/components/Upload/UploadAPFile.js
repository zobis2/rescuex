import React, { useState, useEffect } from 'react';
import { uploadMultipleImages, uploadSingleFile } from '../../api/uploadApi';
import { S3_BUCKET_NAME, FILE_TYPES_AP } from '../../utils/consts';
import {sleep, validateImageName} from "./utils";

const UploadAPFile = ({
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
    const [isUploading, setIsUploading] = useState(false);
// debugger;
    useEffect(() => {
        if (validationResponse) {
            if (validationResponse.validationError) {
                // If there's a validation error, we skip upload
                onUploadComplete(file, false);
            } else {
                // Check if the file already exists to show override dialog
                const renamedFile = getNewFileName(fileType, file.name);
                if (existingPaths.includes(renamedFile)) {
                    setShowOverrideDialog(true);
                } else {
                    // Proceed with upload if no override is necessary
                    handleUpload();
                }
            }
        }
    }, [validationResponse]);

    const handleUpload = async (override = false) => {
        setIsUploading(true);
        const formData = new FormData();
        const fileName = getNewFileName(fileType, file.name);
        const imageFile = validateImageName(file.name);

        // Check if we need to override the file
        if (!validationResponse.validationError && (override || !existingPaths.includes(fileName))) {
            // Prepare the file buffer
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

            formData.append('client', hierarchy.client);
            formData.append('project', hierarchy.project);
            formData.append('floor', hierarchy.floor);
            formData.append('element', hierarchy.element);
            formData.append('object', hierarchy.object);
            formData.append('date', date);
            formData.append('typeUpload', 'AP');
            formData.append('BUCKET_NAME', S3_BUCKET_NAME);
            try {
                if(imageFile){
                    // debugger;
                    formData.delete("file")
                    for (let oneFile of [file]) {
                        formData.append('files', oneFile);
                    }
                    await uploadMultipleImages(formData)
                }
                else {
                    await uploadSingleFile(formData)
                }
                onUploadComplete(file, true,override);
            } catch (error) {
                console.error('Error uploading file', error);
                onUploadComplete(file, false,override);
            } finally {
                setIsUploading(false);
            }
        } else {
            onUploadComplete(file, false,override);
        }
    };

    const handleOverrideDialogClose = async (confirm) => {
        setShowOverrideDialog(false);
        onOverrideDecision(file, confirm);
        if (confirm) {
            handleUpload(true);
        } else {
            onUploadComplete(file, false);
        }
    };

    const getNewFileName = (fileType, originalName) => {
        switch (fileType) {
            case FILE_TYPES_AP['AP table (.csv)']:
                return 'AP.csv';
            case FILE_TYPES_AP['AP design (.dwg)']:
                return 'AP.dwg';
            case FILE_TYPES_AP['Thresholds (.csv)']:
                return 'Thresholds.csv';
            default:
                return originalName;
        }
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
        </div>
    );
};

export default UploadAPFile;
