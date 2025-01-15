import React, { useState, useEffect } from 'react'
import { Tabs, Tab, Table, Button, Modal, Container } from 'react-bootstrap'
import { getCompanies, getProjects, getUsers } from '../../api/platform'
import CompanyForm from './CompanyForm'
import ProjectForm from './ProjectForm'
import UserForm from './UserForm'

function ManageUsers() {
  const [key, setKey] = useState('companies')
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [editingCompany, setEditingCompany] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewEntry, setIsNewEntry] = useState(false)

  useEffect(() => {
    fetchCompanies()
    fetchProjects()
    fetchUsers()
  }, [])

  const fetchCompanies = async () => {
    try {
      const companiesResponse = await getCompanies()
      setCompanies(companiesResponse.data)
    } catch (error) {
      console.error('Error fetching companies', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const projectsResponse = await getProjects()
      setProjects(projectsResponse.data)
    } catch (error) {
      console.error('Error fetching projects', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersResponse = await getUsers()
      setUsers(usersResponse.data)
    } catch (error) {
      console.error('Error fetching users', error)
    }
  }

  const handleCompany = (company) => {
    if (!company) {
      setIsNewEntry(true)
    }
    setEditingCompany(company)
    setShowModal(true)
  }

  const handleProject = (project) => {
    if (!project) {
      setIsNewEntry(true)
    }
    setEditingProject(project)
    setShowModal(true)
  }

  const handleUser = (user) => {
    if (!user) {
      setIsNewEntry(true)
    }
    setEditingUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsNewEntry(false)
    setEditingCompany(null)
    setEditingProject(null)
    setEditingUser(null)
  }

  const handleCompanySuccess = () => {
    handleCloseModal()
    fetchCompanies()
  }

  const handleProjectSuccess = () => {
    handleCloseModal()
    fetchProjects()
  }

  const handleUserSuccess = () => {
    handleCloseModal()
    fetchUsers()
  }

  const getTitle = () => {
    if (key === 'companies' && editingCompany) {
      return 'Edit Company'
    }
    if (key === 'companies' && isNewEntry) {
      return 'Add Company'
    }
    if (key === 'projects' && editingProject) {
      return 'Edit Project'
    }
    if (key === 'projects' && isNewEntry) {
      return 'Add Project'
    }
    if (key === 'users' && editingUser) {
      return 'Edit User'
    }
    if (key === 'users' && isNewEntry) {
      return 'Add User'
    }
  }

  const showCompanyForm = key === 'companies' && (editingCompany || isNewEntry)
  const showProjectForm = key === 'projects' && (editingProject || isNewEntry)
  const showUserForm = key === 'users' && (editingUser || isNewEntry)

  return (
    <Container>
      <h1>Manage Platform Entities</h1>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="companies" title="Companies">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleCompany(null)}
          >
            Add Company
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>{company.name}</td>
                  <td>{company.type}</td>
                  <td>
                    <Button
                      onClick={() => handleCompany(company)}
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
        <Tab eventKey="projects" title="Projects">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleProject(null)}
          >
            Add Project
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.name}</td>
                  <td>{project.address}</td>
                  <td>{project.active ? 'Yes' : 'No'}</td>
                  <td>
                    <Button
                      onClick={() => handleProject(project)}
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
        <Tab eventKey="users" title="Users">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleUser(null)}
          >
            Add User
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Company</th>
                <th>Role</th>
                <th>Access Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.companyId}</td>
                  <td>{user.role}</td>
                  <td>{user.access_level}</td>
                  <td>
                    <Button onClick={() => handleUser(user)} variant="warning">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Modal for editing companies, projects, or users */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{getTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showCompanyForm && (
            <CompanyForm
              company={editingCompany}
              onSuccess={handleCompanySuccess}
            />
          )}
          {showProjectForm && (
            <ProjectForm
              project={editingProject}
              onSuccess={handleProjectSuccess}
            />
          )}
          {showUserForm && (
            <UserForm user={editingUser} onSuccess={handleUserSuccess} />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default ManageUsers
