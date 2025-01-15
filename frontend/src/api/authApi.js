import axios from '../axiosConfig'
const LOGIN_URL = '/api/auth/login/'

export const login = async (username, password) => {
  try {
    const response = await axios.post(LOGIN_URL, { username, password })
    return response.data
  } catch (error) {
    throw error
  }
}
