import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

export const comicsAPI = {
  getList: (params) => api.get('/comics', { params }),
  getCategories: () => api.get('/comics/categories'),
  getHot: (limit) => api.get('/comics/hot', { params: { limit } }),
  getRankings: (type, limit) => api.get('/comics/rankings', { params: { type, limit } }),
  getSchedule: () => api.get('/comics/schedule'),
  getLatest: () => api.get('/comics/latest'),
  getById: (id) => api.get(`/comics/${id}`),
  follow: (id) => api.post(`/comics/follow/${id}`),
  create: (formData) => api.post('/comics', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/comics/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/comics/${id}`),
}

export const chaptersAPI = {
  getByComic: (comicId) => api.get(`/chapters/comic/${comicId}`),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (formData) => api.post('/chapters', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/chapters/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/chapters/${id}`),
  saveProgress: (id, data) => api.put(`/chapters/${id}/read`, data),
}

export const commentsAPI = {
  getByComic: (comicId, params) => api.get(`/comments/comic/${comicId}`, { params }),
  getByChapter: (chapterId, params) => api.get(`/comments/chapter/${chapterId}`, { params }),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
}

export const forumAPI = {
  getCategories: () => api.get('/forum/categories'),
  createCategory: (data) => api.post('/forum/categories', data),
  getTopics: (params) => api.get('/forum/topics', { params }),
  getHotTopics: () => api.get('/forum/topics/hot'),
  getTopic: (id) => api.get(`/forum/topics/${id}`),
  createTopic: (data) => api.post('/forum/topics', data),
  updateTopic: (id, data) => api.put(`/forum/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/forum/topics/${id}`),
  likeTopic: (id) => api.post(`/forum/topics/${id}/like`),
  getReplies: (topicId, params) => api.get(`/forum/topics/${topicId}/replies`, { params }),
  createReply: (topicId, data) => api.post(`/forum/topics/${topicId}/replies`, data),
  deleteReply: (id) => api.delete(`/forum/replies/${id}`),
  likeReply: (id) => api.post(`/forum/replies/${id}/like`),
}

export const tagsAPI = {
  getList: (params) => api.get('/tags', { params }),
  getHot: (type) => api.get('/tags/hot', { params: { type } }),
}

export const votesAPI = {
  submit: (data) => api.post('/votes', data),
  getByChapter: (chapterId) => api.get(`/votes/chapter/${chapterId}`),
  getComicStats: (comicId) => api.get(`/votes/comic/${comicId}/stats`),
}

export default api
