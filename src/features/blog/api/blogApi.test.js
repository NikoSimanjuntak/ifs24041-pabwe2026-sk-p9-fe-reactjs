import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import * as api from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

beforeEach(() => {
  apiRequest.mockReset()
  apiRequest.mockResolvedValue({ data: 'D' })
})

describe('blogApi', () => {
  it('listPublicPosts tanpa dan dengan filter', async () => {
    expect(await api.listPublicPosts()).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts', { auth: false })
    await api.listPublicPosts({ q: 'go lang', category: 'Teknologi' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?q=go+lang&category=Teknologi', { auth: false })
    await api.listPublicPosts({ category: 'Bisnis' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?category=Bisnis', { auth: false })
  })

  it('getPublicPost meng-encode slug', async () => {
    await api.getPublicPost('a b')
    expect(apiRequest).toHaveBeenCalledWith('/public/posts/a%20b', { auth: false })
  })

  it('endpoint penulis', async () => {
    await api.listMyPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/posts')
    await api.getStats()
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/stats')
    await api.createPost({ title: 't' })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts', { method: 'POST', body: { title: 't' } })
    await api.updatePost(3, { title: 'u' })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'PUT', body: { title: 'u' } })
    await api.deletePost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'DELETE' })
    await api.togglePublish(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3/toggle-publish', { method: 'PATCH' })
    await api.aiGenerate({ topic: 'x' })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/ai-generate', { method: 'POST', body: { topic: 'x' } })
  })

  it('daftar kategori', () => {
    expect(api.CATEGORIES).toEqual(['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'])
  })
})
