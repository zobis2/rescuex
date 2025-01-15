import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createCameraApi, updateCameraApi } from '../../api/platform'
import {
  defaultCommands,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  zoomIn,
  zoomOut,
} from './constants'

const predefinedBrands = {
  Hikvision: ['DS-2CD2385FWD-I', 'DS-2CD2347G1-LU'],
  Dahua: ['IPC-HDW2431R-ZS', 'IPC-HFW2231R-ZS'],
  Axis: ['M2026-LE', 'P1368-E'],
}

const CameraApiForm = ({ cameraApi = {}, onSuccess }) => {
  const [formData, setFormData] = useState({
    cameraBrand: cameraApi?.cameraBrand || '',
    cameraModel: cameraApi?.cameraModel || '',
    cameraCategory: cameraApi?.cameraCategory || '',
    cameraType: cameraApi?.cameraType || '',
    rtspCommand: cameraApi?.rtspCommand || '',
    captureImageCommand: cameraApi?.captureImageCommand || '',
    getPlayback: cameraApi?.getPlayback || '',
    zoomIn: cameraApi?.zoomIn || defaultCommands.zoomIn,
    zoomOut: cameraApi?.zoomOut || defaultCommands.zoomOut,
    needStopZoomCommand: cameraApi?.needStopZoomCommand || false,
    stopZoom: cameraApi?.stopZoom || '',
    moveRight: cameraApi?.moveRight || defaultCommands.moveRight,
    moveLeft: cameraApi?.moveLeft || defaultCommands.moveLeft,
    moveUp: cameraApi?.moveUp || defaultCommands.moveUp,
    moveDown: cameraApi?.moveDown || defaultCommands.moveDown,
    needStopMoveCommand: cameraApi?.needStopMoveCommand || false,
    stopMovePan: cameraApi?.stopMovePan || '',
    stopMoveTilt: cameraApi?.stopMoveTilt || '',
  })

  const [saving, setSaving] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const notify = (msg) => toast.error(msg)

  useEffect(() => {
    // Populate the models based on the selected brand initially
    if (formData.cameraBrand) {
      setAvailableModels(predefinedBrands[formData.cameraBrand] || [])
    }
  }, [formData.cameraBrand])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    // Dynamically update the models when the camera brand changes
    if (name === 'cameraBrand') {
      setAvailableModels(predefinedBrands[value] || [])
      setFormData((prevState) => ({
        ...prevState,
        cameraModel: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (cameraApi?.id) {
        await updateCameraApi(cameraApi.id, formData)
      } else {
        await createCameraApi(formData)
      }
      onSuccess()
      setSaving(false)
    } catch (error) {
      notify('Error saving/updating camera API')
      setSaving(false)
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit} className="camera-api-form">
        <Row>
          <Col md={4}>
            <Form.Group className="fw-bold">
              <Form.Label>Camera Brand</Form.Label>
              <Form.Control
                as="select"
                name="cameraBrand"
                value={formData.cameraBrand}
                onChange={handleChange}
                required
              >
                <option value="">Select Camera Brand</option>
                {Object.keys(predefinedBrands).map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Camera Model</Form.Label>
              <Form.Control
                as="select"
                name="cameraModel"
                value={formData.cameraModel}
                onChange={handleChange}
                required
                disabled={!availableModels.length} // Disable if no models available
              >
                <option value="">Select Camera Model</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Camera Category</Form.Label>
              <Form.Control
                type="text"
                name="cameraCategory"
                value={formData.cameraCategory}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>RTSP Command</Form.Label>
              <Form.Control
                type="text"
                name="rtspCommand"
                value={formData.rtspCommand}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Zoom In Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="zoomIn"
                value={formData.zoomIn}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Move Right Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="moveRight"
                value={formData.moveRight}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="fw-bold">
              <Form.Label>Camera Type</Form.Label>
              <Form.Control
                type="text"
                name="cameraType"
                value={formData.cameraType}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Capture Image Command</Form.Label>
              <Form.Control
                type="text"
                name="captureImageCommand"
                value={formData.captureImageCommand}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Zoom Out Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="zoomOut"
                value={formData.zoomOut}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Move Left Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="moveLeft"
                value={formData.moveLeft}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Check
                type="checkbox"
                label="Need Stop Zoom Command"
                name="needStopZoomCommand"
                checked={formData.needStopZoomCommand}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Move Up Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="moveUp"
                value={formData.moveUp}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Get Playback Command</Form.Label>
              <Form.Control
                type="text"
                name="getPlayback"
                value={formData.getPlayback}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Move Down Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="moveDown"
                value={formData.moveDown}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Stop Zoom Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="stopZoom"
                value={formData.stopZoom}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Check
                type="checkbox"
                label="Need Stop Move Command"
                name="needStopMoveCommand"
                checked={formData.needStopMoveCommand}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Stop Move Pan Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="stopMovePan"
                value={formData.stopMovePan}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-2 fw-bold">
              <Form.Label>Stop Move Tilt Command (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="stopMoveTilt"
                value={formData.stopMoveTilt}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-3">
          <Button variant="primary" type="submit" disabled={saving}>
            {cameraApi?.id ? 'Update' : 'Create'} Camera API
          </Button>
        </div>
      </Form>
    </>
  )
}

export default CameraApiForm
