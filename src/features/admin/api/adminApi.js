import { apiRequest } from '../../../helpers/apiHelper'

const data = (promise) => promise.then((r) => r.data)

export const listUsers = () => data(apiRequest('/admin/users'))
export const listPosts = () => data(apiRequest('/admin/posts'))
export const listUserPosts = (userId) => data(apiRequest(`/admin/users/${userId}/posts`))
