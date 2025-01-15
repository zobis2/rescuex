import React, { useEffect, useState } from 'react'
import axios from '../../axiosConfig'
import HierarchySelector from '../HierarchySelector'
import {
  S3_BUCKET_NAME as BUCKET_NAME,
  FILE_TYPES_AB,
} from '../../utils/consts'
import { fetchExistingDates, fetchExistingFiles } from './utils'
import UploadABFile from './UploadABFile'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { validateFileWithId } from '../../api/streamApi'

const UploadABFilesPage = () => {
  const [hierarchy, setHierarchy] = useState({})
  const [date, setDate] = useState('')
  const [toggleExistingDate, setToggleExistingDate] = useState(false)
  const [existingDates, setExistingDates] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileType, setFileType] = useState(FILE_TYPES_AB['As Built Table(txt)'])
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResponses, setValidationResponses] = useState({})
  const [existingPaths, setExistingPaths] = useState([])
  const [filesUploaded, setFilesUploaded] = useState([])
  const [filesSkipped, setFilesSkipped] = useState([])
  const [previousResponses, setPreviousResponses] = useState('')

  const [isUploading, setIsUploading] = useState(false)

  const typeUpload = 'AB'

  const handleHierarchyChange = async (newHierarchy) => {
    setHierarchy({ ...hierarchy, ...newHierarchy })
    if (newHierarchy.object) {
      const dates = await fetchExistingDates(newHierarchy, typeUpload)
      setExistingDates(dates)
    }
  }

  const handleFileChange = async (event) => {
    setPreviousResponses('')

    const validateFileName = (name) => {
      const regex = /^set \d+\.txt$/
      return regex.test(name)
    }
    const selectedFiles = Array.from(event.target.files)
    const validFileTypeExtensions = {
      'As Built Table(txt)': ['txt'],
    }
    let validateNameResponse = []
    const isValidFileType = selectedFiles.every((file) => {
      const validateName = validateFileName(file.name)
      if (!validateName) {
        validateNameResponse.push(`${file.name} is not valid for upload`)
      }
      const fileExtension = file.name.split('.').pop().toLowerCase()
      // debugger;
      return validFileTypeExtensions[fileType].includes(fileExtension)
    })

    if (validateNameResponse.length > 0) {
      setMessage(validateNameResponse.join('\n'))
      setSelectedFiles([])
      return
    }
    if (!isValidFileType) {
      setMessage('Selected files do not match the selected file type.')
      setSelectedFiles([])
      return
    }
    setSelectedFiles(selectedFiles)
    setMessage(`${selectedFiles.length} Files Ready to Upload`)
  }

  const handleValidationAndUpload = async () => {
    setPreviousResponses('')
    setIsUploading(true)

    setMessage('Validating files...')
    try {
      debugger
      const filesPath = await fetchExistingFiles(
        BUCKET_NAME,
        hierarchy,
        date,
        typeUpload
      ) // Fetch existing files for override checking
      setExistingPaths(filesPath)
      const pathAP = `clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}`

      const responses = await Promise.all(
        selectedFiles.map((file) => {
          const fileReader = new FileReader()
          return new Promise((resolve) => {
            // Use resolve only
            fileReader.onload = async () => {
              try {
                const buffer = fileReader.result
                const base64Buffer = btoa(
                  new Uint8Array(buffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ''
                  )
                )
                const response = await validateFileWithId(
                  typeUpload,
                  fileType,
                  BUCKET_NAME,
                  file,
                  pathAP,
                  base64Buffer
                )
                if (response.status === 200) {
                  resolve({ file, data: response.buffer })
                }
                if (response.status === 500) {
                  debugger
                  resolve({ file, error: response.message }) // Handle validation error
                }
              } catch (error) {
                debugger

                // Handle server error and provide a consistent response
                const errorMessage = error.message
                  ? error.message
                  : error.response?.data?.error || 'Server error occurred'
                resolve({ file, error: errorMessage })
              }
            }
            fileReader.readAsArrayBuffer(file)
          })
        })
      )

      const validationResults = responses.reduce(
        (acc, { file, data, error }) => {
          acc[file.name] = data || { validationError: error }
          return acc
        },
        {}
      )
      // debugger;

      setValidationResponses(validationResults)
      setMessage('Uploading Steps')
    } catch (error) {
      setMessage('Unexpected error during validation')
      console.error(error)
    }
  }

  const cc = 0

  async function resetAllForNextUpload() {
    setIsUploading(false)
    setSelectedFiles([])
    setValidationResponses({})
    setFilesUploaded([])
    setFilesSkipped([])
    const filesPath = await fetchExistingFiles(
      BUCKET_NAME,
      hierarchy,
      date,
      typeUpload
    ) // Fetch existing files for override checking
    setExistingPaths(filesPath)
  }

  const handleUploadComplete = async (file, success, override) => {
    // debugger
    if (override === 'stop') {
      setMessage('Upload process stopped.')
      resetAllForNextUpload()

      return
    }

    setFilesUploaded((prev) => {
      // debugger

      // debugger;

      let updated = success ? new Set([...prev, file.name]) : prev
      updated = [...updated]

      if (selectedFiles.length === filesSkipped.length + updated.length) {
        setPreviousResponses(
          `${
            selectedFiles.length
          } All As Built Table(txt) files processed and  ${updated.join(
            ', '
          )} uploaded. , ${filesSkipped.join(', ')} skipped.`
        )

        // Check if all uploads are complete
        resetAllForNextUpload()
      }
      return updated
    })
    setFilesSkipped((prev) => {
      debugger
      let updated = !success ? new Set([...prev, file.name]) : prev
      updated = [...updated]

      if (selectedFiles.length === updated.length + filesUploaded.length) {
        setPreviousResponses(
          `${
            selectedFiles.length
          } All As Built Table(txt) files processed and  ${filesUploaded.join(
            ', '
          )} uploaded. , ${updated.join(', ')} skipped.`
        )
        debugger

        // Check if all uploads are complete
        resetAllForNextUpload()
      }
      return updated
    })
    if (selectedFiles.length === filesSkipped.length + filesUploaded.length) {
      resetAllForNextUpload()
      debugger

      setPreviousResponses(
        `${
          selectedFiles.length
        } All As Built Table(txt) files processed and  ${filesUploaded.join(
          ', '
        )} uploaded. , ${filesSkipped.join(', ')} skipped.`
      )

      // Check if all uploads are complete
    }
  }

  const handleOverrideDecision = (file, decision) => {
    console.log('handleOverrideDecision', file, decision)
  }

  const pathGood = !![
    hierarchy.client,
    hierarchy.project,
    hierarchy.floor,
    hierarchy.element,
    hierarchy.object,
  ].every((item) => item && item.length > 2)
  const disableUpload =
    !pathGood ||
    isUploading ||
    selectedFiles.length === 0 ||
    !date ||
    (date.length !== 8 && date.length !== 10)

  return (
    <Container>
      <h1>Upload Ab Files</h1>
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
              {toggleExistingDate ? 'Enter New Date' : 'Select Existing Date'}
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
              {Object.values(FILE_TYPES_AB).map((type) => (
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
      {message && <p style={{ color: '#b00020' }}> {message}</p>}

      <div className="mt-3">
        {previousResponses.length > 0 && <p>{previousResponses}</p>}

        {uploadProgress > 0 && (
          <div>
            <p>Upload Progress: {uploadProgress}%</p>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
        {isUploading &&
          Object.keys(validationResponses).length === selectedFiles.length && (
            <div>
              {selectedFiles.map((file) => (
                <UploadABFile
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
  )
}

export default UploadABFilesPage
