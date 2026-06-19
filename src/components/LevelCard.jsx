/**
 * 等级选择卡片
 */
import { Link } from 'react-router-dom'

export default function LevelCard({ wordbank, progress, wrongCount }) {
  const practiced = progress?.practiced || 0
  const total = progress?.total || 0
  const percent = total > 0 ? Math.min(100, (practiced / total) * 100) : 0

  return (
    <Link
      to={`/practice?level=${wordbank.id}`}
      className="group block p-5 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)] hover:border-[var(--ks-rule-strong)] transition-all duration-300"
    >
      {/* 顶部：图标 + 名称 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{wordbank.icon}</span>
          <div>
            <h3 className="text-[var(--ks-champagne)] font-medium text-base group-hover:text-[var(--ks-kinpaku)] transition-colors">
              {wordbank.name}
            </h3>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)] mt-0.5">
              {wordbank.nameEn}
            </p>
          </div>
        </div>
        {wrongCount > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full border border-[var(--ks-vermilion)]/40 text-[var(--ks-vermilion)] bg-[var(--ks-vermilion)]/8">
            {wrongCount} 错词
          </span>
        )}
      </div>

      {/* 描述 */}
      <p className="text-sm text-[var(--ks-text-muted)] mb-4">{wordbank.description}</p>

      {/* 进度 */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--ks-text-faint)]">
        <span>{total > 0 ? `${practiced} / ${total}` : `${wordbank.nameEn}`}</span>
        <span className="text-[var(--ks-kinpaku)] opacity-0 group-hover:opacity-100 transition-opacity">
          开始练习 →
        </span>
      </div>
      {percent > 0 && (
        <div className="mt-2 h-0.5 w-full bg-[var(--ks-graphite)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--ks-kinpaku)] rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </Link>
  )
}
