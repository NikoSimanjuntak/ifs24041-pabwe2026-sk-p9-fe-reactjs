import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { parseRoute, resolvePath } from './App'
import { getToken, setToken } from './helpers/apiHelper'
import { getProfile, login, logout } from './features/auth/api/authApi'

vi.mock('./features/auth/api/authApi', () => ({ getProfile: vi.fn(), login: vi.fn(), logout: vi.fn(), register: vi.fn() }))
vi.mock('./helpers/toolsHelper', async (orig) => ({ ...(await orig()), alertError: vi.fn(), alertSuccess: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: ({ onNavigate }) => <button onClick={() => onNavigate('/posts/halo')}>HOME</button> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <div>DETAIL:{slug}</div> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: () => <div>AUTHOR</div> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <div>ADMIN</div> }))

const member = { id: 2, username: 'ani', role: 'member' }
const admin = { id: 1, username: 'admin', role: 'admin' }
const at = (path) => window.history.replaceState({}, '', path)

beforeEach(() => {
  vi.clearAllMocks()
  at('/')
})

describe('parseRoute & resolvePath', () => {
  it('parseRoute', () => {
    expect(parseRoute('/')).toEqual({ name: 'home' })
    expect(parseRoute('/public')).toEqual({ name: 'home' })
    expect(parseRoute('/posts/a%20b')).toEqual({ name: 'detail', slug: 'a b' })
    expect(parseRoute('/author')).toEqual({ name: 'author' })
    expect(parseRoute('/admin')).toEqual({ name: 'admin' })
    expect(parseRoute('/login')).toEqual({ name: 'login' })
    expect(parseRoute('/register')).toEqual({ name: 'register' })
    expect(parseRoute('/entah')).toEqual({ name: 'notfound' })
  })

  it('resolvePath', () => {
    expect(resolvePath('/author', null)).toBe('/login')
    expect(resolvePath('/admin', null)).toBe('/login')
    expect(resolvePath('/admin', member)).toBe('/author')
    expect(resolvePath('/admin', admin)).toBe('/admin')
    expect(resolvePath('/login', member)).toBe('/author')
    expect(resolvePath('/register', admin)).toBe('/admin')
    expect(resolvePath('/login', null)).toBe('/login')
    expect(resolvePath('/', member)).toBe('/')
  })
})

describe('App', () => {
  it('beranda publik dan navigasi ke detail (pushState)', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('HOME'))
    expect(screen.getByText('DETAIL:halo')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/halo')
  })

  it('sinkron dengan tombol back/forward (popstate) dan refresh di rute aktif', async () => {
    at('/posts/refresh')
    render(<App />)
    expect(screen.getByText('DETAIL:refresh')).toBeInTheDocument()
    act(() => {
      at('/entah')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText(/404/)).toBeInTheDocument()
    await userEvent.click(screen.getByText('Kembali ke beranda'))
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })

  it('/author tanpa login diarahkan ke /login', async () => {
    at('/author')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
    expect(document.getElementById('login-username')).toBeInTheDocument()
  })

  it('login dari halaman /login mengarahkan penulis ke /author, admin ke /admin', async () => {
    at('/login')
    login.mockResolvedValue({ token: 'tok', user: member })
    const { unmount } = render(<App />)
    await userEvent.type(document.getElementById('login-username'), 'ani')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('AUTHOR')).toBeInTheDocument()
    expect(getToken()).toBe('tok')
    expect(window.location.pathname).toBe('/author')
    unmount()

    setToken(null)
    at('/login')
    login.mockResolvedValue({ token: 'tok2', user: admin })
    render(<App />)
    await userEvent.type(document.getElementById('login-username'), 'admin')
    await userEvent.type(document.getElementById('login-password'), 'admin')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('ADMIN')).toBeInTheDocument()
  })

  it('pulihkan sesi dari token; admin melihat panel admin; logout kembali ke beranda', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(admin)
    logout.mockResolvedValue({})
    at('/admin')
    render(<App />)
    expect(screen.getByText('Memuat sesi…')).toBeInTheDocument()
    expect(await screen.findByText('ADMIN')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Logout'))
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(getToken()).toBeNull()
    expect(window.location.pathname).toBe('/')
  })

  it('logout tetap berhasil di sisi klien walau request gagal', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(member)
    logout.mockRejectedValue(new Error('401'))
    render(<App />)
    await userEvent.click(await screen.findByText('Logout'))
    await waitFor(() => expect(getToken()).toBeNull())
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })

  it('token tersimpan tidak valid: dihapus dan tampil sebagai tamu', async () => {
    setToken('basi')
    getProfile.mockRejectedValue(new Error('401'))
    render(<App />)
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('event auth:expired mengeluarkan pengguna dari workspace', async () => {
    setToken('tok')
    getProfile.mockResolvedValue(member)
    at('/author')
    render(<App />)
    expect(await screen.findByText('AUTHOR')).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new Event('auth:expired'))
    })
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('modal login dari navbar: berhasil login, dan bisa ditutup', async () => {
    login.mockResolvedValue({ token: 'tok', user: member })
    render(<App />)
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getByLabelText('Tutup'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Login'))
    await userEvent.type(document.getElementById('login-username'), 'ani')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('registrasi berhasil mengarahkan ke /login; ganti tema dan aksen', async () => {
    at('/register')
    const { register } = await import('./features/auth/api/authApi')
    register.mockResolvedValue({})
    render(<App />)
    await userEvent.type(document.getElementById('register-username'), 'baru')
    await userEvent.type(document.getElementById('register-email'), 'baru@mail.com')
    await userEvent.type(document.getElementById('register-password'), 'rahasia1')
    await userEvent.click(document.getElementById('register-submit'))
    await waitFor(() => expect(window.location.pathname).toBe('/login'))

    await userEvent.click(screen.getByLabelText('Ganti tema'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    await userEvent.click(screen.getByLabelText('Aksen emerald'))
    expect(document.documentElement.dataset.accent).toBe('emerald')
  })
})
