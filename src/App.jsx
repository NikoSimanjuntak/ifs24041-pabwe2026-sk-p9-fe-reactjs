import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import useTheme from './hooks/useTheme'
import { getToken, setToken } from './helpers/apiHelper'
import { getProfile, logout as logoutRequest } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'

// Rute yang memuat Toast UI (editor/viewer) dipisah agar halaman awal ringan.
const PublicArticleDetail = lazy(() => import('./features/blog/components/PublicArticleDetail'))
const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

const SIMPLE_ROUTES = ['/author', '/admin', '/login', '/register']

export function parseRoute(path) {
  if (path === '/' || path === '/public') return { name: 'home' }
  const detail = path.match(/^\/posts\/([^/]+)$/)
  if (detail) return { name: 'detail', slug: decodeURIComponent(detail[1]) }
  if (SIMPLE_ROUTES.includes(path)) return { name: path.slice(1) }
  return { name: 'notfound' }
}

/** Menentukan rute akhir berdasarkan status login (guard sederhana). */
export function resolvePath(path, user) {
  if (path === '/author' && !user) return '/login'
  if (path === '/admin' && !user) return '/login'
  if (path === '/admin' && user.role !== 'admin') return '/author'
  if ((path === '/login' || path === '/register') && user) return user.role === 'admin' ? '/admin' : '/author'
  return path
}

export default function App() {
  const { theme, toggleTheme, accent, setAccent } = useTheme()
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken())
  const [loginOpen, setLoginOpen] = useState(false)

  const navigate = useCallback((to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }, [])

  // popstate: tombol back/forward peramban
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // pulihkan sesi dari token yang tersimpan
  useEffect(() => {
    if (!getToken()) return
    getProfile()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  // token kedaluwarsa (401) dari apiHelper
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const effective = resolvePath(path, user)
  useEffect(() => {
    if (ready && effective !== path) navigate(effective, true)
  }, [ready, effective, path, navigate])

  const handleLogin = ({ token, user: me }) => {
    setToken(token)
    setUser(me)
    setLoginOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch {
      // token sudah tidak valid: tetap keluar di sisi klien
    }
    setToken(null)
    setUser(null)
    navigate('/')
  }

  const route = parseRoute(effective)

  let page
  if (!ready) page = <p className="px-6 py-10 text-slate-500">Memuat sesi…</p>
  else if (route.name === 'home') page = <PublicArticleList onNavigate={navigate} />
  else if (route.name === 'detail') page = <PublicArticleDetail slug={route.slug} onNavigate={navigate} />
  else if (route.name === 'author') page = <AuthorDashboard onNavigate={navigate} />
  else if (route.name === 'admin') page = <AdminDashboard onNavigate={navigate} />
  else if (route.name === 'login') page = <AuthPage mode="login" onSuccess={handleLogin} onNavigate={navigate} />
  else if (route.name === 'register') page = <AuthPage mode="register" onSuccess={() => navigate('/login')} onNavigate={navigate} />
  else
    page = (
      <div className="px-6 py-16 text-center">
        <h1 className="mb-2 text-3xl font-bold">404 — Halaman tidak ditemukan</h1>
        <button onClick={() => navigate('/')} className="font-semibold text-[var(--accent)]">Kembali ke beranda</button>
      </div>
    )

  return (
    <div className="min-h-screen">
      <StickyNavbar
        user={user}
        theme={theme}
        accent={accent}
        onAccent={setAccent}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />
      <main>
        <Suspense fallback={<p className="px-6 py-10 text-slate-500">Memuat halaman…</p>}>{page}</Suspense>
      </main>
      {loginOpen && <AuthModal onClose={() => setLoginOpen(false)} onSuccess={handleLogin} onNavigate={navigate} />}
    </div>
  )
}
