import axios from 'axios'
const isLocalhost = window.location.hostname === 'localhost'

const api = axios.create({
  baseURL: isLocalhost
    ? 'http://localhost:3001/platform/api'
    : 'https://web.atom.construction/platform/api',
})

export const getCompanies = () => api.get(`/company`)
export const getProjects = () => api.get(`/project`)
export const getUsers = () => api.get(`/user`)
export const getCameras = () => api.get(`/camera`)
export const getCamerasAPIs = () => api.get(`/camera-api`)
export const getReports = () => api.get(`/report`)
export const getPresignedUrl = (id) => api.get(`/report/${id}/presigned`)

export const createCompany = (data) => api.post(`/company`, data)
export const createProject = (data) => api.post(`/project`, data)
export const createUser = (data) => api.post(`/user`, data)
export const createCamera = (data) => api.post(`/camera`, data)
export const createCameraApi = (data) => api.post(`/camera-api`, data)
export const createReport = (data) =>
  api.post(`/report`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

export const updateCompany = (id, data) => api.put(`/company/${id}`, data)
export const updateProject = (id, data) => api.put(`/project/${id}`, data)
export const updateUser = (id, data) => api.put(`/user/${id}`, data)
export const updateCamera = (id, data) => api.put(`/camera/${id}`, data)
export const updateCameraApi = (id, data) => api.put(`/camera-api/${id}`, data)
export const updateReport = (id, data) =>
  api.put(`/report/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

export const deleteCompany = (id) => api.delete(`/company/${id}`)
export const deleteProject = (id) => api.delete(`/project/${id}`)
export const deleteUser = (id) => api.delete(`/user/${id}`)
export const deleteReport = (id) => api.delete(`/report/${id}`)
