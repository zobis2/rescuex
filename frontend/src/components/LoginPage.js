// src/components/LoginPage.js
import React, { useState } from 'react'
import axios from '../axiosConfig'
import { Container, Row, Form, Col, Button, Toast } from 'react-bootstrap'
import { login } from '../api/authApi'

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      const response = await login(username, password)
      console.log(response)
      if (response.message === 'Login successful') {
        localStorage.setItem('loggedIn', 'true')
        setShowToast(false)
        onLogin()
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Invalid email or password')
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.')
      }
      setShowToast(true)
      setIsLoggingIn(false)
    }
  }

  return (
    <Container>
      <Form>
        <Row className="justify-content-md-center vh-100 align-items-center">
          <Col md={4}>
            <h3 className="text-center mb-3">Login</h3>
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={6000}
              autohide
              className="w-100 mt-3"
              bg="dark"
              text="light"
            >
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body style={{ color: 'white' }}>{errorMessage}</Toast.Body>
            </Toast>
          </Col>
        </Row>
      </Form>
    </Container>
  )
}

export default LoginPage
