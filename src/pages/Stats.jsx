import { useMemo } from 'react'
import { useStorage, todayKey } from '../context/StorageContext'
import { WORDBANKS } from '../data/wordbank-meta'

export default function Stats() {
  const { stats, wrongWords } = useStorage()
  const today = todayKey()

  // 最近 7 天数据
  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const key = date.toISOString().slice(0, 10)
      const dayData = stats.dailyStats[key] || { practiced: 0, correct: 0 }
      const accuracy = dayData.practiced > 0
        ? Math.round((dayData.correct / dayData.practiced) * 100)
        : 0
      days.push({
        key,
        label: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        practiced: dayData.practiced,
        correct: dayData.correct,
        accuracy,
        isToday: key === today,
      })
    }
    return days
  }, [stats.dailyStats, today])

  const maxPracticed = Math.max(...last7Days.map(d => d.practiced), 1)

  // 打卡日历（最近 30 天）
  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const key = date.toISOString().slice(0, 10)
      const dayData = stats.dailyStats[key] || { practiced: 0 }
      days.push({
        key,
        day: date.getDate(),
        practiced: dayData.practiced,
        isToday: key === today,
      })
    }
    return days
  }, [stats.dailyStats, today])

  const totalAccuracy = stats.totalPracticed > 0
    ? Math.round((stats.totalCorrect / stats.totalPracticed) * 100)
    : 0

  const totalWrong = wrongWords.filter(w => !w.mastered).length
  const masteredCount = wrongWords.filter(w => w.mastered).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl text-[var(--ks-champagne)] font-medium">学习统计</h1>
        <p className="text-sm text-[var(--ks-text-faint)] mt-1">追踪你的学习进度</p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="总练习" value={stats.totalPracticed} unit="词" color="gold" />
        <StatCard label="总正确率" value={totalAccuracy} unit="%" color="patina" />
        <StatCard label="连续打卡" value={stats.streak} unit="天" color="gold" />
        <StatCard label="已掌握" value={masteredCount} unit="词" color="patina" />
      </div>

      {/* 最近 7 天趋势 */}
      <div className="p-5 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--ks-champagne)]">最近 7 天</h2>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">
            练习趋势
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map(day => (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
              {/* 柱状图 */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    day.isToday ? 'bg-[var(--ks-kinpaku)]' : 'bg-[var(--ks-kinpaku-deep)]'
                  }`}
                  style={{
                    height: `${(day.practiced / maxPracticed) * 100}%`,
                    minHeight: day.practiced > 0 ? '4px' : '0',
                  }}
                  title={`${day.date}: ${day.practiced} 词, 正确率 ${day.accuracy}%`}
                />
              </div>
              {/* 标签 */}
              <span className={`text-[10px] font-mono ${day.isToday ? 'text-[var(--ks-kinpaku)]' : 'text-[var(--ks-text-faint)]'}`}>
                {day.label}
              </span>
              <span className="text-[10px] text-[var(--ks-text-muted)]">{day.practiced}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 打卡日历 */}
      <div className="p-5 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--ks-champagne)]">打卡日历</h2>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">
            最近 30 天
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {calendarDays.map(day => {
            const intensity = day.practiced === 0 ? 0
              : day.practiced < 5 ? 1
              : day.practiced < 15 ? 2
              : day.practiced < 30 ? 3
              : 4
            const bgColors = [
              'var(--ks-graphite)',
              'oklch(61% 0.085 78 / 0.3)',
              'oklch(61% 0.085 78 / 0.5)',
              'oklch(77% 0.13 82 / 0.7)',
              'var(--ks-kinpaku)',
            ]
            return (
              <div
                key={day.key}
                className={`aspect-square rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                  day.isToday ? 'ring-1 ring-[var(--ks-kinpaku)]' : ''
                }`}
                style={{ backgroundColor: bgColors[intensity] }}
                title={`${day.key}: ${day.practiced} 词`}
              >
                <span className={intensity >= 3 ? 'text-[var(--ks-lacquer-deep)]' : 'text-[var(--ks-text-faint)]'}>
                  {day.day}
                </span>
              </div>
            )
          })}
        </div>
        {/* 图例 */}
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-[var(--ks-text-faint)]">
          <span>少</span>
          {bgColors.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: c }} />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* 各词库进度 */}
      <div className="p-5 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)]">
        <h2 className="text-sm font-medium text-[var(--ks-champagne)] mb-4">词库进度</h2>
        <div className="space-y-3">
          {WORDBANKS.map(wb => {
            const progress = stats.levelProgress[wb.id] || { practiced: 0, total: 0 }
            const percent = progress.total > 0 ? Math.min(100, (progress.practiced / progress.total) * 100) : 0
            const wbWrong = wrongWords.filter(w => w.levelId === wb.id && !w.mastered).length
            return (
              <div key={wb.id} className="flex items-center gap-3">
                <span className="text-sm text-[var(--ks-text)] w-12 flex-shrink-0">{wb.name}</span>
                <div className="flex-1 h-2 bg-[var(--ks-graphite)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--ks-kinpaku)] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[var(--ks-text-faint)] w-20 text-right flex-shrink-0">
                  {progress.practiced}/{progress.total || '?'}
                </span>
                {wbWrong > 0 && (
                  <span className="text-xs text-[var(--ks-vermilion)] w-10 flex-shrink-0">
                    {wbWrong}错
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const bgColors = [
  'var(--ks-graphite)',
  'oklch(61% 0.085 78 / 0.3)',
  'oklch(61% 0.085 78 / 0.5)',
  'oklch(77% 0.13 82 / 0.7)',
  'var(--ks-kinpaku)',
]

function StatCard({ label, value, unit, color }) {
  const colorMap = {
    gold: 'var(--ks-kinpaku)',
    patina: 'var(--ks-patina)',
  }
  return (
    <div className="p-4 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)]">
      <p className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)] mb-1">{label}</p>
      <p className="text-2xl font-medium" style={{ color: colorMap[color] }}>
        {value}<span className="text-sm text-[var(--ks-text-muted)] ml-1">{unit}</span>
      </p>
    </div>
  )
}
