import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8888/api/v1'

export const api = axios.create({ baseURL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, err => {
  const status = err?.response?.status
  if (status === 429) err.message = 'Rate limited, please retry later'
  if (status === 503) err.message = 'Service temporarily unavailable'
  return Promise.reject(err)
})
