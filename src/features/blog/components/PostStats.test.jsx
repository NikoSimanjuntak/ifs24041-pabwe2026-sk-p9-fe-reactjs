import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total_articles: 5, total_selesai: 3, belum_selesai: 2 }} />)
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Selesai/Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai/Draf')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total_articles')).toHaveTextContent('5')
    expect(screen.getByTestId('stat-total_selesai')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-belum_selesai')).toHaveTextContent('2')
  })
})
