const CARDS = [
  ['total_articles', 'Total Artikel'],
  ['total_selesai', 'Total Selesai/Terbit'],
  ['belum_selesai', 'Belum Selesai/Draf'],
]

/** 3 kartu statistik penulis. */
export default function PostStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map(([key, label]) => (
        <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="text-sm text-slate-500">{label}</div>
          <div data-testid={`stat-${key}`} className="text-3xl font-extrabold text-[var(--accent)]">
            {stats[key]}
          </div>
        </div>
      ))}
    </div>
  )
}
