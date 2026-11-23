import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

/** Wrapper Toast UI Viewer untuk merender konten Markdown artikel. */
export default function MarkdownViewer({ content }) {
  const host = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({ el: host.current, initialValue: content })
    return () => viewer.destroy()
  }, [content])

  return <div ref={host} data-testid="markdown-viewer" className="prose max-w-none" />
}
