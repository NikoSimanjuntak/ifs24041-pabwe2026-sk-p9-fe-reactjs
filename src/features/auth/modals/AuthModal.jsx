import AuthPage from '../components/AuthPage'

/** Modal login cepat (dipakai dari navbar halaman publik). Form memakai id="login-username". */
export default function AuthModal({ onClose, onSuccess, onNavigate }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Login" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-50 dark:bg-slate-950">
        <button aria-label="Tutup" onClick={onClose} className="absolute right-3 top-3 rounded-full px-2 text-xl text-slate-500">
          ×
        </button>
        <AuthPage
          mode="login"
          onSuccess={onSuccess}
          onNavigate={(path) => {
            onClose()
            onNavigate(path)
          }}
        />
      </div>
    </div>
  )
}
