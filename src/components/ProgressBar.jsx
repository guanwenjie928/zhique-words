/**
 * 进度条组件
 */
export default function ProgressBar({ current, total, color = 'gold' }) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0

  const colorMap = {
    gold: 'var(--ks-kinpaku)',
    patina: 'var(--ks-patina)',
    vermilion: 'var(--ks-vermilion)',
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">
          {current} / {total}
        </span>
        <span className="text-xs font-mono text-[var(--ks-text-muted)]">
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-1 w-full bg-[var(--ks-graphite)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: colorMap[color],
          }}
        />
      </div>
    </div>
  )
}
