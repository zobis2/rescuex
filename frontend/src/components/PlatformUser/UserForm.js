import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  createUser,
  deleteUser,
  getCompanies,
  getProjects,
  updateUser,
} from '../../api/platform'
import ConfirmDialog from './ConfirmDialog'
import { userAccessLevels, userRoles } from './constants'

const UserForm = ({ user = {}, onSuccess }) => {
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState(
    user?.password || Math.random().toString(36).slice(-8)
  )
  const [companyId, setCompanyId] = useState(user?.companyId || '')
  const [role, setRole] = useState(user?.role || 'user')
  const [accessLevel, setAccessLevel] = useState(user?.accessLevel || 'user')
  const [name, setName] = useState(user?.name || '')
  const [selectedProjects, setSelectedProjects] = useState(
    user?.projects?.map((rp) => rp?.projectId) || []
  )
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [saving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const notify = (msg) => toast.error(msg)

  useEffect(() => {
    const fetchData = async () => {
      const [companyResponse, projectResponse] = await Promise.all([
        getCompanies(),
        getProjects(),
      ])
      setCompanies(companyResponse.data)
      setProjects(projectResponse.data)
    }
    fetchData()
  }, [])

  const handleProjectsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions)
    const selectedProjectIds = selectedOptions.map((option) => option.value)
    setSelectedProjects(selectedProjectIds)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      email,
      name,
      password,
      companyId,
      role,
      accessLevel,
      projectIds: selectedProjects.filter((value) => value !== 'none'),
    }
    setIsSaving(true)
    try {
      if (user?.id) {
        await updateUser(user.id, data)
      } else {
        await createUser(data)
      }
      onSuccess()
      setIsSaving(false)
    } catch (error) {
      notify('Error creating/updating user')
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(user.id)
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
        <Row>
          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formUsername">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formPassword">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formCompany">
              <Form.Label>Company</Form.Label>
              <Form.Control
                as="select"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">select role</option>
                {userRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={6} className="mt-2 fw-bold">
            <Form.Group controlId="formAccessLevel">
              <Form.Label>Access Level</Form.Label>
              <Form.Control
                as="select"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
              >
                <option value="">select level</option>
                {userAccessLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="formProjects" className="mt-2">
          <Form.Label className="fw-bold">Projects</Form.Label>
          <p className="text-muted" style={{ fontSize: '12px' }}>
            Hold down the <strong>Ctrl/Command</strong> key to select multiple
            companies
          </p>
          <Form.Control
            as="select"
            multiple
            value={selectedProjects}
            onChange={handleProjectsChange}
          >
            <option key="none" value="none">
              None
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <div className="d-flex justify-content-between mt-3">
          <Button variant="primary" type="submit" disabled={saving}>
            {user?.id ? 'Update' : 'Create'} User
          </Button>
          {user?.id && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete User
            </Button>
          )}
        </div>
      </Form>
      <ConfirmDialog
        loading={deleting}
        onConfirm={handleDelete}
        showModal={showDeleteModal}
        toggleModal={() => setShowDeleteModal(false)}
        entity="user"
      />
    </>
  )
}

export default UserForm
