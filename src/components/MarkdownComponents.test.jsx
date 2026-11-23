import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const h = vi.hoisted(() => ({ editors: [], viewers: [] }))

vi.mock('@toast-ui/editor', () => ({
  default: class {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      this.getMarkdown = () => '# hasil'
      h.editors.push(this)
    }
  },
}))
vi.mock('@toast-ui/editor/viewer', () => ({
  default: class {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      h.viewers.push(this)
    }
  },
}))

describe('MarkdownEditor', () => {
  it('membuat editor, meneruskan perubahan, dan membersihkan saat unmount', () => {
    const onChange = vi.fn()
    const { unmount, getByTestId } = render(<MarkdownEditor value="# awal" onChange={onChange} />)
    const editor = h.editors.at(-1)
    expect(getByTestId('markdown-editor')).toBeInTheDocument()
    expect(editor.options.initialValue).toBe('# awal')
    expect(editor.options.theme).toBe('light')
    editor.options.events.change()
    expect(onChange).toHaveBeenCalledWith('# hasil')
    unmount()
    expect(editor.destroy).toHaveBeenCalled()
  })

  it('memakai tema gelap bila <html data-theme="dark">', () => {
    document.documentElement.dataset.theme = 'dark'
    render(<MarkdownEditor value="" onChange={() => {}} />)
    expect(h.editors.at(-1).options.theme).toBe('dark')
  })
})

describe('MarkdownViewer', () => {
  it('membuat viewer, membuat ulang saat konten berubah, dan membersihkan', () => {
    const { rerender, unmount, getByTestId } = render(<MarkdownViewer content="satu" />)
    expect(getByTestId('markdown-viewer')).toBeInTheDocument()
    const first = h.viewers.at(-1)
    expect(first.options.initialValue).toBe('satu')
    rerender(<MarkdownViewer content="dua" />)
    expect(first.destroy).toHaveBeenCalled()
    const second = h.viewers.at(-1)
    expect(second.options.initialValue).toBe('dua')
    unmount()
    expect(second.destroy).toHaveBeenCalled()
  })
})
