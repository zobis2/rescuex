import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createCompany, deleteCompany, updateCompany } from '../../api/platform'
import ConfirmDialog from './ConfirmDialog'
import { companyTypes } from './constants'

const CompanyForm = ({ company = {}, onSuccess }) => {
  const [name, setName] = useState(company?.name || '')
  const [type, setType] = useState(company?.type || '')
  const [saving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const notify = (msg) => toast.error(msg)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { name, type }
    setIsSaving(true)
    try {
      if (company?.id) {
        await updateCompany(company.id, data)
      } else {
        await createCompany(data)
      }
      onSuccess()
      setIsSaving(false)
    } catch (error) {
      setIsSaving(true)
      notify('error saving/updating company')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCompany(company.id)
      onSuccess()
      setShowDeleteModal(false)
    } catch (error) {
      notify('error deleting company')
    } finally {
      setShowDeleteModal(false)
      setDeleting(false)
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="fw-bold">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mt-2 fw-bold">
          <Form.Label>Company Type</Form.Label>
          <Form.Control
            as="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            {companyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <div className="d-flex justify-content-between mt-3">
          <Button variant="primary" type="submit" disabled={saving}>
            {company?.id ? 'Update' : 'Create'} Company
          </Button>
          {company?.id && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Company
            </Button>
          )}
        </div>
      </Form>

      <ConfirmDialog
        loading={deleting}
        onConfirm={handleDelete}
        showModal={showDeleteModal}
        toggleModal={() => setShowDeleteModal(false)}
        entity="company"
      />
    </>
  )
}

export default CompanyForm
