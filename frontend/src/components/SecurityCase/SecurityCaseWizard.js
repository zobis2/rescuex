import React, {useEffect, useState} from "react";
import KeyValueEditor from "./KeyValueEditor";
import LocationEditorWithMap from "./LocationEditorWithMap";
import ContactEditor from "./ContactEditor";
import MapsUploader from "./MapsUploader";
import axios from '../../utils/axiosConfig'
import FabricCanvasWithIcons from "../Canvas/FabricCanvas";

const SecurityCaseWizard = () => {
    const [selectedUsername, setSelectedUsername] = useState("");

    const [currentStep, setCurrentStep] = useState(0);
    const [stepData, setStepData] = useState({
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5:[]
    });
    const [maps, setMaps] = useState([

    ]);
    const [currentMapIndex, setCurrentMapIndex] = useState(0);
    const [editedMaps, setEditedMaps] = useState([]); // Stores edited canvas images

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("/api/users"); // Replace with your backend endpoint
                debugger;
                const data =response.data;
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);
    const handleSave = (data) => {
        setStepData((prev) => ({
            ...prev,
            [currentStep]: data,
        }));
    };

    const handleAddCustomMap = async () => {
        const mapName = prompt("הזן שם למפה החדשה:");
        if (!mapName) return;

        // Open a file picker for the image
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/jpeg,image/png,image/gif";

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    // Add the map with the image to the list
                    setMaps((prev) => [
                        ...prev,
                        { name: mapName, image: reader.result },
                    ]);
                };
                reader.readAsDataURL(file);
            } else {
                // Add the map without an image
                setMaps((prev) => [...prev, { name: mapName, image: null }]);
            }
        };

        // Trigger the file input
        fileInput.click();
    };

    const shaareZedekCoordinates = { lat: 31.773199, lng: 35.185261 };
    const handleStepClick = (index) => {
        setCurrentStep(index);
    };
    const selectedUser = users.find((user) => user.username === selectedUsername); // Use selectedUsername from dropdown
    const userLocation = selectedUser ? { lat: selectedUser.location.lat, lng: selectedUser.location.lng } : shaareZedekCoordinates;

    const steps = [
        {
            title: "דרכי גישה",
            content: (
                <KeyValueEditor
                    title="דרכי גישה"
                    initialData={stepData[0]}
                    predefinedKeys={["מערבי", "מזרחי", "צפוני", "דרומי"]}

                    onSave={handleSave}
                />
            ),
        },
        {
            title: "נהלי חירום",
            content: (
                <KeyValueEditor
                    title="נהלי חירום"
                    predefinedKeys={["שריפה", "פחע", "ארן"]}

                    initialData={stepData[1]}
                    onSave={handleSave}
                />
            ),
        },
        {
            title: "כניסות ויציאות",
            content: (
                <LocationEditorWithMap
                    initialCenter={userLocation}

                    // center={shaareZedekCoordinates}
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
                    predefinedKeys={["עליון", "תחתון"]}

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
                    <div className="  has-text-centered">


                        <button onClick={handleAddCustomMap} className="button  is-warning">
                            צור מפה עם שם חדש
                        </button>
                        <MapsUploader maps={maps} onSave={setMaps}/>

                    </div>
                </>
            ),
        },
        {
            title: "עריכת מפות",
            content: (
                <>

                    <FabricCanvasWithIcons
                        key={currentMapIndex} // Ensures component remounts on index change

                        savedState={editedMaps[currentMapIndex]?.state}
                        initialImage={maps[currentMapIndex]?.image}
                        floorTitle={maps[currentMapIndex]?.floor || `קומה ${currentMapIndex + 1}`}
                        onSave={(updatedImage) => {
                            const updatedEditedMaps = [...editedMaps];
                            updatedEditedMaps[currentMapIndex] = updatedImage; // Save edited map
                            setEditedMaps(updatedEditedMaps);
                        }}
                    />
                    {maps.length > 0 && (<div>

                        <div className="buttons is-centered">
                            <button
                                className="button is-link"
                                onClick={() => setCurrentMapIndex((prev) => Math.max(prev - 1, 0))}
                                disabled={currentMapIndex === 0}
                            >
                                חזור למפה הקודמת ({maps[currentMapIndex - 1]?.floor || ""})
                            </button>
                            <button
                                className="button is-link"
                                onClick={() =>
                                    setCurrentMapIndex((prev) => Math.min(prev + 1, maps.length - 1))
                                }
                                disabled={currentMapIndex === maps.length - 1}
                            >
                                עבור למפה הבאה ({maps[currentMapIndex + 1]?.floor || ""})
                            </button>
                            <button
                                className="button is-success"
                                onClick={() => alert("עריכת המפות הושלמה!")}
                                disabled={currentMapIndex !== maps.length - 1} // Only enable on the last map
                            >
                                סיים עריכת מפות
                            </button>
                        </div>


                    </div>)}
                </>
            ),
        },
    ];
    const handleFinish = async () => {
        try {
            for (let i = 0; i < editedMaps.length; i++) {
                const mapData = editedMaps[i];
                if (mapData) {
                    const response = await axios.put(
                        `/s3/upload/${maps[i].floor}`, // Use the floor name as the file key
                        {data: mapData}
                    );
                    console.log(`Uploaded ${maps[i].floor}:`, response.data);
                }
            }
            alert("All maps have been uploaded successfully!");
        } catch (error) {
            console.error("Error uploading maps to S3:", error);
            alert("Failed to upload maps. Please try again.");
        }
    };
    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="container is-max-desktop">
            <div className="security-case-wizard box" style={{background: "transparent", direction: "rtl"}}>
                <h1 className="title has-text-centered">ניהול תיק אבטחה</h1>

                {/* User Selection */}
                <div className="field">
                    <label className="label has-text-white">בחר יוזר:</label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select value={selectedUsername} onChange={(e) => setSelectedUsername(e.target.value)}>
                                <option value="">בחר יוזר</option>
                                {users.map((user) => (
                                    <option key={user.username} value={user.username}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Steps Navigation */}
                {/* Steps Navigation */}
                <nav className="steps">
                    <ul
                        className="steps has-text-centered is-flex is-flex-wrap-wrap is-justify-content-center"
                        style={{ gap: "10px", padding: "0", listStyle: "none" }}
                    >
                        {steps.map((step, index) => (
                            <li
                                key={index}
                                className={`steps-segment ${currentStep === index ? "is-active" : ""}`}
                                onClick={() => handleStepClick(index)}
                                style={{
                                    flex: "1 1 auto",
                                    minWidth: "120px",
                                    maxWidth: "160px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    padding: "10px"
                                }}
                            >
                <span
                    className={`steps-marker ${currentStep === index ? "has-background-warning has-text-dark" : "has-background-primary has-text-white"}`}
                    style={{
                        width: "40px",
                        height: "40px",
                        fontSize: "18px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontWeight: "bold"
                    }}
                >
                    {index + 1}
                </span>
                                <div
                                    className="steps-content is-size-6 has-text-weight-bold has-text-white"
                                    style={{ whiteSpace: "nowrap", marginTop: "5px" }}
                                >
                                    {step.title}
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Step Content */}
                <div className="box has-background-light">
                    <h2 className="subtitle">{steps[currentStep].title}</h2>
                    {steps[currentStep].content}
                </div>

                {/* Navigation Buttons */}
                <div className="buttons is-centered">
                    <button className="button is-link is-fullwidth" onClick={handlePrevious} disabled={currentStep === 0}>
                        הקודם
                    </button>
                    <button
                        className={`button is-fullwidth ${isLastStep ? "is-success" : "is-link"}`}
                        onClick={isLastStep ? handleFinish : handleNext}
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
        </div>
    );

};

export default SecurityCaseWizard;
