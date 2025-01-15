import React, { useState, useEffect } from "react";
import settingsOptions from "../../utils/orthophoto/settings.json";
import { Form, Row, Col, Button } from "react-bootstrap";
import SettingsModal from "./SettingsModal";

const SettingsComponent = ({ selectedOption, onChangeSettings }) => {
  const [settings, setSettings] = useState(settingsOptions[selectedOption]);
  const [option, setOption] = useState(selectedOption);
  const [showSettings, setShowSettings] = useState(false); // Track visibility

  useEffect(() => {
    setSettings(settingsOptions[selectedOption]);
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    const selected = event.target.value;
    setOption(selected);
    setSettings(settingsOptions[selected]);
    onChangeSettings(settingsOptions[selected], selected);
  };

  const handleSettingChange = (event) => {
    const { name, value, type, checked } = event.target;
    const settingValue = type === "checkbox" ? checked : value;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: settingValue,
    }));

    onChangeSettings(
      {
        ...settings,
        [name]: settingValue,
      },
      option
    );
  };

  const toggleSettings = () => {
    setShowSettings((prevState) => !prevState);
  };

  return (
    <div>
      <Row>
        <Col>
          <Form.Group controlId="settingsSelect">
            <Form.Label>Settings</Form.Label>
            <Form.Select
              id="settingsSelect"
              value={option}
              onChange={handleOptionChange}
            >
              {Object.keys(settingsOptions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Button
        className="mt-2"
        variant="primary"
        size="sm"
        onClick={toggleSettings}
      >
        {showSettings ? "Hide Settings" : "Show Settings"}
      </Button>

      {showSettings ? (
        <SettingsModal
          handleClose={() => setShowSettings((show) => !show)}
          handleSettingChange={handleSettingChange}
          settings={settings}
          show={showSettings}
        />
      ) : (
        <p>This setting consists of {Object.keys(settings).length} keys.</p>
      )}
    </div>
  );
};

export default SettingsComponent;
