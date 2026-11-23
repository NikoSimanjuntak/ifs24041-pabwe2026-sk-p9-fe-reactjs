import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from './AuthPage'
import { login, register } from '../api/authApi'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ alertError: vi.fn(), alertSuccess: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthPage (login)', () => {
  it('memiliki id input wajib dan berhasil login', async () => {
    const onSuccess = vi.fn()
    login.mockResolvedValue({ token: 't', user: { id: 1 } })
    render(<AuthPage mode="login" onSuccess={onSuccess} onNavigate={() => {}} />)

    await userEvent.type(document.getElementById('login-username'), 'budi')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
    expect(login).toHaveBeenCalledWith('budi', 'rahasia')
  })

  it('menampilkan error saat login gagal dan status memuat saat menunggu', async () => {
    let reject
    login.mockReturnValue(new Promise((_, r) => (reject = r)))
    render(<AuthPage mode="login" onSuccess={vi.fn()} onNavigate={() => {}} />)
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('Memproses…')).toBeInTheDocument()

    reject(new Error('username atau password salah'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('username atau password salah'))
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeEnabled()
  })

  it('tautan ke halaman registrasi', async () => {
    const onNavigate = vi.fn()
    render(<AuthPage mode="login" onSuccess={vi.fn()} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})

describe('AuthPage (register)', () => {
  it('mendaftarkan akun lalu memanggil onSuccess', async () => {
    const onSuccess = vi.fn()
    register.mockResolvedValue({})
    render(<AuthPage mode="register" onSuccess={onSuccess} onNavigate={() => {}} />)

    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(document.getElementById('register-email'), 'budi@mail.com')
    await userEvent.type(document.getElementById('register-password'), 'rahasia1')
    await userEvent.click(document.getElementById('register-submit'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(register).toHaveBeenCalledWith({ username: 'budi', email: 'budi@mail.com', password: 'rahasia1' })
    expect(alertSuccess).toHaveBeenCalled()
  })

  it('error registrasi dan tautan ke login', async () => {
    const onNavigate = vi.fn()
    register.mockRejectedValue(new Error('username atau email sudah digunakan'))
    render(<AuthPage mode="register" onSuccess={vi.fn()} onNavigate={onNavigate} />)
    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(document.getElementById('register-email'), 'budi@mail.com')
    await userEvent.type(document.getElementById('register-password'), 'rahasia1')
    await userEvent.click(document.getElementById('register-submit'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('username atau email sudah digunakan'))

    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})
