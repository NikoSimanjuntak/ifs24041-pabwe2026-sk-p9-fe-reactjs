# Delcom Blog — Frontend (ReactJS + Vite + Tailwind, port 5174)

```bash
npm install
npm run dev     # http://localhost:5174 (proxy /api -> http://localhost:8081)
npm test        # Vitest + coverage 100%
npm run build   # hasil di dist/ siap deploy ke hosting statis
```
Rute SPA: `/`, `/public`, `/posts/:slug`, `/author`, `/admin`, `/login`, `/register`
(sinkron dengan URL via `pushState`/`popstate`).
