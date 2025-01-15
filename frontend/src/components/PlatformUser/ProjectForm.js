import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  createProject,
  deleteProject,
  getCompanies,
  updateProject,
} from '../../api/platform'
import ConfirmDialog from './ConfirmDialog'

const ProjectForm = ({ project = {}, onSuccess }) => {
  const [name, setName] = useState(project?.name || '')
  const [address, setAddress] = useState(project?.address || '')
  const [active, setActive] = useState(project?.active || true)
  const [relatedCompanies, setRelatedCompanies] = useState(
    project?.companies.map((rc) => rc?.companyId) || []
  )
  const [companies, setCompanies] = useState([])
  const [saving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const notify = (msg) => toast.error(msg)

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await getCompanies()
      setCompanies(response.data)
    }
    fetchCompanies()
  }, [])

  const handleCompaniesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions)
    const selectedCompanyIds = selectedOptions.map((option) => option.value)
    setRelatedCompanies(selectedCompanyIds)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      name,
      address,
      active,
      relatedCompanies: relatedCompanies.filter((value) => value !== 'none'),
    }

    setIsSaving(true)
    try {
      if (project?.id) {
        await updateProject(project.id, data)
      } else {
        await createProject(data)
      }
      onSuccess()
      setIsSaving(false)
    } catch (error) {
      notify('error saving/updating project')
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProject(project.id)
      onSuccess()
      setShowDeleteModal(false)
    } catch (error) {
      notify('error deleting user')
    } finally {
      setShowDeleteModal(false)
      setDeleting(false)
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="fw-bold">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mt-2 fw-bold">
          <Form.Label>Project Address</Form.Label>
          <Form.Control
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mt-2 fw-bold">
          <Form.Check
            type="checkbox"
            label="Active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label className="fw-bold">Related Companies</Form.Label>
          <p className="text-muted" style={{ fontSize: '12px' }}>
            Hold down the <strong>Ctrl/Command</strong> key to select multiple
            companies
          </p>
          <Form.Control
            as="select"
            multiple
            value={relatedCompanies}
            onChange={handleCompaniesChange}
          >
            <option key="none" value="none">
              None
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <div className="d-flex justify-content-between mt-3">
          <Button variant="primary" type="submit" disabled={saving}>
            {project?.id ? 'Update' : 'Create'} Project
          </Button>
          {project?.id && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Project
            </Button>
          )}
        </div>
      </Form>
      <ConfirmDialog
        loading={deleting}
        onConfirm={handleDelete}
        showModal={showDeleteModal}
        toggleModal={() => setShowDeleteModal(false)}
        entity="project"
      />
    </>
  )
}

export default ProjectForm
