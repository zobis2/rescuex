import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {REACT_APP_GOOGLE_MAPS_API_KEY} from "../../utils/consts";

const containerStyle = {
    width: "100%",
    height: "400px",
};


const LocationEditorWithMap = ({ center,title, initialData = [], onSave,initialCenter }) => {
    const [mapCenter, setMapCenter] = useState(initialCenter || center);
    const defaultCenter=mapCenter;

    const [locations, setLocations] = useState(initialData);
    const [currentLocation, setCurrentLocation] = useState({
        name: "",
        description: "",
        lat: null,
        lng: null,
    });
    const googleMapsApiKey=REACT_APP_GOOGLE_MAPS_API_KEY;
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey // Replace with your API key
    });

    const handleMapClick = (event) => {
        setCurrentLocation((prev) => ({
            ...prev,
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        }));
    };

    const handleAddLocation = () => {
        if (!currentLocation.lat || !currentLocation.lng || !currentLocation.name) return;
        const newLocation = { ...currentLocation };
        const updatedLocations = [...locations, newLocation];
        setLocations(updatedLocations);
        onSave(updatedLocations);
        setCurrentLocation({ name: "", description: "", lat: null, lng: null });
    };

    const handleDeleteLocation = (index) => {
        const updatedLocations = locations.filter((_, i) => i !== index);
        setLocations(updatedLocations);
        onSave(updatedLocations);
    };

    return (
        <div className="location-editor has-text-centered" style={{ direction: "rtl" }}>
            <h2>{title}</h2>
            <div>
                <div className="field">
                    <div className="control">
                <input
                    type="text"
                    placeholder="שם המקום"
                    value={currentLocation.name}
                    onChange={(e) =>
                        setCurrentLocation((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input"
                />
                    </div>
                </div>
                <textarea
                    placeholder="תיאור המקום"
                    value={currentLocation.description}
                    onChange={(e) =>
                        setCurrentLocation((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="textarea"
                />
                <button onClick={handleAddLocation} className="button is-primary">
                    הוסף
                </button>
            </div>

            {/* Map */}
            {isLoaded ? (
                <div style={{ margin: "10px 0" }}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={defaultCenter}
                        zoom={17}
                        mapTypeId="roadmap" // Add this line

                        onClick={handleMapClick}
                    >
                        {/* Existing Markers */}
                        {locations.map((location, index) => (
                            <Marker
                                key={index}
                                position={{ lat: location.lat, lng: location.lng }}
                                label={location.name}
                            />
                        ))}
                        {/* Current Marker */}
                        {currentLocation.lat && currentLocation.lng && (
                            <Marker
                                position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                                label="מיקום נבחר"
                            />
                        )}
                    </GoogleMap>
                </div>
            ) : (
                <p>טוען מפה...</p>
            )}

            {/* Location List */}
            <ul>
                {locations.map((location, index) => (
                    <li key={index}>
                        <strong>{location.name}:</strong> {location.description} (
                        {location.lat}, {location.lng}){" "}
                        <button
                            onClick={() => handleDeleteLocation(index)}
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

export default LocationEditorWithMap;
