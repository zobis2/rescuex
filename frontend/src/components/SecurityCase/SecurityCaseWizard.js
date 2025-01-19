import React, { useState } from "react";
import KeyValueEditor from "./KeyValueEditor";
import LocationEditorWithMap from "./LocationEditorWithMap";
import ContactEditor from "./ContactEditor";
import MapsUploader from "./MapsUploader";

const SecurityCaseWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepData, setStepData] = useState({
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
    });
    const [maps, setMaps] = useState([
        { name: "צפון", image: null },
        { name: "דרום", image: null },
        { name: "מזרח", image: null },
        { name: "מערב", image: null },
    ]);

    const handleSave = (data) => {
        setStepData((prev) => ({
            ...prev,
            [currentStep]: data,
        }));
    };

    const handleAddCustomMap = () => {
        const mapName = prompt("הזן שם למפה החדשה:");
        if (mapName) {
            setMaps((prev) => [...prev, { name: mapName, image: null }]);
        }
    };

    const steps = [
        {
            title: "דרכי גישה",
            content: (
                <KeyValueEditor
                    title="דרכי גישה"
                    initialData={stepData[0]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "נהלי חירום",
            content: (
                <KeyValueEditor
                    title="נהלי חירום"
                    initialData={stepData[1]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "כניסות ויציאות",
            content: (
                <LocationEditorWithMap
                    title="כניסות ויציאות"
                    initialData={stepData[2]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "כניסות לחניונים",
            content: (
                <KeyValueEditor
                    title="כניסות לחניונים"
                    initialData={stepData[3]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "אנשי קשר לחירום",
            content: (
                <ContactEditor
                    title="אנשי קשר לחירום"
                    initialData={stepData[4]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "מפות המתחם",
            content: (
                <>
                    <MapsUploader maps={maps} onSave={setMaps} />
                    <button onClick={handleAddCustomMap} className="button is-primary">
                        הוסף מפה חדשה
                    </button>
                </>
            ),
        },
    ];

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="security-case-wizard" style={{ direction: "rtl" }}>
            <h1 className="title">ניהול תיק אבטחה</h1>

            {/* Step Indicator */}
            <nav className="steps is-centered">
                <ul>
                    {steps.map((step, index) => (
                        <li
                            key={index}
                            className={`steps-segment ${
                                currentStep === index ? "is-active" : ""
                            }`}
                        >
              <span
                  className={`steps-marker ${
                      currentStep === index
                          ? "has-background-primary has-text-white"
                          : ""
                  }`}
              >
                {index + 1}
              </span>
                            <div className="steps-content">
                                <p className="is-size-6">{step.title}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Step Content */}
            <div className="box">
                <h2 className="subtitle">{steps[currentStep].title}</h2>
                {steps[currentStep].content}
            </div>

            {/* Navigation Buttons */}
            <div className="buttons">
                <button
                    className="button is-link"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                >
                    הקודם
                </button>
                <button
                    className={`button ${isLastStep ? "is-success" : "is-link"}`}
                    onClick={handleNext}
                >
                    {isLastStep ? "סיום" : "הבא"}
                </button>
            </div>

            {/* Summary Section */}
            {isLastStep && (
                <div className="box">
                    <h2 className="subtitle">תצוגה מקיפה</h2>
                    <div>
                        <h3>דרכי גישה:</h3>
                        <pre>{JSON.stringify(stepData[0], null, 2)}</pre>
                    </div>
                    <div>
                        <h3>נהלי חירום:</h3>
                        <pre>{JSON.stringify(stepData[1], null, 2)}</pre>
                    </div>
                    <div>
                        <h3>כניסות ויציאות:</h3>
                        <pre>{JSON.stringify(stepData[2], null, 2)}</pre>
                    </div>
                    <div>
                        <h3>כניסות לחניונים:</h3>
                        <pre>{JSON.stringify(stepData[3], null, 2)}</pre>
                    </div>
                    <div>
                        <h3>אנשי קשר לחירום:</h3>
                        <pre>{JSON.stringify(stepData[4], null, 2)}</pre>
                    </div>
                    <div>
                        <h3>מפות:</h3>
                        {maps.map((map, index) => (
                            <div key={index}>
                                <p>{map.name}</p>
                                {map.image && <img src={map.image} alt={map.name} style={{ width: "100%" }} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityCaseWizard;
