import React, { useState, useEffect } from "react";

const KeyValueEditor = ({ title, initialData = [], onSave }) => {
    const [entries, setEntries] = useState(initialData);
    const [keyInput, setKeyInput] = useState("");
    const [valueInput, setValueInput] = useState("");

    useEffect(() => {
        setEntries(initialData); // Update entries when initialData changes
    }, [initialData]);

    const handleAddEntry = () => {
        if (!keyInput || !valueInput) return;
        const newEntry = { key: keyInput, value: valueInput };
        const updatedEntries = [...entries, newEntry];
        setEntries(updatedEntries);
        onSave(updatedEntries); // Pass data to parent
        setKeyInput("");
        setValueInput("");
    };

    const handleDeleteEntry = (index) => {
        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);
        onSave(updatedEntries); // Pass data to parent
    };

    return (
        <div className="key-value-editor has-text-centered" style={{ direction: "rtl" }}>
            <h2 className="title">{title}</h2>
            <div className="field is-grouped is-justify-content-center">
                <div className="control">
                    <input
                        type="text"
                        placeholder="מפתח"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="control">
                    <input
                        type="text"
                        placeholder="ערך"
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="control">
                    <button onClick={handleAddEntry} className="button is-primary">
                        הוסף
                    </button>
                </div>
            </div>
            <ul className="is-flex is-flex-direction-column is-align-items-center">
                {entries.map((entry, index) => (
                    <li key={index} className="box" style={{ maxWidth: "400px", marginBottom: "10px" }}>
                        <strong>{entry.key}:</strong> {entry.value}{" "}
                        <button
                            onClick={() => handleDeleteEntry(index)}
                            className="button is-small is-danger"
                        >
                            מחק
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default KeyValueEditor;
