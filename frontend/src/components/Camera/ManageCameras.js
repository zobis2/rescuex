import React, { useState, useEffect } from 'react'
import { Tabs, Tab, Table, Button, Modal, Container } from 'react-bootstrap'
import { getCameras, getCamerasAPIs } from '../../api/platform'
import CameraForm from './CameraForm'
import CameraApiForm from './CameraApiForm'

function ManageCameras() {
  const [key, setKey] = useState('camera-apis')
  const [cameras, setCameras] = useState([])
  const [cameraApis, setCameraApis] = useState([])
  const [editingCamera, setEditingCamera] = useState(null)
  const [editingCameraApi, setEditingCameraApi] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewEntry, setIsNewEntry] = useState(false)

  useEffect(() => {
    fetchCameras()
    fetchCameraApis()
  }, [])

  const fetchCameras = async () => {
    try {
      const camerasResponse = await getCameras()
      setCameras(camerasResponse.data)
    } catch (error) {
      console.error('Error fetching cameras', error)
    }
  }

  const fetchCameraApis = async () => {
    try {
      const cameraApisResponse = await getCamerasAPIs()
      setCameraApis(cameraApisResponse.data)
    } catch (error) {
      console.error('Error fetching camera APIs', error)
    }
  }

  const handleCamera = (camera) => {
    if (!camera) {
      setIsNewEntry(true)
    }
    setEditingCamera(camera)
    setShowModal(true)
  }

  const handleCameraApi = (cameraApi) => {
    if (!cameraApi) {
      setIsNewEntry(true)
    }
    setEditingCameraApi(cameraApi)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsNewEntry(false)
    setEditingCamera(null)
    setEditingCameraApi(null)
  }

  const handleCameraSuccess = () => {
    handleCloseModal()
    fetchCameras()
  }

  const handleCameraApiSuccess = () => {
    handleCloseModal()
    fetchCameraApis()
  }

  const getTitle = () => {
    if (key === 'cameras' && editingCamera) {
      return 'Edit Camera'
    }
    if (key === 'cameras' && isNewEntry) {
      return 'Add Camera'
    }
    if (key === 'camera-apis' && editingCameraApi) {
      return 'Edit Camera API'
    }
    if (key === 'camera-apis' && isNewEntry) {
      return 'Add Camera API'
    }
  }

  const showCameraForm = key === 'cameras' && (editingCamera || isNewEntry)
  const showCameraApiForm =
    key === 'camera-apis' && (editingCameraApi || isNewEntry)

    console.log(cameras)
  return (
    <Container>
      <h1>Manage Cameras and Camera APIs</h1>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
      <Tab eventKey="camera-apis" title="Camera APIs">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleCameraApi(null)}
          >
            Add Camera API
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Camera Brand</th>
                <th>Camera Model</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameraApis.map((cameraApi) => (
                <tr key={cameraApi.id}>
                  <td>{cameraApi.id}</td>
                  <td>{cameraApi.cameraBrand}</td>
                  <td>{cameraApi.cameraModel}</td>
                  <td>
                    <Button
                      onClick={() => handleCameraApi(cameraApi)}
                      variant="warning"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="cameras" title="Cameras">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleCamera(null)}
          >
            Add Camera
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Camera API</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((camera) => (
                <tr key={camera.id}>
                  <td>{camera.id}</td>
                  <td>{camera.name}</td>
                  <td>{camera.camerasApi?.cameraBrand} - {camera.camerasApi?.cameraModel}</td>
                  <td>
                    <Button
                      onClick={() => handleCamera(camera)}
                      variant="warning"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Modal for editing cameras or camera APIs */}
      <Modal show={showModal} onHide={handleCloseModal} size={showCameraApiForm ? "xl" : "md"}>
        <Modal.Header closeButton>
          <Modal.Title>{getTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showCameraForm && (
            <CameraForm
              camera={editingCamera}
              onSuccess={handleCameraSuccess}
            />
          )}
          {showCameraApiForm && (
            <CameraApiForm
              cameraApi={editingCameraApi}
              onSuccess={handleCameraApiSuccess}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default ManageCameras
