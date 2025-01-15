import React, { useState, useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  createReport,
  updateReport,
  getProjects,
  getPresignedUrl,
} from '../../api/platform'

function ReportForm({ report, onSuccess, isNewEntry }) {
  const [formData, setFormData] = useState({
    projectId: report?.projectId || '',
    element: report?.element || '',
    object: report?.object || '',
    floor: report?.floor || '',
    file: null,
  })
  const [saving, setIsSaving] = useState(false)

  const [projects, setProjects] = useState([])

  const notify = (msg) => toast.error(msg)

  // Options for the dropdowns
  const elementOptions = ['Element 1', 'Element 2', 'Element 3']
  const objectOptions = ['Object 1', 'Object 2', 'Object 3']
  const floorOptions = ['Floor 1', 'Floor 2', 'Floor 3']

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects()
        setProjects(response.data)
      } catch (error) {
        console.error('Error fetching projects', error)
      }
    }

    fetchProjects()
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const formDataToSend = new FormData()
    formDataToSend.append('projectId', formData.projectId)
    formDataToSend.append('element', formData.element)
    formDataToSend.append('object', formData.object)
    formDataToSend.append('floor', formData.floor)
    if (formData.file) {
      formDataToSend.append('file', formData.file)
    }

    try {
      if (isNewEntry) {
        await createReport(formDataToSend)
      } else {
        await updateReport(report.id, formDataToSend)
      }
      onSuccess()
      setIsSaving(false)
    } catch (err) {
      notify('Error saving/updating report')
      setIsSaving(false)
    }
  }

  const viewReport = async (reportId) => {
    try {
      const response = await getPresignedUrl(reportId)
      window.open(response.data.downloadUrl, '_blank')
    } catch (error) {
      notify('Error opening file')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="fw-bold">
        <Form.Label>Project</Form.Label>
        <Form.Control
          as="select"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
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
        <Form.Label>Element</Form.Label>
        <Form.Control
          as="select"
          name="element"
          value={formData.element}
          onChange={handleChange}
          required
        >
          <option value="">Select Element</option>
          {elementOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mt-2 fw-bold">
        <Form.Label>Object</Form.Label>
        <Form.Control
          as="select"
          name="object"
          value={formData.object}
          onChange={handleChange}
          required
        >
          <option value="">Select Object</option>
          {objectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mt-2 fw-bold">
        <Form.Label>Floor</Form.Label>
        <Form.Control
          as="select"
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          required
        >
          <option value="">Select Floor</option>
          {floorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {report?.url && (
        <Form.Group className="mt-2 fw-bold">
          <Form.Label>Attached Report File</Form.Label>
          <p>
            <Button
              onClick={() => viewReport(report.id)}
              variant="secondary"
              size="sm"
            >
              View
            </Button>
          </p>
        </Form.Group>
      )}

      <Form.Group className="mt-2 fw-bold">
        <Form.Label>Upload Report File</Form.Label>
        <Form.Control
          type="file"
          name="file"
          onChange={handleChange}
          accept=".pdf,.docx,.jpg,.png"
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" type="submit" disabled={saving}>
          {isNewEntry ? 'Create Report' : 'Update Report'}
        </Button>
      </div>
    </Form>
  )
}

export default ReportForm
