import React, { useState } from 'react'
import DateTimePicker from './DateTimePicker'
import ListRTSPVideos from './ListRTSPVideos'
import VideoPlayer from './VideoPlayer'
import HierarchySelector from '../HierarchySelector'
import { S3_BUCKET_NAME } from '../../utils/consts'
import { getFileJson } from '../../api/folderApi'
import { saveRtspStream } from '../../api/streamApi'
import RTSPLive from './RTSPLive'
import RTSPStream from './RTSPStream'

// Main component to manage RTSP stream processing and video playback
const RTSPProjectPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [hierarchy, setHierarchy] = useState({})
  const [cameraMetadata, setCameraMetadata] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [message, setMessage] = useState('')

  // Function to fetch camera metadata when hierarchy changes
  const fetchCameraMetaData = async (newHierarchy) => {
    if (newHierarchy.client && newHierarchy.project) {
      const key = `clients/${newHierarchy.client}/${newHierarchy.project}/camera_metadata.json`

      try {
        const response = await getFileJson(S3_BUCKET_NAME, key)
        setCameraMetadata(response.cameras_list)
        setSelectedCamera(null) // Reset camera selection if hierarchy changes
      } catch (error) {
        console.error('Error fetching camera metadata', error)
        setMessage('Error fetching camera metadata')
      }
    }
  }

  // Function to capture RTSP streams based on user selection
  const captureRTSPStream = async () => {
    if (!hierarchy.client || !hierarchy.project || !selectedCamera) {
      setMessage('Please complete the hierarchy selection')
      return
    }
    selectedCamera.client = hierarchy.client
    selectedCamera.project = hierarchy.project
    selectedCamera.start_time = startTime
    selectedCamera.end_time = endTime
    selectedCamera.bucket_name = S3_BUCKET_NAME

    setMessage('Processing RTSP stream...')
    try {
      const { links } = await saveRtspStream(selectedCamera)
      setMessage(
        `RTSP stream processed successfully , found : ${links.length} links , now capturing them...`
      )
    } catch (error) {
      console.error('Error processing RTSP stream:', error)
      setMessage('Error processing RTSP stream')
    }
  }

  // Handle camera selection change
  const handleCameraSelection = (event) => {
    const cameraId = event.target.value
    const camera = cameraMetadata.find(
      (cam) => cam.camera_id.toString() === cameraId
    )
    setSelectedCamera(camera)
  }

  return (
    <div>
      <div>
        <RTSPLive></RTSPLive>
      </div>
      <h1>RTSP Project Page</h1>

      <HierarchySelector
        onSelectionChange={(newHierarchy) => {
          setHierarchy(newHierarchy)
          fetchCameraMetaData(newHierarchy)
        }}
      />
      <div>
        {cameraMetadata && cameraMetadata.length > 0 && (
          <div>
            <label>Select Camera:</label>
            <select onChange={handleCameraSelection}>
              <option value="">Select Camera</option>
              {cameraMetadata.map((camera) => (
                <option key={camera.camera_id} value={camera.camera_id}>
                  {camera.camera_name || `Camera ${camera.camera_id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div id={'capture'}>
        <DateTimePicker
          onDateChange={({ startDate, endDate }) => {
            setStartTime(startDate)
            setEndTime(endDate)
          }}
        />
      </div>

      {selectedCamera && hierarchy.client && hierarchy.project && (
        <div>
          {message && (
            <h3>
              <p>{message}</p>
            </h3>
          )}

          <button onClick={captureRTSPStream}>Capture RTSP Stream</button>

          <ListRTSPVideos
            cameraName={selectedCamera.camera_name}
            client={hierarchy.client}
            project={hierarchy.project}
            onVideoSelect={setSelectedVideo}
          />
        </div>
      )}
      {/*{JSON.stringify(selectedVideo, null, 2)}*/}
      {selectedVideo && <VideoPlayer s3Key={selectedVideo.key} />}
    </div>
  )
}

export default RTSPProjectPage
