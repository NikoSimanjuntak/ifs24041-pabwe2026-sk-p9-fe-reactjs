import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PostModal from './PostModal'
import { createPost, updatePost } from '../api/blogApi'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', async (orig) => ({ ...(await orig()), createPost: vi.fn(), updatePost: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ alertError: vi.fn(), alertSuccess: vi.fn() }))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => <textarea aria-label="Editor" value={value} onChange={(e) => onChange(e.target.value)} />,
}))

beforeEach(() => vi.clearAllMocks())

describe('PostModal', () => {
  it('artikel baru: validasi, simpan, dan tombol Batal', async () => {
    const onSaved = vi.fn()
    const onClose = vi.fn()
    createPost.mockResolvedValue({})
    render(<PostModal onClose={onClose} onSaved={onSaved} />)
    expect(screen.getByText('Artikel Baru')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Simpan'))
    expect(alertError).toHaveBeenCalledWith('Judul dan konten artikel wajib diisi')
    expect(createPost).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('Judul'), 'Judul Baru')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText('Ringkasan'), 'ringkas')
    await userEvent.type(screen.getByLabelText('Gambar sampul'), 'http://img')
    await userEvent.type(screen.getByLabelText('Editor'), 'isi')
    await userEvent.click(screen.getByLabelText('Terbitkan'))
    await userEvent.click(screen.getByText('Simpan'))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({ title: 'Judul Baru', category: 'Bisnis', excerpt: 'ringkas', content: 'isi', cover_image_path: 'http://img', is_published: true })
    expect(alertSuccess).toHaveBeenCalled()

    await userEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('mode edit memanggil updatePost dengan data awal', async () => {
    const onSaved = vi.fn()
    updatePost.mockResolvedValue({})
    const post = { id: 7, title: 'Lama', category: 'Opini', excerpt: 'e', cover_image_path: '', content: 'isi lama', is_published: true }
    render(<PostModal post={post} onClose={vi.fn()} onSaved={onSaved} />)
    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Terbitkan')).toBeChecked()

    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(7, expect.objectContaining({ title: 'Lama', is_published: true }))
  })

  it('nilai awal dari draf AI', () => {
    render(<PostModal draft={{ title: 'Dari AI', content: 'konten' }} onClose={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByLabelText('Judul')).toHaveValue('Dari AI')
    expect(screen.getByLabelText('Editor')).toHaveValue('konten')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Umum')
  })

  it('menampilkan error dari server', async () => {
    createPost.mockRejectedValue(new Error('kategori tidak valid'))
    render(<PostModal draft={{ title: 'T', content: 'C' }} onClose={vi.fn()} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('kategori tidak valid'))
    expect(screen.getByText('Simpan')).toBeEnabled()
  })

  it('menampilkan status menyimpan selama request berjalan', async () => {
    let resolve
    createPost.mockReturnValue(new Promise((r) => (resolve = r)))
    render(<PostModal draft={{ title: 'T', content: 'C' }} onClose={vi.fn()} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByText('Simpan'))
    expect(await screen.findByText('Menyimpan…')).toBeDisabled()
    resolve({})
    await waitFor(() => expect(screen.getByText('Simpan')).toBeEnabled())
  })
})
