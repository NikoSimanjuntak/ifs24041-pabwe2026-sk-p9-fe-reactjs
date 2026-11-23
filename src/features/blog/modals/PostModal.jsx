import { useState } from 'react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import useInput from '../../../hooks/useInput'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'
import { CATEGORIES, createPost, updatePost } from '../api/blogApi'

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/**
 * Modal layar penuh penulisan artikel (Toast UI Editor).
 * `post` = mode edit; `draft` = nilai awal dari AI Generator; keduanya kosong = artikel baru.
 */
export default function PostModal({ post, draft, onClose, onSaved }) {
  const initial = { title: '', category: 'Umum', excerpt: '', cover_image_path: '', content: '', is_published: false, ...(post || draft) }
  const [title, onTitle] = useInput(initial.title)
  const [category, onCategory] = useInput(initial.category)
  const [excerpt, onExcerpt] = useInput(initial.excerpt)
  const [cover, onCover] = useInput(initial.cover_image_path)
  const [content, setContent] = useState(initial.content)
  const [published, setPublished] = useState(Boolean(initial.is_published))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      await alertError('Judul dan konten artikel wajib diisi')
      return
    }
    setSaving(true)
    const payload = { title, category, excerpt, content, cover_image_path: cover, is_published: published }
    try {
      if (post) await updatePost(post.id, payload)
      else await createPost(payload)
      await alertSuccess('Artikel berhasil disimpan')
      onSaved()
    } catch (err) {
      await alertError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Editor artikel" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex h-[94vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
        <header className="bg-indigo-700 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">{post ? 'Edit Artikel' : 'Artikel Baru'}</h2>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium md:col-span-2">
              Judul
              <input aria-label="Judul" className={`${field} mt-1`} value={title} onChange={onTitle} />
            </label>
            <label className="text-sm font-medium">
              Kategori
              <select aria-label="Kategori" className={`${field} mt-1`} value={category} onChange={onCategory}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Ringkasan (excerpt)
            <textarea aria-label="Ringkasan" rows={2} className={`${field} mt-1`} value={excerpt} onChange={onExcerpt} />
          </label>
          <label className="block text-sm font-medium">
            Lokasi gambar sampul
            <input aria-label="Gambar sampul" className={`${field} mt-1`} value={cover} onChange={onCover} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" aria-label="Terbitkan" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Terbitkan artikel
          </label>
          <div className="h-[28rem]">
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        </div>

        <footer className="flex justify-end gap-2 bg-slate-100 px-6 py-3 dark:bg-slate-800">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold dark:border-slate-600">Batal</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-indigo-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </footer>
      </div>
    </div>
  )
}
