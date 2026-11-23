import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const setup = (props = {}) => {
  const p = { user: null, theme: 'light', accent: 'indigo', onAccent: vi.fn(), onToggleTheme: vi.fn(), onNavigate: vi.fn(), onLogin: vi.fn(), onLogout: vi.fn(), ...props }
  render(<StickyNavbar {...p} />)
  return p
}

describe('StickyNavbar', () => {
  it('tamu: Login (modal), Register, brand, tema dan aksen', async () => {
    const p = setup()
    await userEvent.click(screen.getByText('Login'))
    expect(p.onLogin).toHaveBeenCalled()
    await userEvent.click(screen.getByText('Register'))
    expect(p.onNavigate).toHaveBeenCalledWith('/register')
    await userEvent.click(screen.getByText('Delcom Blog'))
    expect(p.onNavigate).toHaveBeenCalledWith('/')
    await userEvent.click(screen.getByLabelText('Ganti tema'))
    expect(p.onToggleTheme).toHaveBeenCalled()
    await userEvent.click(screen.getByLabelText('Aksen rose'))
    expect(p.onAccent).toHaveBeenCalledWith('rose')
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })

  it('penulis: Workspace & Logout tanpa menu Admin', async () => {
    const p = setup({ user: { role: 'member' }, theme: 'dark' })
    await userEvent.click(screen.getByText('Workspace'))
    expect(p.onNavigate).toHaveBeenCalledWith('/author')
    await userEvent.click(screen.getByText('Logout'))
    expect(p.onLogout).toHaveBeenCalled()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('admin melihat menu Admin', async () => {
    const p = setup({ user: { role: 'admin' } })
    await userEvent.click(screen.getByText('Admin'))
    expect(p.onNavigate).toHaveBeenCalledWith('/admin')
  })
})
