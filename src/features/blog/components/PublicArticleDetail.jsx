import { useEffect, useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'
import { getPublicPost } from '../api/blogApi'

/** Halaman baca artikel (full width) dengan render Markdown. */
export default function PublicArticleDetail({ slug, onNavigate }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setPost(null)
    setError('')
    getPublicPost(slug).then(setPost).catch((err) => setError(err.message))
  }, [slug])

  const back = (
    <button onClick={() => onNavigate('/')} className="mb-4 text-sm font-semibold text-[var(--accent)]">
      ← Kembali ke beranda
    </button>
  )

  if (error) {
    return (
      <div className="w-full px-6 py-10">
        {back}
        <p role="alert" className="text-lg">{error}</p>
      </div>
    )
  }
  if (!post) return <p className="px-6 py-10 text-slate-500">Memuat artikel…</p>

  return (
    <article className="w-full px-6 py-8">
      {back}
      <span className="mb-3 inline-block rounded-full bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--accent)]">{post.category}</span>
      <h1 className="mb-2 text-4xl font-extrabold">{post.title}</h1>
      <p className="mb-6 text-sm text-slate-500">
        {post.author?.username ?? 'Anonim'} · {formatDate(post.published_at)} · {post.reading_time} menit baca
      </p>
      {post.cover_image_path && <img src={post.cover_image_path} alt={post.title} className="mb-6 max-h-[28rem] w-full rounded-2xl object-cover" />}
      <MarkdownViewer content={post.content} />
    </article>
  )
}
