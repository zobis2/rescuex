import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import {REACT_APP_GOOGLE_MAPS_API_KEY} from "../../utils/consts";

const LocationPicker = ({ onLocationSelect }) => {
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [center, setCenter] = useState({ lat: 31.7683, lng: 35.2137 }); // Default center

    const containerStyle = {
        width: "100%",
        height: "400px",
        margin: "10px 0",
    };



    const handlePlaceChanged = () => {
        const place = searchBox?searchBox.getPlace():null;
        debugger;
        if (place && place.geometry) {
            const { lat, lng } = place.geometry.location;
            const position = { lat: lat(), lng: lng() };
            setMarkerPosition(position);
            map.panTo(position);
            setCenter(position); // Update center state

            map.setZoom(15); // Add this line
            onLocationSelect( place.geometry.location);
        }
    };

    return (
        <LoadScript googleMapsApiKey={REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
            <div style={{ direction: "rtl", textAlign: "center" }}>
                <div>
                    {markerPosition&& <div>

                        {JSON.stringify(markerPosition)}
                    </div>}
                </div>
                <Autocomplete
                    onLoad={(autocomplete) => setSearchBox(autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                >
                    <input
                        type="text"
                        placeholder="חפש מיקום..."
                        style={{
                            width: "90%",
                            padding: "10px",
                            marginBottom: "10px",
                            direction: "rtl",
                            textAlign: "right",
                            boxSizing: "border-box",
                        }}
                    />
                </Autocomplete>

                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    mapTypeId="roadmap" // Add this line

                    zoom={10}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                    onClick={(e) => {
                        const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                        setMarkerPosition(position);
                        onLocationSelect(`Lat: ${position.lat}, Lng: ${position.lng}`);
                    }}
                >
                    {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
            </div>
        </LoadScript>
    );
};

export default LocationPicker;
