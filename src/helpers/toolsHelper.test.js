import { describe, expect, it, vi } from 'vitest'
import Swal from 'sweetalert2'
import { alertError, alertSuccess, confirmDialog, formatDate } from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('toolsHelper', () => {
  it('alertSuccess & alertError membuka dialog', () => {
    alertSuccess('ok')
    alertError('gagal')
    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: 'success', text: 'ok' }))
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: 'error', text: 'gagal' }))
  })

  it('confirmDialog mengembalikan pilihan pengguna', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await confirmDialog('hapus?')).toBe(true)
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await confirmDialog('hapus?')).toBe(false)
  })

  it('formatDate', () => {
    expect(formatDate('2026-11-19T10:00:00Z')).toMatch(/2026/)
    expect(formatDate(null)).toBe('-')
  })
})
