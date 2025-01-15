import React, { useState, useEffect } from 'react'
import axios from '../../axiosConfig'
import Accordion from 'react-bootstrap/Accordion'
import 'bootstrap/dist/css/bootstrap.min.css'
import { sleep } from '../Upload/utils'
import { getLogs } from '../../api/logsApi'

const LiveLogViewer = ({ bucketName, projectName, publicIp, instanceId }) => {
  debugger
  const [logStreams, setLogStreams] = useState([])
  const [fetching, setFetching] = useState(false)

  const fetchLogs = async (projectName) => {
    // if (fetching) return;  // Prevent concurrent fetches
    console.log(new Date(), 'fetchLogs')
    try {
      setFetching(true)
      const logStreamsData = await getLogs(projectName, instanceId, bucketName)
      setFetching(false)
      let someLive = false
      if (!logStreamsData || logStreamsData.length === 0) return

      const updatedLogStreams = logStreamsData.map((stream) => {
        debugger
        const status = stream.status
        const indicators = getIndicatorsForStream(stream.logs, stream.startTime)
        const lastLogTimestamp = stream.logs[stream.logs.length - 1]?.timestamp
        // debugger;
        const isLive =
          (status !== 'FAILED' && status !== 'SUCCEEDED') ||
          status === 'STARTING' ||
          status === 'RUNNABLE' ||
          status === 'RUNNING'
        // debugger;
        const isComplete = !isLive && status === 'SUCCEEDED' // If it's not live, we consider it complete
        // debugger

        if (!someLive && isLive) someLive = true
        return { ...stream, indicators, status, isLive, isComplete }
      })

      setLogStreams(updatedLogStreams)
      await sleep(25000)
      if (someLive) fetchLogs(projectName)
    } catch (error) {
      console.error('Error fetching logs', error)
      setFetching(false)
      fetchLogs(projectName)
    }
  }

  useEffect(() => {
    // debugger;
    fetchLogs(projectName) // Initial fetch started after projectname change
  }, [projectName])

  const getIndicatorsForStream = (logs, startTime) => {
    const indicators = {
      started: false,
      created: false,
      finished: false,
      ram: null,
      cpu: null,
      ended: false,
      error: null,
    }
    let startTimestamp = new Date(startTime)

    logs.forEach((log) => {
      const logTimestamp = new Date(log.timestamp)
      const timeElapsed = Math.floor(
        (logTimestamp - startTimestamp) / 1000 / 60
      ) // Time elapsed in minutes

      const message = log.message

      if (message.includes('Launching DroneYard')) {
        indicators.started = `Started ${timeElapsed}m`
      }
      if (message.includes('detect_features')) {
        indicators.created = `Creating Orthophoto ${timeElapsed}m`
      }
      if (message.includes('RAM:')) {
        const ramInfo = message.match(/RAM: (.*) Physical Memory/)
        if (ramInfo) indicators.ram = ramInfo[1]
      }
      if (message.includes('CPU:')) {
        const subString = message.indexOf('CPU:')
        const cpuInfo = message.substring(subString)
        if (cpuInfo) indicators.cpu = cpuInfo
      }
      if (
        message.includes(
          'process.log to s3://prod-drone-yard-droneyard-dronephotosbucket1549df6-1xcxnmmtvojj/'
        )
      ) {
        // debugger;
        indicators.ended = `Ended ${timeElapsed}m`
      }
      if (message.includes('odm_orthophoto.tif')) {
        indicators.finished = `Finished ${timeElapsed}m`
      }
      if (
        message.includes(
          'The program could not process this dataset using the current settings.'
        )
      ) {
        indicators.error = message
      }
    })

    return indicators
  }

  const formatTimestamp = (timestamp) => {
    const dateFormatted = new Date(timestamp).toLocaleString()
    // debugger;
    // console.log(dateFormatted);
    return dateFormatted.indexOf('1/1/1970') >= 0 ? 'NOW' : dateFormatted
  }

  return (
    <div>
      {fetching && <div>Fetching logs, please wait...</div>}
      {!fetching && <h2>Logs</h2>}

      <Accordion defaultActiveKey="0">
        {logStreams.map((logStream, index) => {
          const { isLive, indicators, status } = logStream
          const { started, created, finished, ram, cpu, ended, error } =
            indicators

          return (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                {logStream.logStreamName}
                {isLive ? (
                  <span className="badge bg-success ml-2">Live</span>
                ) : (
                  <div>
                    <span className="badge bg-secondary ml-2">Completed</span>
                    {status === 'FAILED' || (ended && !finished) ? (
                      <span className="badge bg-danger ml-2">Failed</span>
                    ) : (
                      <span className="badge bg-secondary ml-2">Succeed</span>
                    )}
                  </div>
                )}

                <span className="ml-3">
                  Started: {formatTimestamp(logStream.startTime)}
                </span>
                <span className="ml-3">
                  {isLive
                    ? 'Running '
                    : `Ended:  ${formatTimestamp(logStream.endTime)}`}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                {error && (
                  <span className="badge bg-danger ml-2">${error}</span>
                )}
                <div className="d-flex justify-content-between mb-3">
                  {ram && <div className="badge bg-info">RAM: {ram}</div>}
                  {cpu && <div className="badge bg-info"> {cpu}</div>}
                </div>
                <div className="progress mb-4">
                  <div
                    className={`progress-bar ${started ? 'bg-warning' : ''}`}
                    role="progressbar"
                    style={{ width: '33%' }}
                  >
                    {started || 'Pending Start'}
                  </div>
                  <div
                    className={`progress-bar ${created ? 'bg-orange' : ''}`}
                    role="progressbar"
                    style={{ width: '33%' }}
                  >
                    {created || 'Pending Creation'}
                  </div>

                  <div
                    className={`progress-bar ${finished ? 'bg-success' : ''}`}
                    role="progressbar"
                    style={{ width: '34%' }}
                  >
                    {finished || 'Pending OrthoPhoto Creation'}
                  </div>
                  <div
                    className={`progress-bar ${ended && !finished ? 'bg-danger' : ''}`}
                    role="progressbar"
                    style={{ width: '34%' }}
                  >
                    {ended || 'didnt End Process Yet'}
                  </div>
                </div>
                {logStream.logs.map((log, logIndex) => (
                  <div key={logIndex}>
                    <p>
                      [{formatTimestamp(log.timestamp)}] {log.message}
                    </p>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

export default LiveLogViewer
