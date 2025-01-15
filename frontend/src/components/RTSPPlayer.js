import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { fetchSnapshot } from "../api/streamApi";

const RTSPPlayer = ({ selectedCamera, showLiveRtsp }) => {
  const [imageSrc, setImageSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [intervalDuration, setIntervalDuration] = useState(10); // Interval duration in seconds
  const { router_ip, RTSP_port, username, password, camera_name, HTTP_port } =
    selectedCamera;

  // debugger;
  const fetchImage = async () => {
    if (!showLiveRtsp) return;
    const camera = {
      rtsp_url: `rtsp://${username}:${password}@${router_ip}:${RTSP_port}/`,
      http_url: `http://${router_ip}:${HTTP_port}/`,
    };
    try {
      setError("");
      const response = await fetchSnapshot(selectedCamera)

      setImageSrc(response);
      setError(null); // Clear any previous errors on successful fetch
    } catch (error) {
      setError(error.message);
      setImageSrc(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    const startFetching = () => {
      fetchImage();
      interval = setInterval(fetchImage, intervalDuration * 1000);
    };

    startFetching();

    // Cleanup the interval on component unmount or when selectedCamera changes
    return () => clearInterval(interval);
  }, [intervalDuration, selectedCamera, showLiveRtsp]);

  const handleIntervalChange = (event) => {
    setIntervalDuration(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <h3 className="mt-4 mb-2">RTSP Camera Viewer ({camera_name}) </h3>
      {/* <h3>{camera_name}</h3> */}
      <Stack
        direction="horizontal"
        className="form-group"
        className="mb-2"
        gap={3}
      >
        <label htmlFor="intervalRange">
          Fetch Interval Duration (seconds):{" "}
        </label>
        <input
          type="range"
          id="intervalRange"
          min="1"
          max="60"
          value={intervalDuration}
          onChange={handleIntervalChange}
        />
        <span>{intervalDuration} seconds</span>
      </Stack>
      <div className="camera-container">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Camera Snapshot"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              backgroundColor: "black", // Background to handle letterboxing/pillarboxing
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RTSPPlayer;
