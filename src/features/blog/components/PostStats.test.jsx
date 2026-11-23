import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total_posts: 5, total_published: 3, total_draft: 2 }} />)
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Selesai/Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai/Draf')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total_posts')).toHaveTextContent('5')
    expect(screen.getByTestId('stat-total_published')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-total_draft')).toHaveTextContent('2')
  })
})
