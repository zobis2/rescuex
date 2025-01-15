import React, { useEffect, useState } from 'react'
import axios from '../../axiosConfig'
import moment from 'moment'
import DateTimePicker from './DateTimePicker'
import VideoToOrthoPhoto from './VideoToOrthoPhoto'
import { S3_BUCKET_NAME } from '../../utils/consts'
import { listPrefixFiles } from '../../api/folderApi'

// Component to list available RTSP videos in the S3 bucket
const ListRTSPVideos = ({ client, project, cameraName, onVideoSelect }) => {
  const [videos, setVideos] = useState([])
  // debugger
  const [loading, setLoading] = useState(true)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [selectedVideoKey, setSelectedVideoKey] = useState(null)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [expandedDates, setExpandedDates] = useState({})
  const toggleDate = (date) => {
    setExpandedDates((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }))
  }
  useEffect(() => {
    setStartTime(moment().subtract(10, 'days').toDate())
  }, [cameraName])
  useEffect(() => {
    // Fetch the list of RTSP videos from S3
    const fetchVideos = async () => {
      try {
        const prefix = `rtsp/${client}/${project}/${cameraName}`

        const prefixFiles = await listPrefixFiles(S3_BUCKET_NAME, prefix)
        debugger

        // Parse the files and extract the required details
        let parsedVideos = prefixFiles.map((file) => {
          const { Key, Size } = file
          const [startDateStr, endDateStr] = Key.match(/\d{8}T\d{6}/g)

          const startDate = moment(startDateStr, 'YYYYMMDDTHHmmss')
          const endDate = moment(endDateStr, 'YYYYMMDDTHHmmss')
          // video start 2024-08-12 1935 , end 2024-08-12 1950
          // react startTimn 2024-08-12 10:15:33Z , endtime 2024-08-12 19:49:33Z
          // --- i did a convert.... they are now the same ....
          if (
            startDate >= startTime &&
            endDate <= startDate &&
            endDate <= endTime
          ) {
            ///pass video
          }
          const duration = moment.duration(endDate.diff(startDate)).humanize()
          const date = startDate.format('YYYY-MM-DD')
          return {
            date,
            key: Key,
            startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
            endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
            duration,
            size: `${Size} MB`,
          }
        })
        // debugger;
        parsedVideos = parsedVideos.filter((video) => {
          // Filter videos by selected date range
          return moment(video.startDate).isBetween(
            startTime,
            endTime,
            null,
            '[]'
          )
        })
        setVideos(parsedVideos)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching RTSP videos:', error)
        setLoading(false)
      }
    }
    fetchVideos()

    // Refetch the list every 2 minutes
    const interval = setInterval(fetchVideos, 12000) // 120000ms = 2 minutes
    return () => clearInterval(interval)
  }, [client, project, cameraName, startTime, endTime])

  if (loading) return <p>Loading videos...</p>
  // Update onVideoSelect to track the selected video
  const handleVideoSelect = (video) => {
    // Check if a different video is already selected
    if (selectedVideoKey && selectedVideoKey !== video.key) {
      // Ask for confirmation
      const confirmChange = window.confirm(
        'A video is already selected. Do you want to select another one?'
      )
      if (!confirmChange) return // If the user cancels, do nothing
    }

    onVideoSelect(null) // Reset the selected video in the parent component
    setCurrentVideo(video)
    setSelectedVideoKey(video.key)
    onVideoSelect(video) // Select the new video
  }
  // debugger;
  const groupedVideos = videos.reduce((acc, video) => {
    if (!acc[video.date]) {
      acc[video.date] = []
    }
    acc[video.date].push(video)
    return acc
  }, {})
  return (
    <div>
      <h3>Available Videos in Dates</h3>
      <DateTimePicker
        onDateChange={({ startDate, endDate }) => {
          setStartTime(startDate)
          setEndTime(endDate)
        }}
      />
      {/*<ul>*/}
      {/*    {videos.map((video) => (*/}
      {/*        <li key={video.key}>*/}
      {/*            <button*/}
      {/*                onClick={() => handleVideoSelect(video)}*/}
      {/*                style={{*/}
      {/*                    backgroundColor: selectedVideoKey === video.key ? 'lightblue' : 'initial' // Highlight selected video*/}
      {/*                }}*/}
      {/*            >*/}
      {/*                {`Start: ${video.startDate}, End: ${video.endDate}, Duration: ${video.duration}, Size: ${video.size}`}*/}
      {/*            </button>*/}
      {/*        </li>*/}
      {/*    ))}*/}
      {/*</ul>*/}
      {Object.keys(groupedVideos).map((date) => (
        <div key={date}>
          <h4 onClick={() => toggleDate(date)} style={{ cursor: 'pointer' }}>
            {date} {expandedDates[date] ? '-' : '+'}
          </h4>
          {expandedDates[date] && (
            <ul>
              {groupedVideos[date].map((video) => (
                <li key={video.key}>
                  <button
                    onClick={() => handleVideoSelect(video)}
                    style={{
                      backgroundColor:
                        selectedVideoKey === video.key
                          ? 'lightblue'
                          : 'initial', // Highlight selected video
                    }}
                  >
                    {`Start: ${video.startDate}, End: ${video.endDate}, Duration: ${video.duration}, Size: ${video.size}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <div>{currentVideo && <VideoToOrthoPhoto video={currentVideo} />}</div>
    </div>
  )
}

export default ListRTSPVideos
