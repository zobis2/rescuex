import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import DynamicTable from './DynamicTable'; // Import the DynamicTable component
import { enqueueSnackbar, useSnackbar } from 'notistack';

const TemplateForm = () => {
    const { enqueueSnackbar } = useSnackbar(); // Use Snackbar for notifications
    const [placeholders, setPlaceholders] = useState([]);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [totalData, setTotalData] = useState(null);
    const [missingPlaceholders, setMissingPlaceholders] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [projectImages, setProjectImages] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // enqueueSnackbar('טוען פרויקטים והצבות', { variant: 'info' });

            try {
                const [placeholdersResponse, projectsResponse] = await Promise.all([
                    axios.get('/api/placeHolder/download-template'),
                    axios.get('/api/projects/get'),
                ]);

                setPlaceholders(placeholdersResponse.data.placeholders);
                setProjects(projectsResponse.data);
                // enqueueSnackbar('Data loaded successfully!', { variant: 'success' });
            } catch (error) {
                console.error('Error fetching data:', error);
                // enqueueSnackbar('Failed to load data.', { variant: 'error' });
            } finally {
                setLoading(false);
                setIsDataLoaded(true);
            }
        };

        fetchData();
    }, []);

    const handleProjectChange = async (e) => {
        const projectId = e.target.value;
        if (projectId.length === 0) {
            setSelectedProject(null);
            return;
        }

        const project = projects.find((proj) => proj.id === projectId);
        setSelectedProject(project);

        if (project) {
            // enqueueSnackbar('טוען תמונות', { variant: 'info' });
            try {
                const response = await axios.post('/api/projects/get-images', project);
                setProjectImages(response.data);
                // enqueueSnackbar('טעינת תמונות התבצע בהצלחה', { variant: 'success' });
            } catch (error) {
                console.error('Error fetching project images:', error);
                // enqueueSnackbar('Failed to load project images.', { variant: 'error' });
            }
        }

        const preFilledData = {};
        const missing = [];

        placeholders.forEach((placeholder) => {
            if (project[placeholder] !== undefined) {
                preFilledData[placeholder] = project[placeholder];
            } else {
                missing.push(placeholder);
            }
        });
        setMissingPlaceholders(missing);
        setFormData(preFilledData);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        const cleanedName = name.replace(/[{}]/g, '');
        const inputData = files ? files[0] : value;

        setFormData((prevData) => ({ ...prevData, [cleanedName]: inputData }));
    };

    const handleTableChange = (updatedTable) => {
        setTableData(updatedTable); // Update table data when it changes
    };

    const generateDocx = async () => {
        setLoading(true);
        enqueueSnackbar('מייצר מסמך', { variant: 'info' });

        const form = new FormData();
        if (imageFile) {
            form.append('image', imageFile);
        }

        Object.entries(formData).forEach(([key, value]) => {
            form.append('fields', JSON.stringify({ key, value }));
        });

        const total = {
            name: "סה״כ",
            size: totalData.totalSize,
            coefficient: "",
            percentage: "100",
            cumulativeVolume1to5: totalData.totalRainfall1to5,
            cumulativeVolume1to50: totalData.totalRainfall1to50,
        };
        const newTable = [...tableData, total];

        projectImages.forEach((image) => {
            const placeholderKey = `img_${image.filename.split('.')[0].toLowerCase()}`;
            if (placeholders.includes(placeholderKey)) {
                form.append(placeholderKey, image.base64);
            }
        });

        form.append('table_nagar', JSON.stringify(newTable));
        form.append('projectDetails', JSON.stringify(selectedProject));


        try {
            const response = await axios.post('/api/placeHolder/generate-docx', form, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'modified.docx');
            document.body.appendChild(link);
            link.click();
            enqueueSnackbar('מסמך יוצר בהצלחה והועלה לדרייב', { variant: 'success' });
        } catch (error) {
            console.error('Error generating DOCX:', error);
            enqueueSnackbar('Failed to generate DOCX.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredPlaceholders = placeholders.filter(
        (ph) => !ph.startsWith('table_') && !ph.startsWith('img_') && !missingPlaceholders.includes(ph)
    );

    return (
        <div dir={"rtl"} className="container">
            <h1 className="title">עריכת טמפלייט</h1>

            {loading && <div className="notification is-info">טוען פרטים</div>}

            {!isDataLoaded ? (
                <div className="notification is-info">Loading placeholders and projects...</div>
            ) : (
                <>
                    <div className="field">
                        <label className="label">בחר פרויקט:</label>
                        <div className="control">
                            <div className="select">
                                <select onChange={handleProjectChange}>
                                    <option value="">Select Project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.street}, {project.city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {projectImages.length <= 0 && <div className="notification is-info">טוען פרטים על הפרויקט</div>}

                    {selectedProject && (
                        <div>
                            <DynamicTable
                                project={selectedProject}
                                onTableChange={handleTableChange}
                                onTotalChange={(total) => setTotalData(total)} // Update total data when it changes
                            />

                            {projectImages.length > 0 && (
                                <div>
                                    <h2 className="title is-4">תמונות - GIS - של הפרויקט</h2>
                                    אם קיים ✅ אם לא ❌
                                    {projectImages.map((image) => (
                                        <div key={image.id} className="box" style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center'
                                        }}>
                                            <h3 className="subtitle">{image.filename.split('.')[0].toString().toLowerCase()}</h3>
                                            <h2>{image.filename}</h2>
                                            {image.width} x {image.height}
                                            <img
                                                src={`data:${image.mimeType};base64,${image.base64}`}
                                                alt={image.name}
                                                style={{
                                                    width: image.width ? `${image.width / 5}px` : '400px',
                                                    height: image.height ? `${image.height / 5}px` : '300px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            <span>{placeholders.includes(`img_${image.filename.split('.')[0].toString().toLowerCase()}`) ? '✅' : '❌'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {projectImages.length > 0 && filteredPlaceholders.length > 0 && (
                                <div>
                                    <h2 className="title is-4">מידע שנשאב מהפרויקט</h2>
                                    {filteredPlaceholders.reduce((acc, ph, index) => {
                                        if (index % 3 === 0) acc.push([]); // Start a new group every 3 fields
                                        acc[acc.length - 1].push(
                                            <div className="field" key={index}>
                                                {ph.startsWith('img_') ? (
                                                    <>
                                                        <label className="label">{ph}:</label>
                                                        <input
                                                            type="file"
                                                            name={ph}
                                                            className="input"
                                                            onChange={handleInputChange}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="label">{ph}:</label>
                                                        <input
                                                            type="text"
                                                            name={ph}
                                                            value={formData[ph] || ''}
                                                            className="input"
                                                            onChange={handleInputChange}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        );
                                        return acc;
                                    }, []).map((group, groupIndex) => (
                                        <div className="field is-grouped" key={groupIndex}>
                                            {group}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {missingPlaceholders.length > 0 && (
                                <div>
                                    <h2 className="title is-4">מידע למלא</h2>
                                    {missingPlaceholders.filter(
                                        (ph) => !ph.startsWith('table_') && !ph.startsWith('img_')
                                    ).reduce((acc, ph, index) => {
                                        if (index % 3 === 0) acc.push([]); // Start a new group every 3 fields
                                        acc[acc.length - 1].push(
                                            <div className="field" key={index}>
                                                <label className="label">{ph}:</label>
                                                <input
                                                    type="text"
                                                    name={ph}
                                                    value={formData[ph] || ''}
                                                    className="input"
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        );
                                        return acc;
                                    }, []).map((group, groupIndex) => (
                                        <div className="field is-grouped" key={groupIndex}>
                                            {group}
                                        </div>
                                    ))}
                                </div>
                            )}


                            <div className="field">
                                <label className="label">העלאת תמונה</label>
                                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="input"/>
                            </div>

                            <button onClick={generateDocx} className="button is-primary" disabled={loading}>
                                {loading ? 'מייצר' : 'צור מסמך'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TemplateForm;
