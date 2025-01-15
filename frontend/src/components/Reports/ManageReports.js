import React, { useState, useEffect } from 'react'
import { Tabs, Tab, Table, Button, Modal, Container } from 'react-bootstrap'
import { getPresignedUrl, getReports } from '../../api/platform'
import ReportForm from './ReportForm'

function ManageReports() {
  const [reports, setReports] = useState([])
  const [editingReport, setEditingReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewEntry, setIsNewEntry] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      const reportsResponse = await getReports()
      setReports(reportsResponse.data)
    } catch (error) {
      console.error('Error fetching reports', error)
    }
  }

  // Handle Add/Edit Report
  const handleReport = (report) => {
    if (!report) {
      setIsNewEntry(true)
    }
    setEditingReport(report)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsNewEntry(false)
    setEditingReport(null)
  }

  const handleReportSuccess = () => {
    handleCloseModal()
    fetchReports()
  }

  const getTitle = () => {
    return editingReport ? 'Edit Report' : 'Add Report'
  }

  const viewReport = async (reportId) => {
    try {
      const response = await getPresignedUrl(reportId)
      window.open(response.data.downloadUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  return (
    <Container>
      <h1>Manage Reports</h1>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => handleReport(null)}
      >
        Add Report
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project ID</th>
            <th>Element</th>
            <th>Object</th>
            <th>Floor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.projectId}</td>
              <td>{report.element}</td>
              <td>{report.object}</td>
              <td>{report.floor}</td>
              <td>
                <Button
                  onClick={() => viewReport(report.id)}
                  variant="secondary"
                  size="sm"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleReport(report)}
                  variant="warning"
                  size="sm"
                  className="ms-2"
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for adding/editing reports */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{getTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReportForm
            report={editingReport}
            onSuccess={handleReportSuccess}
            isNewEntry={isNewEntry}
          />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default ManageReports
