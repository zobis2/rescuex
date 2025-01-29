import React, { useState, useEffect } from "react";

const KeyValueEditor = ({ title, initialData = [], predefinedKeys = [], onSave }) => {
    const [entries, setEntries] = useState(initialData);
    const [keyInput, setKeyInput] = useState("");
    const [valueInput, setValueInput] = useState("");
    const [customKey, setCustomKey] = useState("");

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

    const handleAddCustomKey = () => {
        if (customKey.trim() === "") return;
        predefinedKeys.push(customKey); // Dynamically add to predefined keys
        setCustomKey(""); // Clear the input
    };

    return (
        <div className="container">
            <div className="box has-text-centered" style={{ background:"transparent",direction: "rtl" }}>
                <h2 className="title">{title}</h2>

                {/* Key selection & value input */}
                <div className="field">
                    <label className="label">בחר מפתח</label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select value={keyInput} onChange={(e) => setKeyInput(e.target.value)}>
                                <option value="" disabled>בחר מפתח</option>
                                {predefinedKeys.map((key, index) => (
                                    <option key={index} value={key}>{key}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="field">
                    <label className="label">ערך</label>
                    <div className="control">
                        <input type="text" placeholder="ערך" value={valueInput} onChange={(e) => setValueInput(e.target.value)} className="input" />
                    </div>
                </div>

                <div className="field">
                    <div className="control">
                        <button onClick={handleAddEntry} className="button is-primary is-fullwidth">
                            הוסף
                        </button>
                    </div>
                </div>

                {/* Custom key input */}
                <div className="field">
                    <label className="label">הוסף מפתח מותאם אישית</label>
                    <div className="control">
                        <input type="text" placeholder="מפתח חדש" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="input" />
                    </div>
                    <div className="control">
                        <button onClick={handleAddCustomKey} className="button is-link is-fullwidth">
                            הוסף אופציה
                        </button>
                    </div>
                </div>

                {/* Entries list */}
                <div className="field">
                    <label className="label">רשימת מפתחות</label>
                    <ul className="list">
                        {entries.map((entry, index) => (
                            <li key={index} className="box">
                                <span className="has-text-weight-bold">{entry.key}:</span> {entry.value}
                                <button onClick={() => handleDeleteEntry(index)} className="button is-small is-danger is-pulled-left">
                                    מחק
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default KeyValueEditor;
