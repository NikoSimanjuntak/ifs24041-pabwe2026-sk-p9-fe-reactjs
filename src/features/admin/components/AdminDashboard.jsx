import { useEffect, useState } from 'react'
import { alertError, formatDate } from '../../../helpers/toolsHelper'
import { listPosts, listUserPosts, listUsers } from '../api/adminApi'

/** Panel admin (full width): ringkasan pengguna + arsip seluruh artikel. */
export default function AdminDashboard({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setUsers(await listUsers())
      } catch (err) {
        await alertError(err.message)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setPosts(selected ? await listUserPosts(selected.id) : await listPosts())
      } catch (err) {
        await alertError(err.message)
      }
    })()
  }, [selected])

  const totalPosts = users.reduce((sum, u) => sum + u.total_posts, 0)
  const totalPublished = users.reduce((sum, u) => sum + u.total_published, 0)
  const cards = [
    ['Total Pengguna', users.length],
    ['Total Artikel', totalPosts],
    ['Total Terbit', totalPublished],
  ]

  return (
    <section className="w-full px-6 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Panel Administrasi</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-3xl font-extrabold text-[var(--accent)]">{value}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-2 text-xl font-bold">Direktori Pengguna</h2>
      <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase dark:bg-slate-800">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Total Artikel</th>
              <th className="p-3">Total Terbit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="p-3">{u.id}</td>
                <td className="p-3">
                  <button onClick={() => setSelected(u)} className="font-semibold text-[var(--accent)] underline">{u.username}</button>
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                </td>
                <td className="p-3">{u.total_posts}</td>
                <td className="p-3">{u.total_published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold">{selected ? `Artikel milik ${selected.username}` : 'Arsip Seluruh Artikel'}</h2>
        {selected && (
          <button onClick={() => setSelected(null)} className="text-sm font-semibold text-[var(--accent)]">Tampilkan semua</button>
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase dark:bg-slate-800">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Penulis</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Status</th>
              <th className="p-3">Dibuat</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="p-3 font-semibold">{p.title}</td>
                <td className="p-3">{p.author?.username ?? '-'}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
                <td className="p-3">{formatDate(p.created_at)}</td>
                <td className="p-3">
                  {p.is_published && (
                    <button onClick={() => onNavigate(`/posts/${p.slug}`)} className="font-semibold text-[var(--accent)]">Baca</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
