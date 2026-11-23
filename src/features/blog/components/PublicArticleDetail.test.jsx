import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'
import { getPublicPost } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const post = (o = {}) => ({ title: 'Judul', category: 'Opini', content: '# isi', published_at: '2026-11-01T00:00:00Z', reading_time: 2, author: { username: 'ani' }, cover_image_path: 'http://img/x.png', ...o })

beforeEach(() => vi.clearAllMocks())

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dengan sampul dan markdown', async () => {
    getPublicPost.mockResolvedValue(post())
    const onNavigate = vi.fn()
    render(<PublicArticleDetail slug="judul" onNavigate={onNavigate} />)
    expect(screen.getByText('Memuat artikel…')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'Judul' })).toBeInTheDocument()
    expect(screen.getByText(/ani/)).toBeInTheDocument()
    expect(screen.getByText(/2 menit baca/)).toBeInTheDocument()
    expect(screen.getByAltText('Judul')).toHaveAttribute('src', 'http://img/x.png')
    expect(screen.getByTestId('viewer')).toHaveTextContent('# isi')
    expect(getPublicPost).toHaveBeenCalledWith('judul')

    await userEvent.click(screen.getByText('← Kembali ke beranda'))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('tanpa sampul dan tanpa data penulis', async () => {
    getPublicPost.mockResolvedValue(post({ cover_image_path: '', author: undefined }))
    render(<PublicArticleDetail slug="x" onNavigate={vi.fn()} />)
    expect(await screen.findByText(/Anonim/)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('menampilkan pesan error saat artikel tidak ditemukan', async () => {
    getPublicPost.mockRejectedValue(new Error('data tidak ditemukan'))
    const onNavigate = vi.fn()
    render(<PublicArticleDetail slug="hilang" onNavigate={onNavigate} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('data tidak ditemukan')
    await userEvent.click(screen.getByText('← Kembali ke beranda'))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })
})
