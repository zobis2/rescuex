import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import fieldConfig from './fieldConfig.json'; // Import the field config

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState(initializeNewProject());
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [coordinates, setCoordinates] = useState({ x: '', y: '' });
    const [polygonInfo, setPolygonInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null); // State for notifications

    // Initialize a new project with empty fields
    function initializeNewProject() {
        return Object.fromEntries(Object.keys(fieldConfig).map((key) => [key, '']));
    }

    // Fetch all projects from the backend
    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects/get');
            setProjects(response.data);
            setNotification({ message: 'טעינת פרויקט בוצעה בהצלחה', type: 'success' });
        } catch (error) {
            setNotification({ message: 'טעינת פרויקט נכשלה', type: 'error' });
            console.error('Error fetching projects:', error);
        }
    };

    // Function to query backend with coordinates and get polygon info
    const fetchPolygonInfo = async () => {
        if (!coordinates.x || !coordinates.y) return;

        try {
            const response = await axios.post('/api/projects/polygon/query', {
                coordinates: [parseFloat(coordinates.x), parseFloat(coordinates.y)],
            });
            const polygonInfo = response.data;

            setPolygonInfo(polygonInfo);
            if (polygonInfo && polygonInfo.Polygon_Na) {
                setNotification({ message: `הפוליגון נמצא ב- ${polygonInfo.Polygon_Na}`, type: 'success' });
            }
        } catch (error) {
            setNotification({ message: 'לא הצלחנו למצוא פוליגון', type: 'error' });
            console.error('Error fetching polygon info:', error);
        }
    };

    // Load projects when the component mounts
    useEffect(() => {
        fetchProjects();
    }, []);

    // Handle coordinate input change and fetch polygon info
    useEffect(() => {
        fetchPolygonInfo();
    }, [coordinates]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({ ...prev, [name]: value }));
    };

    // Handle input changes for x and y coordinates
    const handleCoordinateChange = (e) => {
        const { name, value } = e.target;
        setCoordinates((prev) => ({ ...prev, [name]: value }));
    };

    // Generate the ID based on number, city, and street
    const generateId = (project) =>
        `${project.number}-${project.city}-${project.street}`;

    // Handle form submission for adding or updating a project
    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            const projectWithId = {
                ...newProject,
                id: generateId(newProject),
            };

            if (editingProjectId) {
                await axios.put(`/api/projects/${newProject.rowNumber}`, { values: projectWithId });
                setProjects((prev) =>
                    prev.map((project) =>
                        project.rowNumber === newProject.rowNumber ? projectWithId : project
                    )
                );
                setNotification({ message: 'פרויקט עודכן בהצלחה', type: 'success' });
            } else {
                await axios.post('/api/projects', { values: projectWithId });
                setProjects((prev) => [...prev, projectWithId]);
                setNotification({ message: 'פרויקט נוסף בהצלחה', type: 'success' });
            }

            setNewProject(initializeNewProject());
            setEditingProjectId(null);
        } catch (error) {
            setNotification({ message: 'שגיאה בשמירת פרויקט', type: 'error' });
            console.error('Error saving project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Populate the form with the selected project's data for editing
    const handleEditProject = (project) => {
        setNewProject(project);
        setEditingProjectId(project.rowNumber);
    };

    // Handle canceling the edit
    const handleCancelEdit = () => {
        setNewProject(initializeNewProject());
        setEditingProjectId(null);
    };

    return (
        <div className="container" style={{direction: 'rtl'}}>
            <h1 className="title">ניהול פרויקטים</h1>

            {notification && (
                <div className={`notification is-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* List of Projects */}
            <ul>
                {projects.map((project, index) => (
                    <li key={index}>
                        {project.rowNumber}: {project.street}, {project.city} - {project.number}
                        <button
                            className={`button ${editingProjectId === project.rowNumber ? 'is-primary' : 'is-light'}`}
                            onClick={() => handleEditProject(project)}
                        >
                            ערוך
                        </button>
                    </li>
                ))}
            </ul>

            {/* Form to Add or Edit a Project */}
            <h2 className="subtitle">{editingProjectId ? 'עריכת פרויקט' : 'הוספת פרויקט חדש'}</h2>

            <div className="field is-grouped">
                <div className="control">
                    <label className="label">X Coordinate:</label>
                    <input
                        type="number"
                        name="x"
                        value={coordinates.x}
                        onChange={handleCoordinateChange}
                        className="input"
                    />
                </div>
                <div className="control">
                    <label className="label">Y Coordinate:</label>
                    <input
                        type="number"
                        name="y"
                        value={coordinates.y}
                        onChange={handleCoordinateChange}
                        className="input"
                    />
                </div>
            </div>

            {polygonInfo && (
                <div>
                    <h3>Polygon Information:</h3>
                    <pre>{JSON.stringify(polygonInfo, null, 2)}</pre>
                </div>
            )}
            {Object.entries(fieldConfig)
                .filter(([key]) => key !== 'id')
                .reduce((acc, [key, config], index) => {
                    if (index % 3 === 0) acc.push([]); // Start a new group every 3 fields
                    acc[acc.length - 1].push(
                        <div className="control" key={key}>
                            <label className="label">{config.label}</label>
                            <input
                                type="text"
                                name={config.key}
                                placeholder={config.label}
                                value={newProject[config.key] || ''}
                                onChange={handleChange}
                                disabled={
                                    editingProjectId && ['city', 'street', 'number'].includes(config.key)
                                }
                                className="input"
                            />
                        </div>
                    );
                    return acc;
                }, []).map((group, index) => (
                    <div className="field is-grouped" key={index}>
                        {group}
                    </div>
                ))}

            <div style={{marginTop: '10px'}}>
                <button
                    className={`button is-success ${isLoading ? 'is-loading' : ''}`}
                    onClick={handleFormSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (editingProjectId ? 'מעדכן פרויקט...' : 'הוספת פרויקט') : (editingProjectId ? 'עדכן פרויקט' : 'הוסף פרויקט')}
                </button>

                {editingProjectId && (
                    <button
                        className="button is-danger"
                        onClick={handleCancelEdit}
                    >
                        בטל עריכה
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectManager;
