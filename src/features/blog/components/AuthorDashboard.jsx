import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import { alertError, alertSuccess, confirmDialog, formatDate } from '../../../helpers/toolsHelper'
import { deletePost, getStats, listMyPosts, togglePublish } from '../api/blogApi'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'

const EMPTY_STATS = { total_posts: 0, total_published: 0, total_draft: 0 }

/** Workspace penulis (full width): statistik, tabel artikel, toggle publikasi, menu kebab. */
export default function AuthorDashboard({ onNavigate }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [menuId, setMenuId] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'post', post?, draft? } | { type: 'ai' }

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([listMyPosts(), getStats()])
      setPosts(p)
      setStats(s)
    } catch (err) {
      await alertError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (post) => {
    try {
      await togglePublish(post.id)
      await load()
    } catch (err) {
      await alertError(err.message)
    }
  }

  const remove = async (post) => {
    setMenuId(null)
    if (!(await confirmDialog(`Hapus artikel "${post.title}"?`))) return
    try {
      await deletePost(post.id)
      await alertSuccess('Artikel dihapus')
      await load()
    } catch (err) {
      await alertError(err.message)
    }
  }

  const edit = (post) => {
    setMenuId(null)
    setModal({ type: 'post', post })
  }

  const savedAndReload = async () => {
    setModal(null)
    await load()
  }

  return (
    <section className="w-full px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Workspace Penulis</h1>
        <div className="flex gap-2">
          <button onClick={() => setModal({ type: 'ai' })} className="flex items-center gap-1 rounded-lg border border-[var(--accent)] px-4 py-2 font-semibold text-[var(--accent)]">
            <IconSparkles size={18} /> AI Generator
          </button>
          <button onClick={() => setModal({ type: 'post' })} className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white">
            <IconPlus size={18} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase dark:bg-slate-800">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Terbit</th>
              <th className="p-3">Dibuat</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">Belum ada artikel.</td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="p-3 font-semibold">{p.title}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">
                  <button
                    role="switch"
                    aria-checked={p.is_published}
                    aria-label={`Terbitkan ${p.title}`}
                    onClick={() => toggle(p)}
                    className={`relative h-6 w-11 rounded-full transition ${p.is_published ? 'bg-[var(--accent)]' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${p.is_published ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="p-3">{formatDate(p.created_at)}</td>
                <td className="relative p-3 text-right">
                  <button aria-label={`Menu ${p.title}`} onClick={() => setMenuId(menuId === p.id ? null : p.id)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <IconDotsVertical size={18} />
                  </button>
                  {menuId === p.id && (
                    <div role="menu" className="absolute right-3 z-10 mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg dark:border-slate-700 dark:bg-slate-800">
                      <button role="menuitem" onClick={() => edit(p)} className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700">Edit</button>
                      {p.is_published && (
                        <button role="menuitem" onClick={() => onNavigate(`/posts/${p.slug}`)} className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700">Lihat</button>
                      )}
                      <button role="menuitem" onClick={() => remove(p)} className="block w-full px-4 py-2 text-left text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700">Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'post' && <PostModal post={modal.post} draft={modal.draft} onClose={() => setModal(null)} onSaved={savedAndReload} />}
      {modal?.type === 'ai' && (
        <AiPostGeneratorModal onClose={() => setModal(null)} onSaved={savedAndReload} onApply={(draft) => setModal({ type: 'post', draft })} />
      )}
    </section>
  )
}
