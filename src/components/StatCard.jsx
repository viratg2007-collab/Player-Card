// A titled card holding a grid of stats. Each stat is { label, value, hint? }.
export default function StatCard({ title, accent = false, stats }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <dl className="grid grid-cols-3 gap-x-3 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dd
              className={
                'text-xl font-semibold tabular-nums ' +
                (accent ? 'text-accent' : 'text-ink')
              }
            >
              {s.value}
            </dd>
            <dt className="mt-0.5 text-[11px] leading-tight text-slate-500">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
