import React, { useState, useEffect } from 'react';
import HierarchySelector from './HierarchySelector';
import { S3_BUCKET_NAME } from '../utils/consts';
import { Container } from "react-bootstrap";
import { compareRebars } from '../api/streamApi';


const CompareRebar = () => {
    const [hierarchy, setHierarchy] = useState({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);


    useEffect(() => {
    }, [hierarchy]);

    const handleHierarchyChange = (newHierarchy) => {
        setHierarchy({ ...hierarchy, ...newHierarchy });
    };






    const handleSubmit = async () => {
        // if (!netSets || netSets.length === 0) {
        //     setMessage('Error: Please add net sets before calculating quantities.');
        //     return;
        // }
        setIsSubmitting(true);
        setMessage('');///
        setProgress(0);


        try {
            setProgress(20);
            debugger;
            const response = await compareRebars(hierarchy, S3_BUCKET_NAME)

        const message=response.Success;
        debugger;
        setMessage(message);
        } catch (error) {
            if (error.response && error.response.data) {
                try {
                    const text = await error.response.data.text();
                    const errorObject = JSON.parse(text);
                    setMessage('Error Compare Rebar. Please try again. ' + errorObject.error);
                } catch (e) {
                    setMessage('Error Error Compare Rebar. Please try again.');
                }
            } else {
                console.error('Error Error Compare Rebar', error);
                setMessage('Error Error Compare Rebar, Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <h1>Compare Rebars</h1>
            <HierarchySelector onSelectionChange={handleHierarchyChange} type="AB" />
            {hierarchy.object && (
                <div>
                    <button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Comparing Rebars...' : 'Compare Rebar'}
                    </button>
                    {isSubmitting && (
                        <div>
                            <progress value={progress} max="100">{progress}%</progress>
                            <p>Progress: {progress}%</p>
                        </div>
                    )}
                    {message && <p>{message}</p>}

                </div>
            )}
        </Container>
    );
};

export default CompareRebar;
