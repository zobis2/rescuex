import React, { useState, useEffect } from 'react'
import axios from '../../axiosConfig'
import SettingsComponent from './SettingsComponent'
import LiveLogViewer from './LiveLogViewer'
import settingsOptions from '../../utils/orthophoto/settings.json'
import ImageGallery from './ImageGallery'
import DoneLogViewer from './DoneLogViewer'
import {
  generateZip,
  getFolderSettings,
  getZipFiles,
  listFolders,
  listPrefixFiles,
  removePrefix,
} from '../../api/folderApi'
import { reExecuteOrthophoto } from '../../api/uploadApi'

const ViewOrthoPhotoFiles = ({ bucketName }) => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [orthoPhotoStats, setOrthoPhotoStats] = useState(null)
  const [publicIp, setPublicIp] = useState('')
  const [instanceId, setInstanceId] = useState('')
  // console.log(settingsOptions);
  // debugger;
  const [settings, setSettings] = useState(settingsOptions['ultra'])
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showLiveLogs, setShowLiveLogs] = useState(false)
  const [showDoneLogs, setShowDoneLogs] = useState(false)
  const [showThumb, setShowThumb] = useState(false)

  const [zipFiles, setZipFiles] = useState([])
  const [generatingZip, setGeneratingZip] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [bucketName])

  useEffect(() => {
    if (selectedProject) {
      const fetchZipFiles = async () => {
        try {
          const data = await getZipFiles(bucketName, selectedProject)
          setZipFiles(data)
        } catch (error) {
          console.error('Error fetching zip files', error)
        }
      }

      fetchZipFiles()
    }
  }, [bucketName, selectedProject])
  const fetchProjects = async () => {
    try {
      const folders = await listFolders(bucketName, '')
      debugger
      setProjects(folders)
    } catch (error) {
      console.error('Error fetching projects', error)
    }
  }
  const handleProjectSelect = async (project) => {
    try {
      setSelectedProject(null)
      const projectName = project.Folder
      let settingsResponse = {}
      try {
        settingsResponse = await getFolderSettings(bucketName, projectName)
      } catch (error) {
        console.error('Error fetching folder settings', error)
      }
      const prefixFiles = await listPrefixFiles(bucketName, projectName)
      const keysDictionary = prefixFiles.reduce(
        (acc, f) => ({ ...acc, [f.Key]: f.Size }),
        {}
      )
      const keysToDateDictionary = prefixFiles.reduce(
        (acc, f) => ({ ...acc, [f.Keyß]: f.LastModified }),
        {}
      )
      console.log(keysToDateDictionary)
      debugger
      const originalOrthoPhotoKey = `${projectName}/output/odm_orthophoto/odm_orthophoto.original.tif`
      const orthoPhotoKey = `${projectName}/output/odm_orthophoto/odm_orthophoto.tif`
      const logKey = `${projectName}/output/odm_${projectName}-process.log`
      const reportKey = `${projectName}/output/odm_report/report.pdf`
      const orthoPhoto = keysDictionary[orthoPhotoKey]
      const orthoPhotoOriginal = keysDictionary[originalOrthoPhotoKey]
      const logsFile = keysDictionary[logKey]
      const reportPdf = keysDictionary[reportKey]
      // const logExists=keys .filter(item => !item.includes('/output/'));
      // const logExists=keys .filter(item => !item.includes('/output/'));
      const result = {
        orthoPhoto: {
          exists: !!orthoPhoto, // true if exists, false otherwise
          path: orthoPhotoKey,
        },
        orthoPhotoOriginal: {
          exists: !!orthoPhotoOriginal, // true if exists, false otherwise
          path: originalOrthoPhotoKey,
        },
        logsFile: {
          exists: !!logsFile, // true if exists, false otherwise
          path: logKey,
        },
        reportPdf: {
          exists: !!reportPdf, // true if exists, false otherwise
          path: reportKey,
        },
      }
      setOrthoPhotoStats(result)
      // debugger;
      setSettings(settingsResponse)
      setSelectedProject(projectName)
    } catch (error) {
      console.error('Error fetching project details', error)
    }
  }

  const downloadFile = async (url, fileName, mimeType) => {
    let loadedTotal = 0
    debugger
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const { loaded, bytes } = progressEvent
          loadedTotal += bytes
          const bytesToMB = (loadedTotal / (1024 * 1024)).toFixed(2)

          setDownloadProgress(bytesToMB)
        },
      })

      const blob = new Blob([response.data], { type: mimeType })
      const blobURL = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobURL
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      debugger
    } catch (error) {
      console.error('Error downloading file', error)
      setDownloadProgress(0) // Reset progress on error
      alert('Error downloading file')
    } finally {
      setDownloadProgress('DONE') // Set to 'DONE' when done
    }
  }
  const deletePrefix = async (BUCKET_NAME, prefix) => {
    try {
      debugger

      await removePrefix(BUCKET_NAME, prefix)
      setSelectedProject(null)
      fetchProjects()
      alert('Delete Project ' + prefix)
    } catch (error) {
      console.error('Error deletePrefix ', error)
      alert('Error deletePrefix')
    } finally {
    }
  }
  const handleDownloadOriginalTiff = () => {
    const fileName = `${selectedProject}_orthophoto.tif`
    const Key = `${selectedProject}/output/odm_orthophoto/odm_orthophoto.original.tif`
    const url = `/api/folder/get-file?bucketName=${bucketName}&Key=${Key}`

    downloadFile(url, fileName, 'image/tiff')
  }
  const handleDownloadTiff = () => {
    const fileName = `${selectedProject}_orthophoto.tif`
    const Key = `${selectedProject}/output/odm_orthophoto/odm_orthophoto.tif`
    const url = `/api/folder/get-file?bucketName=${bucketName}&Key=${Key}`

    downloadFile(url, fileName, 'image/tiff')
  }

  const handleDownloadZip = (zipFileName) => {
    const fileName = zipFileName.split('/').pop()
    const Key = `${selectedProject}/output_zip/${fileName}`
    const url = `/api/folder/get-file?bucketName=${bucketName}&Key=${Key}`
    downloadFile(url, fileName, 'application/zip')
  }

  const handleReExecute = async () => {
    try {
      const response = await reExecuteOrthophoto(
        bucketName,
        settings,
        selectedProject
      )
      const { publicIp, instanceId } = response
      setPublicIp(publicIp)
      setInstanceId(instanceId)
      console.log('Re-execution successful', response)
      setShowLiveLogs(true)
    } catch (error) {
      console.error('Re-execution failed', error)
    }
  }

  const handleGenerateZip = async () => {
    setGeneratingZip(true)
    const initialZipFiles = zipFiles // Store the initial list of zip files

    try {
      const response = await generateZip(bucketName, selectedProject)
      console.log('Zip generation started', response)
      alert(
        'Zip generation started. This may take a few minutes. Check back later.'
      )

      // Check for new zip files every 30 seconds for 10 minutes
      const checkInterval = 10000 // 30 seconds
      const totalDuration = 10 * 60 * 1000 // 10 minutes
      const checkEndTime = Date.now() + totalDuration

      const checkForNewZipFiles = async () => {
        if (Date.now() > checkEndTime) {
          setGeneratingZip(false)
          return
        }
        try {
          const newZipFiles = await getZipFiles(bucketName, selectedProject)

          // Check if there is a difference between initial and new zip files
          if (newZipFiles.length !== initialZipFiles.length) {
            setZipFiles(newZipFiles)
            console.log('New zip file found', newZipFiles)
            alert(
              'New zip file has been generated and is available for download.'
            )
            setGeneratingZip(false)
            return
          }
          console.log('Checked for new zip files, none found')
        } catch (error) {
          console.error('Error checking for new zip files', error)
        }
        setTimeout(checkForNewZipFiles, checkInterval)
      }

      setTimeout(checkForNewZipFiles, checkInterval)
    } catch (error) {
      console.error('Zip generation failed', error)
      setGeneratingZip(false)
    }
  }

  const handleSettingsChange = (newSettings, selected) => {
    debugger
    setSettings(newSettings)
  }
  // Sort projects by CreationDate from first to last
  const sortedProjects = projects
    .filter(
      (p) =>
        p.Folder !== 'thumbnails' && p.Folder !== '/' && p.Folder.length > 0
    )
    .sort((a, b) => new Date(a.CreationDate) - new Date(b.CreationDate))
    .reverse()
  const displayedProjects = showAll
    ? sortedProjects
    : sortedProjects.slice(0, 4)

  return (
    <div>
      <h2>View OrthoPhoto Files</h2> {/*<div>*/}
      {/*    {JSON.stringify(settingsOptions, null, 2)}*/}
      {/*</div>
       */}
      <div>
        <h3>Projects</h3>
        {/*<ul>*/}
        {/*    {projects.filter(p=>p!='thumbnails' && p.length>0).map((project) => (*/}
        {/*        <li key={project} onClick={() => handleProjectSelect(project)}*/}
        {/*            className={`list-group-item ${selectedProject === project ? 'active' : ''}`}*/}
        {/*            style={{*/}
        {/*                cursor: 'pointer',*/}
        {/*                backgroundColor: selectedProject === project ? '#007bff' : '',*/}
        {/*                color: selectedProject === project ? '#fff' : ''*/}
        {/*            }}*/}
        {/*        >*/}
        {/*            {project}*/}
        {/*        </li>*/}
        {/*    ))}*/}
        {/*</ul>*/}
        <ul className="list-group">
          {displayedProjects.map((project, i) => (
            <li
              key={project.Folder}
              onClick={() => handleProjectSelect(project)}
              className={`list-group-item ${selectedProject === project.Folder ? 'active' : ''}`}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedProject === project.Folder ? '#007bff' : '',
                color: selectedProject === project.Folder ? '#fff' : '',
              }}
            >
              <h2>{i + 1} , Creation Date:</h2>
              <h3>{project.CreationDate}</h3>
              {project.Folder}
            </li>
          ))}
        </ul>
        {/* Show more/less button */}
        {sortedProjects.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn btn-primary mt-3"
          >
            {showAll ? 'Show Less' : `Show ${sortedProjects.length - 4} More`}
          </button>
        )}
      </div>
      {selectedProject && (
        <div>
          <div className="my-4">
            <h2>Selected Project: {selectedProject}</h2>
            <div></div>
            <div className="d-flex align-items-center">
              <button
                className="btn btn-warning"
                onClick={() => setShowLiveLogs(!showLiveLogs)}
              >
                show All Logs(Live+Old)
              </button>

              <button
                onClick={() => setShowDoneLogs(!showDoneLogs)}
                className="btn btn-warning"
              >
                Show Insights (for last successful run)
              </button>

              <button
                onClick={() => deletePrefix(bucketName, selectedProject)}
                className="btn btn-danger me-2"
              >
                DELETE THIS PROJECT
              </button>
            </div>
          </div>
          {showLiveLogs && (
            <LiveLogViewer
              bucketName={bucketName}
              projectName={selectedProject}
            />
          )}

          {showDoneLogs && (
            <DoneLogViewer
              bucketName={bucketName}
              projectName={selectedProject}
            />
          )}
          {orthoPhotoStats && (
            <div>
              {orthoPhotoStats.orthoPhoto.exists ? (
                <>
                  <button
                    onClick={() =>
                      downloadFile(
                        `/api/folder/get-file?bucketName=${bucketName}&Key=${orthoPhotoStats.orthoPhoto.path}`,
                        `${selectedProject}_orthophoto.tif`,
                        'image/tiff'
                      )
                    }
                  >
                    Download TIFF File
                  </button>
                  {orthoPhotoStats.orthoPhoto.size &&
                    orthoPhotoStats.orthoPhoto.size < 10 && (
                      <div className="alert alert-warning mt-2">
                        TIFF file is too small (less than 10MB), probably a
                        failed process. View logs or PDF for details.
                      </div>
                    )}
                </>
              ) : (
                <div className="alert alert-danger mt-2">
                  TIFF file does not exist.
                </div>
              )}

              {orthoPhotoStats.orthoPhotoOriginal.exists ? (
                <>
                  <button
                    onClick={() =>
                      downloadFile(
                        `/api/folder/get-file?bucketName=${bucketName}&Key=${orthoPhotoStats.orthoPhotoOriginal.path}`,
                        `${selectedProject}_orthophoto.original.tif`,
                        'image/tiff'
                      )
                    }
                  >
                    Download Original TIFF File
                  </button>
                  {orthoPhotoStats.orthoPhotoOriginal.size &&
                    orthoPhotoStats.orthoPhotoOriginal.size < 10 && (
                      <div className="alert alert-warning mt-2">
                        Original TIFF file is too small (less than 10MB),
                        probably a failed process. View logs or PDF for details.
                      </div>
                    )}
                </>
              ) : (
                <div className="alert alert-danger mt-2">
                  Original TIFF file does not exist.
                </div>
              )}

              {orthoPhotoStats.logsFile.exists ? (
                <button
                  onClick={() =>
                    downloadFile(
                      `/api/folder/get-file?bucketName=${bucketName}&Key=${orthoPhotoStats.logsFile.path}`,
                      `${selectedProject}_process.log`,
                      'text/plain'
                    )
                  }
                >
                  Download Log File
                </button>
              ) : (
                <div className="alert alert-danger mt-2">
                  Log file does not exist.
                </div>
              )}

              {orthoPhotoStats.reportPdf.exists ? (
                <button
                  onClick={() =>
                    downloadFile(
                      `/api/folder/get-file?bucketName=${bucketName}&Key=${orthoPhotoStats.reportPdf.path}`,
                      `${selectedProject}_report.pdf`,
                      'application/pdf'
                    )
                  }
                >
                  Download PDF Report
                </button>
              ) : (
                <div className="alert alert-danger mt-2">
                  PDF report does not exist.
                </div>
              )}
            </div>
          )}
          <h3>Settings</h3>
          <button onClick={() => setShowSettings(!showSettings)}>
            Toggle Settings
          </button>
          {showSettings && (
            <SettingsComponent
              selectedOption="ultra"
              onChangeSettings={handleSettingsChange}
            />
          )}
          {/*<h3>TIFF File</h3>*/}
          {/*<button onClick={handleDownloadTiff}>Download TIFF File</button>*/}
          {/*<button onClick={handleDownloadOriginalTiff}>Download Original-TIFF File</button>*/}
          {downloadProgress > 0 && !isNaN(Number(downloadProgress)) && (
            <div>
              {downloadProgress}
              <p>Downloading File: {downloadProgress}MB</p>
              <progress value={downloadProgress} max={700}>
                {downloadProgress}
              </progress>
            </div>
          )}
          {settings !== null && (
            <button onClick={handleReExecute}>Re-Execute</button>
          )}

          <h3>Zip Files</h3>
          <button onClick={handleGenerateZip} disabled={generatingZip}>
            {generatingZip ? 'Generating Zip...' : 'Generate Zip'}
          </button>
          <ul>
            {zipFiles.map((zipFile) => (
              <li key={zipFile}>
                <button onClick={() => handleDownloadZip(zipFile)}>
                  Download {zipFile.split('/').pop()}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowThumb(!showThumb)}>
            Show Thumbnails
          </button>
          {showThumb && (
            <div>
              <h3>Image Thumbnails</h3>

              <ImageGallery
                bucketName={bucketName}
                projectName={`${selectedProject}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ViewOrthoPhotoFiles
