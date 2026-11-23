import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput'

describe('useInput', () => {
  it('mengelola nilai input', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current[0]).toBe('awal')
    act(() => result.current[1]({ target: { value: 'baru' } }))
    expect(result.current[0]).toBe('baru')
    act(() => result.current[2]('lain'))
    expect(result.current[0]).toBe('lain')
  })

  it('nilai awal default string kosong', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
  })
})
