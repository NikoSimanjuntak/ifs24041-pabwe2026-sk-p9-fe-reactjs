import { apiRequest } from '../../../helpers/apiHelper'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

const data = (promise) => promise.then((r) => r.data)

export const listPublicPosts = ({ q = '', category = '' } = {}) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return data(apiRequest(`/public/posts${qs ? `?${qs}` : ''}`, { auth: false }))
}

export const getPublicPost = (slug) => data(apiRequest(`/public/posts/${encodeURIComponent(slug)}`, { auth: false }))

export const listMyPosts = () => data(apiRequest('/posts'))
export const getStats = () => data(apiRequest('/posts/stats'))
export const createPost = (payload) => data(apiRequest('/posts', { method: 'POST', body: payload }))
export const updatePost = (id, payload) => data(apiRequest(`/posts/${id}`, { method: 'PUT', body: payload }))
export const deletePost = (id) => data(apiRequest(`/posts/${id}`, { method: 'DELETE' }))
export const togglePublish = (id) => data(apiRequest(`/posts/${id}/toggle-publish`, { method: 'PATCH' }))
export const aiGenerate = (payload) => data(apiRequest('/posts/ai-generate', { method: 'POST', body: payload }))
