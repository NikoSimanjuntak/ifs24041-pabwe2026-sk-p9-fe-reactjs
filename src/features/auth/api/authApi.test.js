import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

beforeEach(() => {
  apiRequest.mockReset()
  apiRequest.mockResolvedValue({ data: { ok: true } })
})

describe('authApi', () => {
  it('login', async () => {
    expect(await login('budi', 'rahasia')).toEqual({ ok: true })
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { username: 'budi', password: 'rahasia' }, auth: false })
  })

  it('register', async () => {
    expect(await register({ username: 'a' })).toEqual({ ok: true })
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: { username: 'a' }, auth: false })
  })

  it('logout', async () => {
    await logout()
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })

  it('getProfile & updateProfile', async () => {
    expect(await getProfile()).toEqual({ ok: true })
    expect(apiRequest).toHaveBeenCalledWith('/auth/profile')
    expect(await updateProfile({ email: 'x@y.z' })).toEqual({ ok: true })
    expect(apiRequest).toHaveBeenCalledWith('/auth/profile', { method: 'PUT', body: { email: 'x@y.z' } })
  })
})
