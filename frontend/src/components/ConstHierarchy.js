import React, { useState, useEffect } from 'react'
import HierarchySelector from './HierarchySelector'
import { Container, Button } from 'react-bootstrap'

export const hierarchyStorageKey = 'ATOM-HIERARCHY'

const ConstHierarchy = () => {
  const [hierarchy, setHierarchy] = useState({})

  useEffect(() => {
    const data = localStorage.getItem(hierarchyStorageKey)
    const storedHierarchy = JSON.parse(data)
    if (storedHierarchy) {
      setHierarchy({ ...hierarchy, ...storedHierarchy })
    }
  }, [])

  const handleHierarchyChange = (newHierarchy) => {
    setHierarchy({ ...hierarchy, ...newHierarchy })
  }

  function saveHierachy() {
    localStorage.setItem(hierarchyStorageKey, JSON.stringify(hierarchy))
    alert('Hierarchy saved successfully')
  }

  const disabled = Object.values(hierarchy).length === 0

  return (
    <Container>
      <h1>Const Hierarchy</h1>
      <HierarchySelector
        onSelectionChange={handleHierarchyChange}
        type="AB"
        includeOrientation
      />
      <Button
        onClick={saveHierachy}
        variant="primary"
        className="mt-3"
        disabled={disabled}
      >
        Save hierarchy
      </Button>
    </Container>
  )
}

export default ConstHierarchy
