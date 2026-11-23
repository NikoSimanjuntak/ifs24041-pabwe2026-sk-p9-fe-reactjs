import { useEffect, useRef, useState } from 'react'
import useInput from '../../../hooks/useInput'
import { alertError, formatDate } from '../../../helpers/toolsHelper'
import { CATEGORIES, listPublicPosts } from '../api/blogApi'

const DEBOUNCE_MS = 300
const PILLS = ['Semua', ...CATEGORIES]

/** Galeri artikel publik: pencarian real-time (debounce) + filter kategori berbentuk pill. */
export default function PublicArticleList({ onNavigate }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, onQ] = useInput('')
  const [category, setCategory] = useState('Semua')
  const latest = useRef(0)

  useEffect(() => {
    const timer = setTimeout(async () => {
      const id = ++latest.current
      setLoading(true)
      try {
        const data = await listPublicPosts({ q, category: category === 'Semua' ? '' : category })
        if (id === latest.current) setPosts(data) // abaikan respons usang
      } catch (err) {
        await alertError(err.message)
      } finally {
        if (id === latest.current) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [q, category])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-extrabold">Artikel Terbaru</h1>
      <p className="mb-6 text-slate-500">Bacaan pilihan dari para penulis Delcom Blog.</p>

      <input
        type="search"
        aria-label="Cari artikel"
        placeholder="Cari artikel…"
        value={q}
        onChange={onQ}
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {PILLS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full border px-4 py-1 text-sm ${
              category === c ? 'border-transparent bg-[var(--accent)] text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {posts.length === 0 && <p className="py-12 text-center text-slate-500">{loading ? 'Memuat artikel…' : 'Tidak ada artikel ditemukan.'}</p>}

      <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
        {posts.map((p) => (
          <a
            key={p.id}
            href={`/posts/${p.slug}`}
            onClick={(e) => {
              e.preventDefault()
              onNavigate(`/posts/${p.slug}`)
            }}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="mb-2 w-fit rounded-full bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--accent)]">{p.category}</span>
            <h2 className="mb-2 text-lg font-bold">{p.title}</h2>
            <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-300">{p.excerpt}</p>
            <div className="text-xs text-slate-500">
              {p.author?.username ?? 'Anonim'} · {formatDate(p.published_at)} · {p.reading_time} menit baca
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
