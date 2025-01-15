import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { elements, objects, S3_BUCKET_NAME } from '../utils/consts';

const EditableHierarchySelector = ({ onSelectionChange, clients }) => {
    const [client, setClient] = useState('');
    const [project, setProject] = useState('');
    const [floor, setFloor] = useState('');
    const [element, setElement] = useState('');
    const [object, setObject] = useState('');
    const [projects, setProjects] = useState([]);
    const [floors, setFloors] = useState([]); // New state for floors
    const [newFloor, setNewFloor] = useState(''); // State for new floor input
    const [isCreatingNewFloor, setIsCreatingNewFloor] = useState(false); // State to track new floor creation
    const [message, setMessage] = useState('');
    const bucketName = S3_BUCKET_NAME;

    useEffect(() => {
        if (clients.includes(client)) {
            const fetchProjects = async () => {
                try {
                    const response = await axios.get('/api/folder/list-projects', { params: { bucketName, client } });
                    setProjects(response.data.projects);
                } catch (error) {
                    console.error('Error fetching projects', error);
                    setMessage('Error fetching projects');
                }
            };
            fetchProjects();
        } else {
            setProjects([]);
        }
    }, [client, clients]);

    useEffect(() => {
        if (project) {
            const fetchFloors = async () => {
                try {
                    const response = await axios.get('/api/folder/list-floors', { params: { bucketName, client, project } });
                    setFloors(response.data.floors);
                } catch (error) {
                    console.error('Error fetching floors', error);
                    setMessage('Error fetching floors');
                }
            };
            fetchFloors();
        } else {
            setFloors([]);
        }
    }, [client, project]);

    const handleClientChange = (event) => {
        const clientName = event.target.value;
        setClient(clientName);
        setProjects([]);
        setFloor('');
        setElement('');
        setObject('');
        setNewFloor(''); // Reset new floor input
        setIsCreatingNewFloor(false); // Reset new floor creation state
        onSelectionChange({ client: clientName });
    };

    const handleProjectChange = (event) => {
        const projectName = event.target.value;
        setProject(projectName);
        setFloor('');
        setElement('');
        setObject('');
        setNewFloor(''); // Reset new floor input
        setIsCreatingNewFloor(false); // Reset new floor creation state
        onSelectionChange({ client, project: projectName });
    };

    const handleFloorChange = (event) => {
        const selectedFloor = event.target.value;
        debugger;
        if (selectedFloor === 'createNew') {
            setFloor('');
            setNewFloor(''); // Reset new floor input for new entry
            setIsCreatingNewFloor(true); // Enable new floor creation
        } else {
            setFloor(selectedFloor);
            setNewFloor(''); // Reset new floor input
            setIsCreatingNewFloor(false); // Disable new floor creation
            onSelectionChange({ client, project, floor: selectedFloor });
        }
    };

    const handleNewFloorChange = (event) => {
        const floorNumber = event.target.value;
        if (!Number.isInteger(Number(floorNumber))) {
            setMessage('Floor must be an integer');
        } else {
            setMessage('');
            setNewFloor(floorNumber);
            onSelectionChange({ client, project, floor: floorNumber });
        }
    };

    const handleElementChange = (event) => {
        const elementName = event.target.value;
        const elementValue=elements[elementName];
        debugger;
        setElement(elementName);
        setObject('');
        onSelectionChange({ client, project, floor: newFloor || floor, element: elementValue });
    };

    const handleObjectChange = (event) => {
        const objectName = event.target.value;
        const objectValue=objects[objectName];
        const elementValue=elements[element];

        setObject(objectName);
        onSelectionChange({ client, project, floor: newFloor || floor, element:elementValue, object: objectValue });
    };

    return (
        <div>
            <div>
                <label>Client:</label>
                <input
                    type="text"
                    value={client}
                    onChange={handleClientChange}
                    list="client-list"
                />
                <datalist id="client-list">
                    {clients.map((client) => (
                        <option key={client} value={client} />
                    ))}
                </datalist>
            </div>
            <div>
                <label>Project:</label>
                <input
                    type="text"
                    value={project}
                    onChange={handleProjectChange}
                    list="project-list"
                    disabled={!client}
                />
                <datalist id="project-list">
                    {projects.map((project) => (
                        <option key={project} value={project} />
                    ))}
                </datalist>
            </div>
            <div>
                <label>Floor:</label>
                <select
                    value={isCreatingNewFloor ? 'createNew' : floor}
                    onChange={handleFloorChange}
                    disabled={!project}
                >
                    <option value="">Select Floor</option>
                    {floors.map((floor) => (
                        <option key={floor} value={floor}>{floor}</option>
                    ))}
                    <option value="createNew">Create New Floor</option>
                </select>
                {isCreatingNewFloor && (
                    <div>
                        <label>New Floor Number:</label>
                        <input
                            type="number"
                            value={newFloor}
                            onChange={handleNewFloorChange}
                        />
                    </div>
                )}
            </div>
            <div>
                <label>Element:</label>
                <select
                    value={element}
                    onChange={handleElementChange}
                    disabled={!floor && !newFloor}
                >
                    <option value="">Select Element</option>
                    {Object.keys(elements).map((elementKey) => (
                        <option key={elementKey} value={elementKey}>{elements[elementKey]}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Object:</label>
                <select
                    value={object}
                    onChange={handleObjectChange}
                    disabled={!element}
                >
                    <option value="">Select Object</option>
                    {Object.keys(objects).map((objectKey) => (
                        <option key={objectKey} value={objectKey}>{objects[objectKey]}</option>
                    ))}
                </select>
            </div>
            {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
    );
};

export default EditableHierarchySelector;
