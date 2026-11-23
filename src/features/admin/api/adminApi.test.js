import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { listPosts, listUserPosts, listUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

beforeEach(() => apiRequest.mockResolvedValue({ data: 'D' }))

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    expect(await listUsers()).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/users')
    expect(await listPosts()).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/posts')
    expect(await listUserPosts(5)).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/users/5/posts')
  })
})
