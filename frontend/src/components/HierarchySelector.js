import React, { useState, useEffect } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import axios from '../axiosConfig'
import { S3_BUCKET_NAME } from '../utils/consts'
import { hierarchyStorageKey } from './ConstHierarchy'

const defaultHierarchy = {
  client: '',
  project: '',
  floor: '',
  element: '',
  object: '',
  orientation: '',
}

const defaultData = {
  clients: [],
  projects: [],
  floors: [],
  elements: [],
  objects: [],
}

const HierarchySelector = ({
  onSelectionChange,
  includeOrientation = false,
  formElement,
}) => {
  const [hierarchy, setHierarchy] = useState(defaultHierarchy)
  const [data, setData] = useState(defaultData)

  const [message, setMessage] = useState('')
  const bucketName = S3_BUCKET_NAME

  useEffect(() => {
    fetchHierarchyData()
    populateHierarchy()
  }, [])

  function getHierarchyFromStorage() {
    const storedHierarchy = localStorage.getItem(hierarchyStorageKey)
    return JSON.parse(storedHierarchy)
  }

  function populateHierarchy() {
    const hierarchy = getHierarchyFromStorage()
    if (hierarchy) {
      setHierarchy(hierarchy)
    } else {
      setHierarchy(defaultData)
    }
  }

  async function fetchClients() {
    try {
      const response = await axios.get('/api/folder/list-clients', {
        params: { bucketName },
      })
      setData((data) => ({ ...data, clients: response.data.clients }))
    } catch (error) {
      console.error('Error fetching clients', error)
      setMessage('Error fetching clients')
    }
  }

  async function fetchProjects(data) {
    try {
      const response = await axios.get('/api/folder/list-projects', {
        params: { bucketName, client: data?.client },
      })
      setData((data) => ({ ...data, projects: response.data.projects }))
    } catch (error) {
      console.error('Error fetching projects', error)
      setMessage('Error fetching projects')
    }
  }

  async function fetchFloors(data) {
    try {
      const response = await axios.get('/api/folder/list-floors', {
        params: { bucketName, client: data?.client, project: data?.project },
      })
      setData((data) => ({ ...data, floors: response.data.floors }))
    } catch (error) {
      console.error('Error fetching floors', error)
      setMessage('Error fetching floors')
    }
  }

  async function fetchElements(data) {
    try {
      const response = await axios.get('/api/folder/list-elements', {
        params: {
          bucketName,
          client: data?.client,
          project: data?.project,
          floor: data?.floor,
        },
      })
      setData((data) => ({ ...data, elements: response.data.elements }))
    } catch (error) {
      console.error('Error fetching elements', error)
      setMessage('Error fetching elements')
    }
  }

  async function fetchObjects(data) {
    try {
      const response = await axios.get('/api/folder/list-objects', {
        params: {
          bucketName,
          client: data?.client,
          project: data?.project,
          floor: data?.floor,
          element: data?.element,
        },
      })
      setData((data) => ({ ...data, objects: response.data.objects }))
    } catch (error) {
      console.error('Error fetching objects', error)
      setMessage('Error fetching objects')
    }
  }

  async function fetchHierarchyData() {
    const hierarchy = getHierarchyFromStorage()
    fetchClients()
    fetchProjects(hierarchy)
    fetchFloors(hierarchy)
    fetchElements(hierarchy)
    fetchObjects(hierarchy)
  }

  const handleClientChange = async (event) => {
    const clientName = event.target.value
    const data = { client: clientName }
    setHierarchy({ ...defaultHierarchy, client: clientName })
    setData((data) => ({
      ...data,
      elements: [],
      floors: [],
      projects: [],
      objects: [],
    }))
    onSelectionChange(data)
    fetchProjects(data)
  }

  const handleProjectChange = async (event) => {
    const projectName = event.target.value
    const data = { client: hierarchy.client, project: projectName }
    setHierarchy((hierarchy) => ({
      ...hierarchy,
      element: '',
      floor: '',
      object: '',
      project: projectName,
    }))
    setData((data) => ({
      ...data,
      elements: [],
      floors: [],
      objects: [],
    }))
    onSelectionChange(data)
    fetchFloors(data)
  }

  const handleFloorChange = async (event) => {
    const floorName = event.target.value
    const data = {
      client: hierarchy.client,
      project: hierarchy.project,
      floor: floorName,
    }
    setHierarchy((hierarchy) => ({
      ...hierarchy,
      element: '',
      object: '',
      floor: floorName,
    }))
    setData((data) => ({
      ...data,
      elements: [],
      objects: [],
    }))
    onSelectionChange(data)
    fetchElements(data)
  }

  const handleElementChange = async (event) => {
    const elementName = event.target.value
    const data = {
      client: hierarchy.client,
      project: hierarchy.project,
      floor: hierarchy.floor,
      element: elementName,
    }
    setHierarchy((hierarchy) => ({
      ...hierarchy,
      object: '',
      element: elementName,
    }))
    setData((data) => ({ ...data, objects: [] }))
    onSelectionChange(data)
    fetchObjects(data)
  }

  const handleObjectChange = (event) => {
    const objectName = event.target.value
    const { client, project, floor, element } = hierarchy
    setHierarchy((hierarchy) => ({
      ...hierarchy,
      orientation: '',
      object: objectName,
    }))
    onSelectionChange({ client, project, floor, element, object: objectName })
  }

  function handleOrientationChange(event) {
    const name = event.target.value
    const data = {
      client: hierarchy.client,
      project: hierarchy.project,
      floor: hierarchy.floor,
      element: hierarchy.element,
      object: hierarchy.object,
      orientation: name,
    }
    setHierarchy((hierarchy) => ({ ...hierarchy, orientation: name }))
    onSelectionChange(data)
  }

  const showOrientation = includeOrientation && hierarchy.object !== ''

  return (
    <div>
      <Form>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formSelect1">
              <Form.Label>Client</Form.Label>
              <Form.Select
                value={hierarchy.client}
                onChange={handleClientChange}
              >
                <option value="">Select Client</option>
                {data.clients?.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSelect2">
              <Form.Label>Project</Form.Label>
              <Form.Select
                value={hierarchy.project}
                onChange={handleProjectChange}
                disabled={!hierarchy.client}
              >
                <option value="">Select Project</option>
                {data.projects?.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSelect3">
              <Form.Label>Floor</Form.Label>
              <Form.Select
                value={hierarchy.floor}
                onChange={handleFloorChange}
                disabled={!hierarchy.project}
              >
                <option value="">Select Floor</option>
                {data.floors?.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formSelect4">
              <Form.Label>Element</Form.Label>
              <Form.Select
                value={hierarchy.element}
                onChange={handleElementChange}
                disabled={!hierarchy.floor}
              >
                <option value="">Select Element</option>
                {data.elements?.map((element) => (
                  <option key={element} value={element}>
                    {element}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSelect5">
              <Form.Label>Object</Form.Label>
              <Form.Select
                value={hierarchy.object}
                onChange={handleObjectChange}
                disabled={!hierarchy.element}
              >
                <option value="">Select Object</option>
                {data.objects?.map((object) => (
                  <option key={object} value={object}>
                    {object}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            {showOrientation ? (
              <Form.Group controlId="formSelect6">
                <Form.Label>Orientation</Form.Label>
                <Form.Select
                  id="orientation"
                  value={hierarchy.orientation}
                  onChange={handleOrientationChange}
                >
                  <option value="">Select Orientation</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                </Form.Select>
              </Form.Group>
            ) : (
              formElement
            )}
          </Col>
        </Row>
        {message && <p>{message}</p>}
      </Form>
    </div>
  )
}

export default HierarchySelector
