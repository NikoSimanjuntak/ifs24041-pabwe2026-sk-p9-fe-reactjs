import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import { aiGenerate, createPost } from '../api/blogApi'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', async (orig) => ({ ...(await orig()), aiGenerate: vi.fn(), createPost: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ alertError: vi.fn(), alertSuccess: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const draft = { title: 'Artikel AI', category: 'Teknologi', excerpt: 'ringkas', content: '# Isi', sources: [{ title: 'Berita', url: 'http://berita' }] }

beforeEach(() => vi.clearAllMocks())

describe('AiPostGeneratorModal', () => {
  it('tombol aksi nonaktif sebelum ada draf dan validasi topik', async () => {
    render(<AiPostGeneratorModal onClose={vi.fn()} onSaved={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByText('Terapkan ke Editor')).toBeDisabled()
    expect(screen.getByText('Simpan')).toBeDisabled()
    await userEvent.click(screen.getByText('Generate Artikel'))
    expect(alertError).toHaveBeenCalledWith('Topik artikel wajib diisi')
    expect(aiGenerate).not.toHaveBeenCalled()
  })

  it('generate dengan search engine, pratinjau + sumber, lalu simpan sebagai draf', async () => {
    aiGenerate.mockResolvedValue(draft)
    createPost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<AiPostGeneratorModal onClose={vi.fn()} onSaved={onSaved} onApply={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Topik'), 'Tren AI')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await userEvent.click(screen.getByText('Generate Artikel'))

    expect(await screen.findByText('Artikel AI')).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Tren AI', category: 'Teknologi', include_web_search: true })
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Isi')
    expect(screen.getByRole('link', { name: 'Berita' })).toHaveAttribute('href', 'http://berita')

    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({ title: 'Artikel AI', category: 'Teknologi', excerpt: 'ringkas', content: '# Isi', is_published: false })
    expect(alertSuccess).toHaveBeenCalled()
  })

  it('tanpa search engine: tidak ada daftar sumber; terapkan ke editor', async () => {
    aiGenerate.mockResolvedValue({ ...draft, sources: [] })
    const onApply = vi.fn()
    render(<AiPostGeneratorModal onClose={vi.fn()} onSaved={vi.fn()} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik'), 'x')
    await userEvent.click(screen.getByLabelText('Sertakan penelusuran web'))
    await userEvent.click(screen.getByText('Generate Artikel'))
    await screen.findByText('Artikel AI')
    expect(aiGenerate).toHaveBeenCalledWith(expect.objectContaining({ include_web_search: false }))
    expect(screen.queryByText('Sumber Penelusuran')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(onApply).toHaveBeenCalledWith({ ...draft, sources: [] })
  })

  it('error generate, error simpan, status memuat, dan Batal', async () => {
    let reject
    aiGenerate.mockReturnValueOnce(new Promise((_, r) => (reject = r)))
    const onClose = vi.fn()
    render(<AiPostGeneratorModal onClose={onClose} onSaved={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik'), 'x')
    await userEvent.click(screen.getByText('Generate Artikel'))
    expect(await screen.findByText('Menghasilkan…')).toBeDisabled()
    reject(new Error('AI down'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('AI down'))

    aiGenerate.mockResolvedValueOnce(draft)
    await userEvent.click(screen.getByText('Generate Artikel'))
    await screen.findByText('Artikel AI')
    createPost.mockRejectedValueOnce(new Error('simpan gagal'))
    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(alertError).toHaveBeenCalledWith('simpan gagal'))

    await userEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalled()
  })
})
