import { IconMoon, IconSun } from '@tabler/icons-react'
import { ACCENTS } from '../../../hooks/useTheme'

const swatch = { indigo: '#4f46e5', emerald: '#059669', rose: '#e11d48', amber: '#d97706' }

/** Navbar atas sticky (tanpa sidebar) untuk seluruh halaman. */
export default function StickyNavbar({ user, theme, accent, onAccent, onToggleTheme, onNavigate, onLogin, onLogout }) {
  const link = (path, label) => (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault()
        onNavigate(path)
      }}
      className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {label}
    </a>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <nav className="flex w-full items-center justify-between gap-3 px-4 py-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('/')
          }}
          className="text-lg font-extrabold text-[var(--accent)]"
        >
          Delcom Blog
        </a>

        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              aria-label={`Aksen ${a}`}
              onClick={() => onAccent(a)}
              style={{ background: swatch[a] }}
              className={`h-6 w-6 rounded-full ${accent === a ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
            />
          ))}
          <button aria-label="Ganti tema" onClick={onToggleTheme} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          {user ? (
            <>
              {link('/author', 'Workspace')}
              {user.role === 'admin' && link('/admin', 'Admin')}
              <button onClick={onLogout} className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                Logout
              </button>
            </>
          ) : (
            <>
              <button id="nav-login" onClick={onLogin} className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                Login
              </button>
              {link('/register', 'Register')}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
