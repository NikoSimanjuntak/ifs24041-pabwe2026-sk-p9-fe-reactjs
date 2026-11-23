import { useEffect, useState } from 'react'

export const ACCENTS = ['indigo', 'emerald', 'rose', 'amber']

/** Tema gelap/terang + warna aksen, disimpan di localStorage dan diterapkan ke <html>. */
export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('delcom_theme') || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem('delcom_accent') || 'indigo')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('delcom_theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('delcom_accent', accent)
  }, [accent])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme, accent, setAccent }
}
