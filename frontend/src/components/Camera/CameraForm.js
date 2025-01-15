import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  createCamera,
  updateCamera,
  getProjects,
  getCamerasAPIs,
} from '../../api/platform'

const CameraForm = ({ camera = {}, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: camera?.name || '',
    camerasApiId: camera?.camerasApiId || '',
    projectId: camera?.projectId || '',
    ip1: camera?.ip1 || '',
    ip2: camera?.ip2 || '',
    httpPort: camera?.httpPort || '',
    rtspPort: camera?.rtspPort || '',
    serverPort: camera?.serverPort || '',
    username: camera?.username || '',
    password: camera?.password || '',
  })

  const [projects, setProjects] = useState([])
  const [camerasApis, setCamerasApis] = useState([])
  const [saving, setIsSaving] = useState(false)

  const notify = (msg) => toast.error(msg)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResponse = await getProjects()
        setProjects(projectsResponse.data)
      } catch (error) {
        notify('Error fetching projects')
      }
    }

    const fetchCamerasAPIs = async () => {
      try {
        const camerasAPIsResponse = await getCamerasAPIs()
        setCamerasApis(camerasAPIsResponse.data)
      } catch (error) {
        notify('Error fetching camera APIs')
      }
    }

    fetchProjects()
    fetchCamerasAPIs()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (camera?.id) {
        await updateCamera(camera.id, formData)
      } else {
        await createCamera(formData)
      }
      onSuccess()
      setIsSaving(false)
    } catch (error) {
      notify('Error saving/updating camera')
      setIsSaving(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="fw-bold">
            <Form.Label>Camera Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>Camera API</Form.Label>
            <Form.Control
              as="select"
              name="camerasApiId"
              value={formData.camerasApiId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Camera API</option>
              {camerasApis.map((api) => (
                <option key={api.id} value={api.id}>
                  {api.cameraBrand} {api.cameraModel}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>Project</Form.Label>
            <Form.Control
              as="select"
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>IP1</Form.Label>
            <Form.Control
              type="text"
              name="ip1"
              value={formData.ip1}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>IP2</Form.Label>
            <Form.Control
              type="text"
              name="ip2"
              value={formData.ip2}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="fw-bold">
            <Form.Label>HTTP Port</Form.Label>
            <Form.Control
              type="number"
              name="httpPort"
              value={formData.httpPort}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>RTSP Port</Form.Label>
            <Form.Control
              type="number"
              name="rtspPort"
              value={formData.rtspPort}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>Server Port</Form.Label>
            <Form.Control
              type="number"
              name="serverPort"
              value={formData.serverPort}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2 fw-bold">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" type="submit" disabled={saving}>
          {camera?.id ? 'Update' : 'Create'} Camera
        </Button>
      </div>
    </Form>
  )
}

export default CameraForm
