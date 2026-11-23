import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Editor (WYSIWYG/Markdown, pratinjau simultan, tema mengikuti <html data-theme>). */
export default function MarkdownEditor({ value, onChange }) {
  const host = useRef(null)
  const latestOnChange = useRef(onChange)
  latestOnChange.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: host.current,
      height: '100%',
      initialValue: value,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      usageStatistics: false,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task'],
        ['table', 'link', 'image'],
        ['code', 'codeblock'],
      ],
      events: { change: () => latestOnChange.current(editor.getMarkdown()) },
    })
    return () => editor.destroy()
    // Editor hanya dibuat sekali; nilai awal diambil saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={host} data-testid="markdown-editor" className="h-full" />
}
