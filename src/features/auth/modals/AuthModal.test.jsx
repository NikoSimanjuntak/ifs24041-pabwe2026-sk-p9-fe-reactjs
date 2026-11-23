import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthModal from './AuthModal'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ alertError: vi.fn(), alertSuccess: vi.fn() }))

describe('AuthModal', () => {
  it('menampilkan form login dengan id="login-username" dan bisa ditutup', async () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} onSuccess={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalled()
  })

  it('menutup modal lalu berpindah ke halaman registrasi', async () => {
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(<AuthModal onClose={onClose} onSuccess={vi.fn()} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onClose).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})
