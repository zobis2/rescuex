import React, { useState, useEffect } from 'react';
import { getNetSets, postNetSets } from '../api/folderApi';
import { calcQuantities } from '../api/streamApi';
import { S3_BUCKET_NAME } from '../utils/consts';
import HierarchySelector from './HierarchySelector';
import NetSetDialog from './NetSetDialog';
import { Container } from "react-bootstrap";

const CalcQuantities = () => {
    const [hierarchy, setHierarchy] = useState({});
    const [netSets, setNetSets] = useState([]);
    const [message, setMessage] = useState('');
    const [showNetSetDialog, setShowNetSetDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchNetSets = async () => {
            if (hierarchy.client && hierarchy.project && hierarchy.floor && hierarchy.element && hierarchy.object) {
                try {
                    const data = await getNetSets(S3_BUCKET_NAME, hierarchy)
                    setNetSets(data);
                } catch (error) {
                    console.error('Error fetching net sets', error);
                }
            }
        };

        fetchNetSets();
    }, [hierarchy]);

    const handleHierarchyChange = (newHierarchy) => {
        setHierarchy({ ...hierarchy, ...newHierarchy });
    };

    const handleAddNetSet =async (newNetSets) => {
        setNetSets(newNetSets);
        await saveNetsets(newNetSets);

    };

    const handleCalcQuantities = () => {
        setShowNetSetDialog(true);
    };

    async function saveNetsets(newNetSets) {
        // Save the new net sets
        let x=0
        try{
            await postNetSets(S3_BUCKET_NAME, hierarchy, newNetSets)
        }
        catch(error){
       console.error('Error saving net sets', error.message);
        }
        finally {
            console.log("saveNetsets",newNetSets)

        }

    }

    const handleSubmit = async () => {
        // if (!netSets || netSets.length === 0) {
        //     setMessage('Error: Please add net sets before calculating quantities.');
        //     return;
        // }
        setIsSubmitting(true);
        setMessage('');
        setProgress(0);

        try {
            await saveNetsets(netSets);
            setProgress(10);
            debugger;
            const response = await calcQuantities(netSets, hierarchy, S3_BUCKET_NAME, setProgress)
            const contentType = response.headers['content-type'];
            if (contentType.includes('application/json')) {
                const text = await response.data.text();
                const errorObject = JSON.parse(text);
                setMessage('Error calculating quantities. Please try again. ' + errorObject.error);
            } else {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'quantities.xlsx');
                document.body.appendChild(link);
                link.click();
                link.remove();
                setMessage('Quantities calculated successfully');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                try {
                    const text = await error.response.data.text();
                    const errorObject = JSON.parse(text);
                    setMessage('Error calculating quantities. Please try again. ' + errorObject.error);
                } catch (e) {
                    setMessage('Error calculating quantities. Please try again.');
                }
            } else {
                console.error('Error calculating quantities', error);
                setMessage('Error calculating quantities. Please try again.');
            }
        } finally {
            setIsSubmitting(false);

            // Fetch the net sets again to ensure accurate data from the server
            try {
                const data = await getNetSets(S3_BUCKET_NAME, hierarchy)
                setNetSets(data);
            } catch (error) {
                console.error('Error fetching net sets after submission', error);
            }
        }
    };

    return (
        <Container>
            <h1>Calculate Quantities</h1>
            <HierarchySelector onSelectionChange={handleHierarchyChange} type="AB" />
            {message && <p>{message}</p>}
            {hierarchy.object && (
                <>
                    <button onClick={handleCalcQuantities}>Edit Net Sets</button>
                    <NetSetDialog
                        Object={`clients/${hierarchy.client}/${hierarchy.project}/${hierarchy.floor}/${hierarchy.element}/${hierarchy.object}`}
                        netSets={netSets}
                        onAddNetSet={handleAddNetSet}
                        onClose={() => setShowNetSetDialog(false)}
                    />
                    <button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    {isSubmitting && (
                        <div>
                            <progress value={progress} max="100">{progress}%</progress>
                            <p>Progress: {progress}%</p>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default CalcQuantities;
