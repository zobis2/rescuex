import React from "react";
import GoogleMapReact from "google-map-react";

const Marker = ({ text }) => <div style={{ color: "red" }}>{text}</div>;

const MapsViewer = ({ maps }) => {
    const defaultMapProps = {
        center: { lat: 32.0853, lng: 34.7818 },
        zoom: 12,
    };

    return (
        <div className="maps-viewer" style={{ direction: "rtl" }}>
            <h2>מפות המתחם</h2>
            {maps.map((map, index) => (
                <div key={index} style={{ margin: "20px 0" }}>
                    <h3>{map.name}</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <GoogleMapReact
                            bootstrapURLKeys={{ key: "YOUR_GOOGLE_MAPS_API_KEY" }}
                            defaultCenter={map.center || defaultMapProps.center}
                            defaultZoom={map.zoom || defaultMapProps.zoom}
                        >
                            {map.markers &&
                                map.markers.map((marker, i) => (
                                    <Marker
                                        key={i}
                                        lat={marker.lat}
                                        lng={marker.lng}
                                        text={marker.text}
                                    />
                                ))}
                        </GoogleMapReact>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MapsViewer;
