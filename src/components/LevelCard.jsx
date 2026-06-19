/**
 * 等级选择卡片
 */
import { Link } from 'react-router-dom'

export default function LevelCard({ wordbank, progress, wrongCount, index = 0 }) {
  const practiced = progress?.practiced || 0
  const total = progress?.total || 0
  const percent = total > 0 ? Math.min(100, (practiced / total) * 100) : 0

  return (
    <Link
      to={`/practice?level=${wordbank.id}`}
      className={`group block p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] hover:border-[var(--border-gold-strong)] hover:shadow-[var(--shadow-raised)] transition-all duration-500 animate-fade-in hover:-translate-y-1 stagger-${Math.min(index + 1, 8)}`}
    >
      {/* 顶部：图标 + 名称 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xl transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--border-gold)]">
            {wordbank.icon}
          </div>
          <div>
            <h3 className="text-[var(--text-bright)] font-semibold text-base group-hover:text-[var(--gold)] transition-colors duration-300">
              {wordbank.name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)] mt-0.5">
              {wordbank.nameEn}
            </p>
          </div>
        </div>
        {wrongCount > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-[var(--vermilion)]/40 text-[var(--vermilion-bright)] bg-[var(--vermilion-glow)]">
            {wrongCount} 错词
          </span>
        )}
      </div>

      {/* 描述 */}
      <p className="text-sm text-[var(--text-muted)] mb-4">{wordbank.description}</p>

      {/* 进度 */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-faint)]">
        <span>{total > 0 ? `${practiced} / ${total}` : `${wordbank.nameEn}`}</span>
        <span className="text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
          开始练习
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      {percent > 0 && (
        <div className="mt-2.5 h-1 w-full bg-[var(--bg-input)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)] rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </Link>
  )
}
