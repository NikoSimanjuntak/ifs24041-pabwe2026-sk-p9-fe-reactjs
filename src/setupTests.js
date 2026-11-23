import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill JSDOM yang dibutuhkan Toast UI Editor (matchMedia, canvas, selection/range).
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
HTMLCanvasElement.prototype.getContext = () => ({})
if (!document.createRange) {
  document.createRange = () => ({ setStart() {}, setEnd() {}, commonAncestorContainer: document.body })
}
Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
Range.prototype.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: function* () {} })
if (!document.getSelection) {
  document.getSelection = () => ({ removeAllRanges() {}, addRange() {}, rangeCount: 0 })
}

window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-accent')
  vi.restoreAllMocks()
})
