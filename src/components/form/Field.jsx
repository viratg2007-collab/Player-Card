// Small, consistent form primitives shared across the app. Kept deliberately
// plain — labels above controls, navy focus ring, mobile-friendly tap targets.

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-ink ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 ' +
  'placeholder:text-slate-400'

export function TextField({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
        {...rest}
      />
    </label>
  )
}

export function NumberField({ label, value, onChange, min = 0, step = 1, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase + ' tabular-nums'}
        {...rest}
      />
    </label>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase + ' appearance-none'}
      >
        {options.map((opt) => {
          const o = typeof opt === 'string' ? { value: opt, label: opt } : opt
          return (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )
        })}
      </select>
    </label>
  )
}

// Yes/No segmented toggle used to enable the Batting / Bowling sections in one
// tap.
export function ToggleField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-semibold text-ink">{label}</span>
      <div className="inline-flex rounded-xl bg-slate-100 p-0.5">
        {[
          { v: true, t: 'Yes' },
          { v: false, t: 'No' },
        ].map(({ v, t }) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(v)}
            className={
              'rounded-lg px-4 py-1.5 text-sm font-medium transition ' +
              (value === v
                ? 'bg-white text-ink shadow-sm'
                : 'text-slate-500')
            }
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
