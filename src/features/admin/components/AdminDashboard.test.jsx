import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'
import { listPosts, listUserPosts, listUsers } from '../api/adminApi'
import { alertError } from '../../../helpers/toolsHelper'

vi.mock('../api/adminApi', () => ({ listUsers: vi.fn(), listPosts: vi.fn(), listUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', async (orig) => ({ ...(await orig()), alertError: vi.fn() }))

const users = [
  { id: 1, username: 'admin', email: 'a@x.com', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'ani', email: 'ani@x.com', role: 'member', total_posts: 3, total_published: 2 },
]
const posts = [
  { id: 1, title: 'Terbit', slug: 'terbit', category: 'Opini', is_published: true, created_at: '2026-11-01T00:00:00Z', author: { username: 'ani' } },
  { id: 2, title: 'Draf', slug: 'draf', category: 'Umum', is_published: false, created_at: '2026-11-02T00:00:00Z' },
]

beforeEach(() => {
  vi.clearAllMocks()
  listUsers.mockResolvedValue(users)
  listPosts.mockResolvedValue(posts)
  listUserPosts.mockResolvedValue([posts[0]])
})

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, direktori pengguna, dan arsip artikel', async () => {
    const onNavigate = vi.fn()
    render(<AdminDashboard onNavigate={onNavigate} />)
    expect(await screen.findByText('a@x.com')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getAllByText('Total Artikel')[0].nextSibling).toHaveTextContent('3')
    expect(screen.getAllByText('Total Terbit')[0].nextSibling).toHaveTextContent('2')
    expect(await screen.findByText('Draf', { selector: 'td.font-semibold' })).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Baca'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/terbit')
  })

  it('filter artikel per pengguna lalu tampilkan semua', async () => {
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: 'ani' }))
    expect(await screen.findByText('Artikel milik ani')).toBeInTheDocument()
    expect(listUserPosts).toHaveBeenCalledWith(2)

    await userEvent.click(screen.getByText('Tampilkan semua'))
    expect(await screen.findByText('Arsip Seluruh Artikel')).toBeInTheDocument()
  })

  it('menampilkan error dari API', async () => {
    listUsers.mockRejectedValueOnce(new Error('users gagal'))
    listPosts.mockRejectedValueOnce(new Error('posts gagal'))
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('users gagal'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('posts gagal'))
  })
})
