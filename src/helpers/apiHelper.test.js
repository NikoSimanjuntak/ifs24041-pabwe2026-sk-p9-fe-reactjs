import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, getToken, setToken } from './apiHelper'

const mockFetch = (status, body, { invalid = false } = {}) => {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: invalid ? () => Promise.reject(new Error('bad json')) : () => Promise.resolve(body),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('token', () => {
  it('menyimpan dan menghapus token', () => {
    expect(getToken()).toBeNull()
    setToken('abc')
    expect(getToken()).toBe('abc')
    setToken(null)
    expect(getToken()).toBeNull()
  })
})

describe('apiRequest', () => {
  it('GET tanpa opsi dan tanpa token', async () => {
    const fetchMock = mockFetch(200, { data: 1 })
    expect(await apiRequest('/x')).toEqual({ data: 1 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/x')
    expect(init.method).toBe('GET')
    expect(init.headers.Authorization).toBeUndefined()
    expect(init.headers['Content-Type']).toBeUndefined()
    expect(init.body).toBeUndefined()
  })

  it('menyuntikkan Bearer token dan body JSON', async () => {
    setToken('tok')
    const fetchMock = mockFetch(201, { data: 2 })
    await apiRequest('/posts', { method: 'POST', body: { a: 1 } })
    const init = fetchMock.mock.calls[0][1]
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"a":1}')
  })

  it('tidak mengirim token saat auth=false', async () => {
    setToken('tok')
    const fetchMock = mockFetch(200, {})
    await apiRequest('/public', { auth: false })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('melempar Error berisi pesan dan status', async () => {
    mockFetch(400, { message: 'Data tidak valid' })
    await expect(apiRequest('/x')).rejects.toMatchObject({ message: 'Data tidak valid', status: 400 })
  })

  it('memakai pesan bawaan bila server tidak memberi pesan', async () => {
    mockFetch(500, {})
    await expect(apiRequest('/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('menangani respons non-JSON', async () => {
    mockFetch(502, null, { invalid: true })
    await expect(apiRequest('/x')).rejects.toThrow('Respons server tidak valid')
  })

  it('401 dengan token: hapus token dan kirim event auth:expired', async () => {
    setToken('tok')
    mockFetch(401, { message: 'kedaluwarsa' })
    const listener = vi.fn()
    window.addEventListener('auth:expired', listener)
    await expect(apiRequest('/posts')).rejects.toThrow('kedaluwarsa')
    window.removeEventListener('auth:expired', listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getToken()).toBeNull()
  })

  it('401 tanpa token atau auth=false tidak memicu event', async () => {
    const listener = vi.fn()
    window.addEventListener('auth:expired', listener)
    mockFetch(401, { message: 'x' })
    await expect(apiRequest('/posts')).rejects.toThrow()
    setToken('tok')
    await expect(apiRequest('/auth/login', { auth: false })).rejects.toThrow()
    window.removeEventListener('auth:expired', listener)
    expect(listener).not.toHaveBeenCalled()
    expect(getToken()).toBe('tok')
  })
})
