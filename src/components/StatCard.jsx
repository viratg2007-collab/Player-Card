// A titled card holding a grid of stats. Each stat is { label, value, hint? }.
export default function StatCard({ title, accent = false, stats }) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line/60">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span
          className={
            'h-2.5 w-2.5 rounded-full ' + (accent ? 'bg-accent' : 'bg-slate-300')
          }
        />
        {title}
      </h2>
      <dl className="grid grid-cols-3 gap-x-3 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dd
              className={
                'text-xl font-semibold tabular-nums ' +
                (accent ? 'text-accent' : 'text-content')
              }
            >
              {s.value}
            </dd>
            <dt className="mt-0.5 text-[11px] leading-tight text-muted">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
