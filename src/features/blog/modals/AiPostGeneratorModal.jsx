import { useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import useInput from '../../../hooks/useInput'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'
import { CATEGORIES, aiGenerate, createPost } from '../api/blogApi'

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/** Modal layar penuh AI Blog Generator dengan opsi penelusuran Search Engine. */
export default function AiPostGeneratorModal({ onClose, onSaved, onApply }) {
  const [topic, onTopic] = useInput('')
  const [category, onCategory] = useInput('Umum')
  const [webSearch, setWebSearch] = useState(true)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!topic.trim()) {
      await alertError('Topik artikel wajib diisi')
      return
    }
    setLoading(true)
    try {
      setDraft(await aiGenerate({ topic, category, include_web_search: webSearch }))
    } catch (err) {
      await alertError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async () => {
    try {
      await createPost({ title: draft.title, category: draft.category, excerpt: draft.excerpt, content: draft.content, is_published: false })
      await alertSuccess('Draf artikel tersimpan')
      onSaved()
    } catch (err) {
      await alertError(err.message)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="AI Generator" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex h-[94vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
        <header className="bg-violet-700 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">AI Blog Generator</h2>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium md:col-span-2">
              Topik
              <input aria-label="Topik" className={`${field} mt-1`} value={topic} onChange={onTopic} placeholder="mis. Tren AI di pendidikan 2026" />
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
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" aria-label="Sertakan penelusuran web" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} />
            Sertakan penelusuran Search Engine (informasi terkini + sumber rujukan)
          </label>
          <button onClick={generate} disabled={loading} className="rounded-lg bg-violet-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
            {loading ? 'Menghasilkan…' : 'Generate Artikel'}
          </button>

          {draft && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-2xl font-bold">{draft.title}</h3>
              <p className="text-sm text-slate-500">{draft.category} — {draft.excerpt}</p>
              <MarkdownViewer content={draft.content} />
              {draft.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold">Sumber Penelusuran</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {draft.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">{s.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 bg-slate-100 px-6 py-3 dark:bg-slate-800">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold dark:border-slate-600">Batal</button>
          <button disabled={!draft} onClick={() => onApply(draft)} className="rounded-lg border border-violet-700 px-4 py-2 font-semibold text-violet-700 disabled:opacity-50">
            Terapkan ke Editor
          </button>
          <button disabled={!draft} onClick={saveDraft} className="rounded-lg bg-violet-700 px-5 py-2 font-semibold text-white disabled:opacity-50">Simpan</button>
        </footer>
      </div>
    </div>
  )
}
