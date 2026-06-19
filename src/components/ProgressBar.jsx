/**
 * 进度条组件
 */
export default function ProgressBar({ current, total, color = 'gold' }) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0

  const colors = {
    gold: { bar: 'var(--gold)', glow: 'var(--gold-glow)' },
    patina: { bar: 'var(--patina)', glow: 'var(--patina-glow)' },
    vermilion: { bar: 'var(--vermilion)', glow: 'var(--vermilion-glow)' },
  }
  const c = colors[color] || colors.gold

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
          {current} / {total}
        </span>
        <span className="font-mono text-xs font-medium" style={{ color: c.bar }}>
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-[var(--bg-input)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${c.bar}, ${c.bar})`,
            boxShadow: `0 0 8px ${c.glow}`,
          }}
        />
      </div>
    </div>
  )
}
