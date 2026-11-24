import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'
import { deletePost, getStats, listMyPosts, togglePublish } from '../api/blogApi'
import { alertError, alertSuccess, confirmDialog } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({ listMyPosts: vi.fn(), getStats: vi.fn(), togglePublish: vi.fn(), deletePost: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', async (orig) => ({ ...(await orig()), alertError: vi.fn(), alertSuccess: vi.fn(), confirmDialog: vi.fn() }))
vi.mock('../modals/PostModal', () => ({
  default: ({ post, draft, onClose, onSaved }) => (
    <div data-testid="post-modal">
      <span>{post ? `edit:${post.title}` : draft ? `draft:${draft.title}` : 'baru'}</span>
      <button onClick={onClose}>tutup-post</button>
      <button onClick={onSaved}>simpan-post</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ onClose, onSaved, onApply }) => (
    <div data-testid="ai-modal">
      <button onClick={onClose}>tutup-ai</button>
      <button onClick={onSaved}>simpan-ai</button>
      <button onClick={() => onApply({ title: 'Hasil AI' })}>terapkan-ai</button>
    </div>
  ),
}))

const posts = [
  { id: 1, title: 'Terbit', slug: 'terbit', category: 'Opini', is_published: true, created_at: '2026-11-01T00:00:00Z' },
  { id: 2, title: 'Draf', slug: 'draf', category: 'Umum', is_published: false, created_at: '2026-11-02T00:00:00Z' },
]

beforeEach(() => {
  vi.clearAllMocks()
  listMyPosts.mockResolvedValue(posts)
  getStats.mockResolvedValue({ total_articles: 2, total_selesai: 1, belum_selesai: 1 })
})

describe('AuthorDashboard', () => {
  it('memuat statistik dan tabel artikel', async () => {
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    expect(await screen.findByText('Terbit')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total_articles')).toHaveTextContent('2')
    expect(screen.getByLabelText('Terbitkan Terbit')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Terbitkan Draf')).toHaveAttribute('aria-checked', 'false')
  })

  it('keadaan kosong dan error pemuatan', async () => {
    listMyPosts.mockResolvedValueOnce([])
    const { unmount } = render(<AuthorDashboard onNavigate={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
    unmount()

    listMyPosts.mockRejectedValueOnce(new Error('gagal'))
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('gagal'))
  })

  it('toggle publikasi, sukses dan gagal', async () => {
    togglePublish.mockResolvedValueOnce({})
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await userEvent.click(await screen.findByLabelText('Terbitkan Draf'))
    await waitFor(() => expect(togglePublish).toHaveBeenCalledWith(2))
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))

    togglePublish.mockRejectedValueOnce(new Error('toggle gagal'))
    await userEvent.click(screen.getByLabelText('Terbitkan Draf'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('toggle gagal'))
  })

  it('menu kebab: buka/tutup, Edit, Lihat (hanya terbit)', async () => {
    const onNavigate = vi.fn()
    render(<AuthorDashboard onNavigate={onNavigate} />)
    await userEvent.click(await screen.findByLabelText('Menu Terbit'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Menu Terbit')) // tutup
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Lihat' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/terbit')

    await userEvent.click(screen.getByLabelText('Menu Draf'))
    expect(within(screen.getByRole('menu')).queryByRole('menuitem', { name: 'Lihat' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(screen.getByTestId('post-modal')).toHaveTextContent('edit:Draf')
  })

  it('hapus: dibatalkan, berhasil, dan gagal', async () => {
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await screen.findByText('Terbit')

    confirmDialog.mockResolvedValueOnce(false)
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    expect(deletePost).not.toHaveBeenCalled()

    confirmDialog.mockResolvedValueOnce(true)
    deletePost.mockResolvedValueOnce({})
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(alertSuccess).toHaveBeenCalledWith('Artikel dihapus'))
    expect(deletePost).toHaveBeenCalledWith(1)

    confirmDialog.mockResolvedValueOnce(true)
    deletePost.mockRejectedValueOnce(new Error('hapus gagal'))
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('hapus gagal'))
  })

  it('modal artikel baru: tutup dan simpan memuat ulang', async () => {
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await screen.findByText('Terbit')
    await userEvent.click(screen.getByText('Tambah Artikel'))
    expect(screen.getByTestId('post-modal')).toHaveTextContent('baru')
    await userEvent.click(screen.getByText('tutup-post'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Tambah Artikel'))
    await userEvent.click(screen.getByText('simpan-post'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))
  })

  it('AI generator: tutup, simpan, dan terapkan ke editor', async () => {
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await screen.findByText('Terbit')

    await userEvent.click(screen.getByText('AI Generator'))
    await userEvent.click(screen.getByText('tutup-ai'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('AI Generator'))
    await userEvent.click(screen.getByText('simpan-ai'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('AI Generator'))
    await userEvent.click(screen.getByText('terapkan-ai'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
    expect(screen.getByTestId('post-modal')).toHaveTextContent('draft:Hasil AI')
  })
})
