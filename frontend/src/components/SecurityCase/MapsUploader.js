import React, { useState } from "react";

const MapsUploader = ({ maps, onSave }) => {
    const [uploadedMaps, setUploadedMaps] = useState(maps || []);

    const handleFileUpload = (e, mapName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const updatedMaps = uploadedMaps.map((map) =>
                    map.name === mapName ? { ...map, image: reader.result } : map
                );
                setUploadedMaps(updatedMaps);
                if (onSave) onSave(updatedMaps);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="maps-uploader has-text-centered" style={{ direction: "rtl" }}>
            <h2 className="has-text-centered">מפות המתחם</h2>
            {uploadedMaps.map((map, index) => (
                <div key={index}>
                    <h3 className="maps-uploader has-text-centered">{map.name}</h3>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleFileUpload(e, map.name)}
                    />
                    {map.image && (
                        <div>
                            <img src={map.image} alt={`מפת ${map.name}`}
                                 style={{ width: "80%", maxWidth: "300px", margin: "10px auto" }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MapsUploader;
