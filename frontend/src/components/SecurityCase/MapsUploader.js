import React, { useState } from "react";

const MapsUploader = ({ maps, onSave }) => {
    const [uploadedMaps, setUploadedMaps] = useState(maps || []);
    const [selectedFloor, setSelectedFloor] = useState(-4); // Default to empty selection
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileUpload = (e, floorIndex) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const updatedMaps = [...uploadedMaps];
                updatedMaps[floorIndex].image = reader.result;
                setUploadedMaps(updatedMaps);
                if (onSave) onSave(updatedMaps);
                setErrorMessage(""); // Clear any previous errors
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddFloor = () => {
        // Ensure a floor is selected
        if (selectedFloor === -4) {
            setErrorMessage("אנא בחר קומה מהרשימה לפני הוספת קומה חדשה");
            return;
        }

        // Validate the last floor
        if (uploadedMaps.length > 0) {
            const lastFloor = uploadedMaps[uploadedMaps.length - 1];
            if (!lastFloor.image) {
                setErrorMessage(`אנא העלה מפה עבור ${lastFloor.floor} לפני הוספת קומה חדשה`);
                return;
            }
        }

        // Check if the selected floor already exists
        if (uploadedMaps.some((floor) => floor.floor === `קומה ${selectedFloor}`)) {
            setErrorMessage(`קומה ${selectedFloor} כבר קיימת!`);
            return;
        }

        // Add the selected floor
        const newFloor = { floor: `קומה ${selectedFloor}`, image: null };
        const updatedMaps = [...uploadedMaps, newFloor];
        setUploadedMaps(updatedMaps);
        if (onSave) onSave(updatedMaps);

        // Reset the selection and clear errors
        setSelectedFloor(-4); // Reset to default empty value
        setErrorMessage("");
    };

    const validateUploadedMaps = () => {
        for (const floor of uploadedMaps) {
            if (!floor.image) {
                setErrorMessage(`אנא העלה מפה עבור ${floor.floor}`);
                return false;
            }
        }
        setErrorMessage(""); // Clear errors
        return true;
    };

    const handleSave = () => {
        if (validateUploadedMaps()) {
            alert("כל המפות הועלו בהצלחה!");
        }
    };

    const handleDeleteFloor = (floorIndex) => {
        const updatedMaps = uploadedMaps.filter((_, index) => index !== floorIndex);
        setUploadedMaps(updatedMaps);
        if (onSave) onSave(updatedMaps);
    };

    return (
        <div className="container maps-uploader has-text-centered" style={{ direction: "rtl" }}>
            <h2 className="has-text-centered">מפות המתחם</h2>
            <div className="field">
                {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}

                <label className="label">בחר קומה</label>
                <div className="control">
                    <div className="select is-primary">
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(Number(e.target.value))}
                        >
                            <option value={-4}>בחר קומה</option> {/* Default empty option */}
                            {Array.from({ length: 15 }, (_, i) => i - 4).map((floor) => (
                                <option key={floor} value={floor}>
                                    קומה {floor}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="buttons is-centered">
                <button
                    onClick={handleAddFloor}
                    className="button is-primary"
                    disabled={selectedFloor === -4} // Disable if no valid floor is selected
                >
                    הוסף קומה חדשה
                </button>
                <button onClick={handleSave} className="button is-success">
                    שמור מפות
                </button>
            </div>

            {uploadedMaps.map((floor, floorIndex) => (
                <div key={floorIndex} className="floor">
                    <h3 className="has-text-centered">{floor.floor}</h3>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleFileUpload(e, floorIndex)}
                    />
                    {floor.image && (
                        <img
                            src={floor.image}
                            alt={`מפת ${floor.floor}`}
                            style={{ width: "80%", maxWidth: "300px", margin: "10px auto" }}
                        />
                    )}
                    <button
                        onClick={() => handleDeleteFloor(floorIndex)}
                        className="button is-danger is-light"
                        style={{ marginTop: "10px" }}
                    >
                        מחק קומה
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MapsUploader;
