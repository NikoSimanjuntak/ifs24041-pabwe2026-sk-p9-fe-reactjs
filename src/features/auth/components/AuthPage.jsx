import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { alertError, alertSuccess } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/**
 * Halaman login/registrasi.
 * - mode "login": onSuccess({ token, user })
 * - mode "register": onSuccess() setelah akun dibuat
 */
export default function AuthPage({ mode, onSuccess, onNavigate }) {
  const isLogin = mode === 'login'
  const [username, onUsername] = useInput('')
  const [email, onEmail] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        onSuccess(await login(username, password))
      } else {
        await register({ username, email, password })
        await alertSuccess('Registrasi berhasil, silakan login')
        onSuccess()
      }
    } catch (err) {
      await alertError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const prefix = isLogin ? 'login' : 'register'

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h1 className="text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>

        <label className="block text-sm font-medium" htmlFor={`${prefix}-username`}>
          Username{isLogin ? ' atau Email' : ''}
          <input id={`${prefix}-username`} className={`${inputClass} mt-1`} value={username} onChange={onUsername} required />
        </label>

        {!isLogin && (
          <label className="block text-sm font-medium" htmlFor="register-email">
            Email
            <input id="register-email" type="email" className={`${inputClass} mt-1`} value={email} onChange={onEmail} required />
          </label>
        )}

        <label className="block text-sm font-medium" htmlFor={`${prefix}-password`}>
          Password
          <input id={`${prefix}-password`} type="password" className={`${inputClass} mt-1`} value={password} onChange={onPassword} required />
        </label>

        <button
          id={`${prefix}-submit`}
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Memproses…' : isLogin ? 'Masuk' : 'Daftar'}
        </button>

        <p className="text-center text-sm">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button type="button" className="font-semibold text-[var(--accent)]" onClick={() => onNavigate(isLogin ? '/register' : '/login')}>
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </form>
    </div>
  )
}
