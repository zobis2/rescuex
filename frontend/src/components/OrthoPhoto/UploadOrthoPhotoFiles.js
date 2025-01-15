// UploadOrthoPhotoFiles.js
import React, { useEffect, useState } from 'react'
import axios from '../../axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import SettingsComponent from './SettingsComponent'
import LiveLogViewer from './LiveLogViewer'
import settingsOptions from '../../utils/orthophoto/settings.json'
import HierarchySelector from '../HierarchySelector'
import { sleep } from '../Upload/utils'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { hierarchyStorageKey } from '../ConstHierarchy'
import { S3_BUCKET_ORTHOPHOTO } from '../../utils/consts'
import {
  executeOrthophoto,
  uploadOrthophoto,
  uploadOrthophotoSettings,
} from '../../api/uploadApi'

const BUCKET_NAME = S3_BUCKET_ORTHOPHOTO

const UploadOrthoPhotoFiles = () => {
  const [files, setFiles] = useState([])
  const [projectName, setProjectName] = useState('')
  const [publicIp, setPublicIp] = useState('')
  const [instanceId, setInstanceId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [executed, setExecute] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [selectedOption, setSelectedOption] = useState('ultra')
  const [settings, setSettings] = useState(settingsOptions[selectedOption])
  const [totalProgress, setTotalProgress] = useState(0)
  const [autoExecute, setAutoExecute] = useState(false)
  const [uploadingComplete, setUploadingComplete] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files))
  }

  const handleProjectNameChange = (event) => {
    const value = event.target.value
    if (/^[a-zA-Z0-9_-]{1,40}$/.test(value) || value === '') {
      setProjectName(value)
    }
  }

  const handleSettingsChange = (newSettings, selected) => {
    setSettings(newSettings)
    setSelectedOption(selected)
  }

  const handleUpload = async () => {
    setUploading(true)
    setUploadingComplete(false)

    setUploadProgress({})
    setTotalProgress(0) // Reset total progress
    const timeStart = new Date().getTime()

    try {
      let processedFilesCount = 0 // Track processed files
      let totalFilesUploaded = {}
      let lastFileUploadTime = 0 // Time taken for the last file

      for (const file of files) {
        const fileStartTime = new Date().getTime() // Start time for the current file

        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucketName', BUCKET_NAME)
        formData.append('projectName', projectName)

        try {
          const data = await uploadOrthophoto(
            formData,
            file,
            totalFilesUploaded,
            setUploadProgress
          )
          console.log('Upload successful', data)
        } catch (error) {
          console.error(`Upload failed for file ${file.name}`, error)
          // Handle specific cases like file existence here if needed
          break // Exit the loop if an error occurs
        }

        // Calculate time taken for this file
        const fileEndTime = new Date().getTime()
        lastFileUploadTime = (fileEndTime - fileStartTime) / 1000 // Time in seconds
        processedFilesCount++

        // Calculate time passed since the start of all uploads
        const timeNow = new Date().getTime()
        const timePassed = (timeNow - timeStart) / 1000 // Convert milliseconds to seconds

        // Format timePassed to hh:mm:ss
        const hours = Math.floor(timePassed / 3600)
        const minutes = Math.floor((timePassed % 3600) / 60)
        const seconds = Math.floor(timePassed % 60)

        const formattedTimePassed = `${hours}h${minutes}m${seconds}s`

        // Estimate remaining time based on the last file's upload time
        const remainingFilesCount = files.length - processedFilesCount
        const estimatedTimeLeft = lastFileUploadTime * remainingFilesCount

        // Format estimatedTimeLeft to hh:mm:ss
        const estHours = Math.floor(estimatedTimeLeft / 3600)
        const estMinutes = Math.floor((estimatedTimeLeft % 3600) / 60)
        const estSeconds = Math.floor(estimatedTimeLeft % 60)

        const formattedEstimatedTimeLeft = `${estHours}h${estMinutes}m${estSeconds}s`

        const overallProgress = (
          (processedFilesCount / files.length) *
          100
        ).toFixed(2)
        setTotalProgress(Number(overallProgress))

        setMessage(`Time Passed: ${formattedTimePassed}. Total Files: ${files.length}, Processed: ${processedFilesCount}
Estimated Time Left: ${formattedEstimatedTimeLeft}`)
      }

      const settingsResponse = await uploadOrthophotoSettings(
        settings,
        BUCKET_NAME,
        projectName
      )
      if (!settings) {
        setSettings(settingsOptions[0])
      }
      console.log('Settings upload successful', settingsResponse)
      setUploadingComplete(true)
      if (autoExecute) {
        await handleExecute()
      }
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      setUploading(false)
    }
  }

  const handleExecute = async () => {
    try {
      const response = await executeOrthophoto(BUCKET_NAME, projectName)
      const { publicIp, instanceId } = response
      setPublicIp(publicIp)
      setInstanceId(instanceId)
      console.log('Execution successful', response)
      await sleep(20000)
      alert('executing')

      setExecute(true)
    } catch (error) {
      console.error('Execution failed', error)
    }
  }

  function detectHierarchy() {
    const storedHierarchy = localStorage.getItem(hierarchyStorageKey)
    const hierarchy = JSON.parse(storedHierarchy)
    if (hierarchy) {
      handleHierarchyChange(hierarchy)
    }
  }

  const handleHierarchyChange = (newHierarchy) => {
    const transformValue = (value) => (value ? value.replace(/\s+/g, '_') : '')

    const client = transformValue(newHierarchy.client)
    const project = transformValue(newHierarchy.project)
    const floor = transformValue(newHierarchy.floor)
    const element = transformValue(newHierarchy.element)
    const object = transformValue(newHierarchy.object)
    const orientation = transformValue(newHierarchy.orientation)

    const fullProjectName =
      `${client}/${project}/${floor}/${element}/${object}/${orientation}`.replace(
        /\//g,
        'BR'
      )
    setProjectName(fullProjectName)
  }

  useEffect(() => {
    detectHierarchy()
  }, [])

  return (
    <div className="container">
      <h3>Upload OrthoPhoto Files</h3>
      {/*<div>*/}
      {/*    {JSON.stringify(settingsOptions, null, 2)}*/}
      {/*</div>*/}
      <div className="form-group">
        <HierarchySelector
          onSelectionChange={handleHierarchyChange}
          type="OrthoPhoto"
          includeOrientation
        />
        <div>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formSelect1">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={handleProjectNameChange}
                  pattern="^[a-zA-Z0-9_-]{1,40}$"
                  title="Project name must be a single word, up to 40 characters long, and can only include letters, numbers, underscores, and hyphens."
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formSelect1">
                <Form.Label>Files</Form.Label>
                <Form.Control
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleFileChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <SettingsComponent
                selectedOption={selectedOption}
                onChangeSettings={handleSettingsChange}
              />
            </Col>
            <Col>
              <Form.Group controlId="formSelect1">
                <Form.Label>Bucket Name</Form.Label>
                <Form.Control
                  type="text"
                  id="bucketName"
                  value={BUCKET_NAME}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoExecute"
              checked={autoExecute}
              onChange={() => setAutoExecute(!autoExecute)}
            />
            <label className="form-check-label" htmlFor="autoExecute">
              Execute Automatically
            </label>
          </div>
          <div className="d-flex">
            <Button
              variant="primary"
              className="me-2"
              onClick={handleUpload}
              disabled={uploading || projectName.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExecute}
              disabled={uploading || executed || !uploadingComplete}
            >
              Execute
            </Button>
          </div>

          <div className="mt-3">
            <strong>Total Progress:</strong> {totalProgress}%
          </div>
          <div>
            UploadInfo
            {message && <p>{message}</p>}
          </div>
          <div className="mt-3">
            {Object.keys(uploadProgress).map((fileName) => (
              <div key={fileName}>
                <strong>{fileName}</strong>: {uploadProgress[fileName]}%
              </div>
            ))}
          </div>
          <div className="mt-3">
            {publicIp && (
              <div>
                <div>
                  {publicIp}, {instanceId}
                </div>
                <LiveLogViewer
                  publicIp={publicIp}
                  instanceId={instanceId}
                  bucketName={BUCKET_NAME}
                  projectName={projectName}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadOrthoPhotoFiles
