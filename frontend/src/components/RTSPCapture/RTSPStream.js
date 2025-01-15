import React, { useEffect, useRef } from 'react'

// Assuming you're using WebSocket to fetch RTSP stream from your backend
const RTSPStream = () => {
  const canvasRef = useRef(null)
  const wsUrl = `ws://${window.location.hostname}:3000/api/stream` // WebSocket URL

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const player = new WebSocket(wsUrl)

    player.binaryType = 'arraybuffer' // WebSocket type

    player.onmessage = (event) => {
      const data = new Uint8Array(event.data)
      const image = new Image()
      const blob = new Blob([data], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      image.src = url

      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
      }
    }

    player.onopen = () => {
      console.log('WebSocket connection opened.')
    }

    player.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      if (player.readyState === WebSocket.OPEN) {
        player.close()
      }
    }
  }, [wsUrl])

  return (
    <div>
      <h2>RTSP Stream</h2>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{ border: '1px solid black' }}
      />
    </div>
  )
}

export default RTSPStream
