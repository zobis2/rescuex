import React from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";

const SettingsModal = ({
  show,
  handleClose,
  settings,
  handleSettingChange,
}) => {
  // Separate text inputs and checkboxes
  const textInputs = Object.keys(settings).filter(
    (key) => typeof settings[key] !== "boolean"
  );
  const checkboxes = Object.keys(settings).filter(
    (key) => typeof settings[key] === "boolean"
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#f8f9fa" }}>
        <Form>
          <Row>
            {/* Render Text Inputs First */}
            {textInputs.map((key) => (
              <Col key={key} md={4} className="mb-3">
                <Form.Group>
                  <Form.Label
                    htmlFor={key}
                    className="d-block text-truncate"
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {key}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id={key}
                    name={key}
                    value={settings[key]}
                    onChange={handleSettingChange}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
          <Row>
            {/* Render Checkboxes After Text Inputs */}
            {checkboxes.map((key) => (
              <Col key={key} md={4} className="mb-3">
                <Form.Group>
                  <Form.Label
                    htmlFor={key}
                    className="d-block text-truncate"
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {key}
                  </Form.Label>
                  <Form.Check
                    type="checkbox"
                    id={key}
                    name={key}
                    checked={settings[key]}
                    onChange={handleSettingChange}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SettingsModal;
