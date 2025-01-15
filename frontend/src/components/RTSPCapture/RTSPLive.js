import React, { useEffect, useRef, useState } from 'react'
import axios from '../../axiosConfig'

const RTSPLive = () => {
  const [uuid, setUuid] = useState(null)
  const [rtspUrl, setRtspUrl] = useState('rtsp://62.109.19.230:554/iloveyou')
  const [frameRate, setFrameRate] = useState(25)
  const [jpegQuality, setJpegQuality] = useState(100)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5 // Maximum retry count
  const imgRef = useRef(null) // Add this line to create a ref for the img tag
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const flaskHost =
    window.location.host === 'web.atom.construction'
      ? 'https://web.atom.construction'
      : 'http://localhost:5001'
  useEffect(() => {
    // Check every 5 seconds if the image is still updating
    const checkInterval = setInterval(() => {
      const currentTime = Date.now()
      if (currentTime - lastUpdated > 5000 && imgRef.current) {
        // 5-second threshold
        // If the image has not updated in the last 5 seconds, refetch
        imgRef.current.src = `${flaskHost}/flask/rtsp/stream/${uuid}?timestamp=${new Date().getTime()}`
      }
    }, 5000)

    return () => clearInterval(checkInterval) // Cleanup the interval on unmount
  }, [lastUpdated, uuid])
  const handleImageLoad = () => {
    setLastUpdated(Date.now())
  }
  const sendRTSPRequest = async () => {
    try {
      const response = await axios.get(
        `/flask/rtsp/start?url=${encodeURIComponent(rtspUrl)}`
      )
      debugger
      if (response.status === 200) {
        setUuid(response.data.uuid)
      } else {
        handleRetry() // Retry if the status is not 200
      }
    } catch (error) {
      console.error('Error fetching UUID:', error)
      handleRetry() // Retry on error
    }
  }

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(retryCount + 1)
      setTimeout(() => sendRTSPRequest(), 2000) // Retry after 2 seconds
    } else {
      setErrorMessage('Failed to get UUID after multiple attempts.')
    }
  }

  const adjustStreamSettings = async () => {
    if (uuid) {
      try {
        await axios.get(
          `/flask/rtsp/adjust/${uuid}?frame_rate=${frameRate}&jpeg_quality=${jpegQuality}`
        )
      } catch (error) {
        console.error('Error adjusting stream settings:', error)
      }
    }
  }

  // Start RTSP Feed and get UUID
  const startRTSPFeed = async () => {
    if (rtspUrl) {
      setRetryCount(0)
      await sendRTSPRequest()
    }
  }

  return (
    <div>
      <div>
        <label>RTSP URL:</label>
        <input
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="Enter RTSP URL"
        />
      </div>

      <div>
        <label>Frame Rate:</label>
        <input
          type="number"
          value={frameRate}
          onChange={(e) => setFrameRate(e.target.value)}
          min={1}
          max={30}
        />

        <label>JPEG Quality:</label>
        <input
          type="number"
          value={jpegQuality}
          onChange={(e) => setJpegQuality(e.target.value)}
          min={1}
          max={100}
        />

        <button onClick={adjustStreamSettings}>Adjust Stream Settings</button>
      </div>

      <div>
        <button onClick={startRTSPFeed}>Start RTSP Feed</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>

      <div>
        {uuid ? (
          <div>
            {flaskHost}
            <img
              ref={imgRef} // Attach the ref here
              onLoad={handleImageLoad} // Trigger when image loads
              src={`${flaskHost}/flask/rtsp/stream/${uuid}`}
              alt="RTSP Stream"
              style={{ width: '640px', height: '480px' }}
            />
          </div>
        ) : (
          <p>No stream available</p>
        )}
      </div>
    </div>
  )
}

export default RTSPLive
