// ValidationDialog.js
import React from 'react';

const ValidationDialog = ({ file, error, onContinue, onCancel, onStop }) => {
    return (
        <div className="dialog">
            <h3>Validation Error</h3>
            <p>File: {file.name}</p>
            <p>Error: {error}</p>
            <button onClick={onContinue}>Continue Anyway</button>
            <button onClick={onCancel}>Skip File</button>
            <button onClick={onStop}>Stop Upload</button>
        </div>
    );
};

export default ValidationDialog;
