import React, { useState, useEffect } from 'react';

const NetSetDialog = ({ Object, netSets: initialNetSets, onAddNetSet, onClose }) => {
    const [netSets, setNetSets] = useState(initialNetSets || [{ setId: '', markedArea: '' }]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialNetSets) {
            setNetSets(initialNetSets);
        }
    }, [initialNetSets]);

    const handleAddNetSet = () => {
        const newNetSet = { setId: '', markedArea: '' };
        setNetSets([...netSets, newNetSet]);
        onAddNetSet([...netSets, newNetSet]);
    };

    const handleDeleteNetSet = (index) => {
        const newNetSets = netSets.filter((_, i) => i !== index);
        setNetSets(newNetSets);
        onAddNetSet(newNetSets);
    };

    const handleChange = (index, key, value) => {
        const newNetSets = netSets.map((netSet, i) =>
            i === index ? { ...netSet, [key]: value } : netSet
        );
        setNetSets(newNetSets);
        onAddNetSet(newNetSets);
    };

    const validateAndSave = (index, key, value) => {
        let error = '';
        debugger;
        if (key === 'setId' && !Number.isInteger(Number(value))) {
            error = 'Set ID should be an integer.';
        }
         if (key === 'markedArea' && isNaN(Number(value))) {
            error = 'Marked Area should be a float.';
        }
        if (error) {
            setError(error);
        } else {
            setError('');
            handleChange(index, key, value);
        }
    };

    return (
        <div>
            <h3>Add Net Sets</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {netSets.map((netSet, index) => (
                <div key={index}>
                    <label>Set ID:</label>
                    <input
                        type="text"
                        value={netSet.setId}
                        onChange={(e) => validateAndSave(index, 'setId', e.target.value)}
                    />
                    <label>Marked Area:</label>
                    <input
                        type="text"
                        value={netSet.markedArea}
                        onChange={(e) => validateAndSave(index, 'markedArea', e.target.value)}
                    />
                    <button onClick={() => handleDeleteNetSet(index)}>Delete</button>
                </div>
            ))}
            <button onClick={handleAddNetSet}>Add Net Set</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default NetSetDialog;
