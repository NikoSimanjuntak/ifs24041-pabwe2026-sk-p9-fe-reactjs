import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useTheme from './useTheme'

describe('useTheme', () => {
  it('default terang + aksen indigo dan diterapkan ke <html>', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.dataset.accent).toBe('indigo')
  })

  it('toggle tema dan ganti aksen tersimpan di localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('delcom_theme')).toBe('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.setAccent('rose'))
    expect(document.documentElement.dataset.accent).toBe('rose')
    expect(localStorage.getItem('delcom_accent')).toBe('rose')
  })

  it('memuat preferensi tersimpan', () => {
    localStorage.setItem('delcom_theme', 'dark')
    localStorage.setItem('delcom_accent', 'amber')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('amber')
  })
})
