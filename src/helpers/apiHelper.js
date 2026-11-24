const TOKEN_KEY = 'delcom_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/**
 * Wrapper fetch terpusat untuk seluruh endpoint /api.
 * - Alamat backend diambil dari VITE_API_URL (kosong = origin yang sama / proxy Vite).
 * - Menyuntikkan header Authorization: Bearer <token> bila `auth` aktif dan token ada.
 * - Mengurai respons standar {status, message, data?}.
 * - Melempar Error(message) dengan properti `status` bila respons bukan 2xx.
 * - Pada 401 dengan token, token dihapus dan event "auth:expired" dikirim.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let json
  try {
    json = await res.json()
  } catch {
    json = { message: 'Respons server tidak valid' }
  }

  if (!res.ok) {
    if (res.status === 401 && auth && token) {
      setToken(null)
      window.dispatchEvent(new Event('auth:expired'))
    }
    const error = new Error(json.message || 'Terjadi kesalahan pada server')
    error.status = res.status
    throw error
  }
  return json
}