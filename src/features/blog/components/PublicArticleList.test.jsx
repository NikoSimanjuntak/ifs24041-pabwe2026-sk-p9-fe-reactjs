import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'
import { listPublicPosts } from '../api/blogApi'
import { alertError } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', async (orig) => ({ ...(await orig()), listPublicPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', async (orig) => ({ ...(await orig()), alertError: vi.fn() }))

const post = (o = {}) => ({ id: 1, slug: 'halo', title: 'Halo', excerpt: 'ringkas', category: 'Teknologi', published_at: '2026-11-01T00:00:00Z', reading_time: 3, author: { username: 'ani' }, ...o })

beforeEach(() => vi.clearAllMocks())

describe('PublicArticleList', () => {
  it('memuat artikel, menampilkan kartu, dan navigasi ke detail', async () => {
    listPublicPosts.mockResolvedValue([post(), post({ id: 2, slug: 'tanpa', title: 'Tanpa', author: undefined })])
    const onNavigate = vi.fn()
    render(<PublicArticleList onNavigate={onNavigate} />)
    expect(screen.getByText('Memuat artikel…')).toBeInTheDocument()

    expect(await screen.findByText('Halo')).toBeInTheDocument()
    expect(screen.getByText(/ani/)).toBeInTheDocument()
    expect(screen.getByText(/Anonim/)).toBeInTheDocument()
    expect(listPublicPosts).toHaveBeenCalledWith({ q: '', category: '' })

    await userEvent.click(screen.getByText('Halo'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/halo')
  })

  it('pencarian real-time dan filter kategori', async () => {
    listPublicPosts.mockResolvedValue([post()])
    render(<PublicArticleList onNavigate={vi.fn()} />)
    await screen.findByText('Halo')

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))

    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Bisnis' }))
    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('menampilkan keadaan kosong', async () => {
    listPublicPosts.mockResolvedValue([])
    render(<PublicArticleList onNavigate={vi.fn()} />)
    expect(await screen.findByText('Tidak ada artikel ditemukan.')).toBeInTheDocument()
  })

  it('menampilkan error dari API', async () => {
    listPublicPosts.mockRejectedValue(new Error('gagal memuat'))
    render(<PublicArticleList onNavigate={vi.fn()} />)
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('gagal memuat'))
  })

  it('mengabaikan respons usang yang tiba terlambat', async () => {
    const resolvers = []
    listPublicPosts.mockImplementation(() => new Promise((res) => resolvers.push(res)))
    render(<PublicArticleList onNavigate={vi.fn()} />)
    await waitFor(() => expect(resolvers).toHaveLength(1)) // permintaan #1 (Semua)

    await userEvent.click(screen.getByRole('button', { name: 'Opini' }))
    await waitFor(() => expect(resolvers).toHaveLength(2)) // permintaan #2 (Opini)

    resolvers[1]([post({ id: 9, slug: 'baru', title: 'Terbaru' })])
    expect(await screen.findByText('Terbaru')).toBeInTheDocument()

    resolvers[0]([post({ id: 8, slug: 'lama', title: 'Usang' })]) // terlambat -> diabaikan
    await new Promise((r) => setTimeout(r, 20))
    expect(screen.queryByText('Usang')).not.toBeInTheDocument()
    expect(screen.getByText('Terbaru')).toBeInTheDocument()
  })
})
