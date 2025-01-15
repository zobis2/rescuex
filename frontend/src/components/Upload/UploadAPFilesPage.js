import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import HierarchySelector from "../HierarchySelector";
import UploadAPFile from "./UploadAPFile";
import { S3_BUCKET_NAME as BUCKET_NAME, FILE_TYPES_AP } from "../../utils/consts";
import {
  fetchExistingDates,
  fetchExistingFiles,
  validateImageName,
} from "./utils";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { validateFile } from "../../api/streamApi";

const UploadAPFilesPage = () => {
  const [hierarchy, setHierarchy] = useState({});
  const [date, setDate] = useState("");
  const [toggleExistingDate, setToggleExistingDate] = useState(false);
  const [existingDates, setExistingDates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState(FILE_TYPES_AP["AP table (.csv)"]);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResponses, setValidationResponses] = useState({});
  const [prevValidationResponses, setPreValidationResponses] = useState({});

  const [existingPaths, setExistingPaths] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const typeUpload = "AP";

  const handleHierarchyChange = async (newHierarchy) => {
    setHierarchy({ ...hierarchy, ...newHierarchy });
    if (newHierarchy.object) {
      const filesPath = await fetchExistingFiles(
        BUCKET_NAME,
        newHierarchy,
        date,
        typeUpload
      ); // Fetch existing files for override checking
      setExistingPaths(filesPath);
      const dates = await fetchExistingDates(newHierarchy, typeUpload);
      setExistingDates(dates);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setPreValidationResponses({});
    // Image files: Validate all names first
    if (fileType === "AP set images (.jpg/.jpeg/.png)") {
      const invalidImages = selectedFiles.filter(
        (file) => !validateImageName(file.name)
      );
      if (invalidImages.length > 0) {
        /// which one
        setMessage(
          "Some images do not meet the naming convention, should be set {int}.jpg/jpeg/png - int is a number"
        );
        setSelectedFiles([]);
        return;
      }
    } else {
      // Non-image files: Check for correct file extension
      const validFileTypeExtensions = {
        "AP table (.csv)": ["csv"],
        "AP design (.dwg)": ["dwg"],
        "Thresholds (.csv)": ["csv"],
      };
      const isValidFileType = selectedFiles.every((file) => {
        const fileExtension = file.name.split(".").pop().toLowerCase();
        return validFileTypeExtensions[fileType].includes(fileExtension);
      });
      if (!isValidFileType) {
        setMessage("Selected files do not match the selected file type.");
        setSelectedFiles([]);
        return;
      }
    }

    setSelectedFiles(selectedFiles);
    setMessage(`${selectedFiles.length} Files Ready to Upload`);
  };

  const handleValidationAndUpload = async () => {
    setIsUploading(true);

    const filesPath = await fetchExistingFiles(
      BUCKET_NAME,
      hierarchy,
      date,
      typeUpload
    ); // Fetch existing files for override checking
    setExistingPaths(filesPath);
    setMessage("Validating files...");
    try {
      const responses = await Promise.all(
        selectedFiles.map((file) => {
          const fileReader = new FileReader();
          return new Promise((resolve) => {
            // Use resolve only
            fileReader.onload = async () => {
              try {
                const buffer = fileReader.result;
                const base64Buffer = btoa(
                  new Uint8Array(buffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                  )
                );
                const response = await validateFile(
                  typeUpload,
                  fileType,
                  BUCKET_NAME,
                  base64Buffer,
                )
                if (response.status === 200) {
                  if (
                    fileType === "AP table (.csv)" ||
                    fileType === "Thresholds (.csv)"
                  ) {
                    resolve({ file, data: response.buffer });
                  } else {
                    resolve({ file, data: response.buffer });
                  }
                }
                if (response.status === 500) {
                  resolve({ file, error: response.message }); // Handle validation error
                }
              } catch (error) {
                // Handle server error and provide a consistent response
                const errorMessage =
                  error.response?.data?.error || "Server error occurred";
                resolve({ file, error: errorMessage });
              }
            };
            fileReader.readAsArrayBuffer(file);
          });
        })
      );

      const validationResults = responses.reduce(
        (acc, { file, data, error }) => {
          acc[file.name] = data || { validationError: error };
          return acc;
        },
        {}
      );

      setValidationResponses(validationResults);
      setMessage("Uploading Dialog");
    } catch (error) {
      setMessage("Unexpected error during validation");
      console.error(error);
    }
  };

  const cc = 0;

  async function resetAllForNextUpload() {
    const filesPath = await fetchExistingFiles(
      BUCKET_NAME,
      hierarchy,
      date,
      typeUpload
    ); // Fetch existing files for override checking
    setExistingPaths(filesPath);
    setSelectedFiles([]);
    setPreValidationResponses(validationResponses);
    setValidationResponses({});
    setIsUploading(false);
    setFilesUploaded([]);
  }

  const handleUploadComplete = async (file, success, override) => {
    debugger;

    setFilesUploaded((prev) => {
      let updated = success ? new Set([...prev, file.name]) : prev;
      updated = [...updated];
      // debugger;
      if (fileType !== "AP set images (.jpg/.jpeg/.png)") {
        if (success) {
          setMessage(`File uploaded process ended successfully: ${file.name}. and was OverRide ${override} , finish of upload message
        `);
          resetAllForNextUpload();
        } else {
          setMessage(`Files uploaded process ended successfully:None ,
                   ${
                     override
                       ? `File that had Validation Error${file.name}`
                       : `File that Skipped : ${file.name}`
                   }
      ,
        finish of upload message
        `);
        }
      } else {
        if (updated.length === selectedFiles.length) {
          setMessage(`All images file processed and uploaded. files that were processed : ${updated.join(
            ","
          )}
        `);
          resetAllForNextUpload();

          // updated = [];
        }
      }

      return updated;
    });
    debugger;

    if (selectedFiles.length === filesUploaded.length + 1) {
      resetAllForNextUpload();
    }
  };

  const handleOverrideDecision = (file, decision) => {
    if (!decision) {
      setFilesUploaded((prev) => [...prev, file.name]);
    }
  };
  const pathGood = !![
    hierarchy.client,
    hierarchy.project,
    hierarchy.floor,
    hierarchy.element,
    hierarchy.object,
  ].every((item) => item && item.length > 2);
  const disableUpload =
    !pathGood ||
    isUploading ||
    selectedFiles.length === 0 ||
    !date ||
    (date.length !== 8 && date.length !== 10);
  debugger;
  return (
    <Container>
      <h1>Upload AP Files</h1>
      <HierarchySelector onSelectionChange={handleHierarchyChange} />
      <Row>
        <Col>
          <Form.Group controlId="formSelect1">
            <Form.Label>Date</Form.Label>
            {toggleExistingDate ? (
              <Form.Select
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                <option value="">Select Date</option>
                {existingDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            )}
            <Button
              onClick={() => setToggleExistingDate(!toggleExistingDate)}
              size="sm"
              className="mt-1"
            >
              {toggleExistingDate ? "Enter New Date" : "Select Existing Date"}
            </Button>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formSelect4">
            <Form.Label>File Type</Form.Label>
            <Form.Select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              {Object.values(FILE_TYPES_AP).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formSelect4">
            <Form.Label>Files</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>
        </Col>
      </Row>
      <Button
        onClick={handleValidationAndUpload}
        disabled={disableUpload}
        variant="secondary"
        className="mt-3"
      >
        Upload Files
      </Button>
      {message && <p style={{ color: "#b00020" }}> {message}</p>}
      <div className="mt-3">
        {uploadProgress > 0 && (
          <div>
            <p>Upload Progress: {uploadProgress}%</p>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
        {Object.keys(prevValidationResponses).length > 0 &&
          Object.values(prevValidationResponses)[0].validationError && (
            <div>{JSON.stringify(prevValidationResponses)}</div>
          )}

        {isUploading &&
          Object.keys(validationResponses).length === selectedFiles.length && (
            <div>
              {selectedFiles.map((file) => (
                <UploadAPFile
                  key={file.name}
                  file={file}
                  hierarchy={hierarchy}
                  date={date}
                  fileType={fileType}
                  validationResponse={validationResponses[file.name]}
                  existingPaths={existingPaths}
                  onUploadComplete={handleUploadComplete}
                  onOverrideDecision={handleOverrideDecision}
                />
              ))}
            </div>
          )}
      </div>
    </Container>
  );
};

export default UploadAPFilesPage;
