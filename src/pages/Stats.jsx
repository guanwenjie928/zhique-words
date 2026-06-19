import { useMemo } from 'react'
import { useStorage, todayKey } from '../context/StorageContext'
import { WORDBANKS } from '../data/wordbank-meta'

export default function Stats() {
  const { stats, wrongWords } = useStorage()
  const today = todayKey()

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
      <div className="animate-fade-in">
        <h1 className="text-xl md:text-2xl text-[var(--text-bright)] font-semibold">学习统计</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono uppercase tracking-wider">
          Track Your Progress
        </p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="总练习" value={stats.totalPracticed} unit="词" color="gold" delay="stagger-1" />
        <StatCard label="总正确率" value={totalAccuracy} unit="%" color="patina" delay="stagger-2" />
        <StatCard label="连续打卡" value={stats.streak} unit="天" color="gold" delay="stagger-3" />
        <StatCard label="已掌握" value={masteredCount} unit="词" color="patina" delay="stagger-4" />
      </div>

      {/* 最近 7 天趋势 */}
      <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-fade-in stagger-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[var(--text-bright)]">最近 7 天</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
            练习趋势
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-36">
          {last7Days.map((day, i) => (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{day.practiced > 0 ? day.practiced : ''}</span>
              {/* 柱状图 */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                    day.isToday
                      ? 'bg-gradient-to-t from-[var(--gold-deep)] to-[var(--gold)]'
                      : 'bg-gradient-to-t from-[var(--bg-elevated)] to-[var(--bg-hover)]'
                  }`}
                  style={{
                    height: `${(day.practiced / maxPracticed) * 100}%`,
                    minHeight: day.practiced > 0 ? '6px' : '2px',
                    animationDelay: `${i * 50}ms`,
                  }}
                  title={`${day.date}: ${day.practiced} 词, 正确率 ${day.accuracy}%`}
                />
              </div>
              {/* 标签 */}
              <span className={`text-[10px] font-mono ${day.isToday ? 'text-[var(--gold)] font-semibold' : 'text-[var(--text-faint)]'}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 打卡日历 */}
      <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-fade-in stagger-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[var(--text-bright)]">打卡日历</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
            最近 30 天
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {calendarDays.map((day, i) => {
            const intensity = day.practiced === 0 ? 0
              : day.practiced < 5 ? 1
              : day.practiced < 15 ? 2
              : day.practiced < 30 ? 3
              : 4
            const bgColors = [
              'var(--bg-input)',
              'rgba(232, 184, 100, 0.15)',
              'rgba(232, 184, 100, 0.3)',
              'rgba(232, 184, 100, 0.55)',
              'var(--gold)',
            ]
            return (
              <div
                key={day.key}
                className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-mono transition-all duration-300 hover:scale-110 ${
                  day.isToday ? 'ring-2 ring-[var(--gold)] ring-offset-1 ring-offset-[var(--bg-raised)]' : ''
                }`}
                style={{ backgroundColor: bgColors[intensity] }}
                title={`${day.key}: ${day.practiced} 词`}
              >
                <span className={intensity >= 3 ? 'text-[var(--bg-base)] font-semibold' : 'text-[var(--text-faint)]'}>
                  {day.day}
                </span>
              </div>
            )
          })}
        </div>
        {/* 图例 */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-mono text-[var(--text-faint)]">
          <span>少</span>
          {['var(--bg-input)', 'rgba(232, 184, 100, 0.15)', 'rgba(232, 184, 100, 0.3)', 'rgba(232, 184, 100, 0.55)', 'var(--gold)'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: c }} />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* 各词库进度 */}
      <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-fade-in stagger-4">
        <h2 className="text-sm font-semibold text-[var(--text-bright)] mb-5">词库进度</h2>
        <div className="space-y-3">
          {WORDBANKS.map(wb => {
            const progress = stats.levelProgress[wb.id] || { practiced: 0, total: 0 }
            const percent = progress.total > 0 ? Math.min(100, (progress.practiced / progress.total) * 100) : 0
            const wbWrong = wrongWords.filter(w => w.levelId === wb.id && !w.mastered).length
            return (
              <div key={wb.id} className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-base)] w-12 flex-shrink-0 font-medium">{wb.name}</span>
                <div className="flex-1 h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)] rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-faint)] w-20 text-right flex-shrink-0">
                  {progress.practiced}/{progress.total || '?'}
                </span>
                {wbWrong > 0 && (
                  <span className="text-[10px] text-[var(--vermilion-bright)] w-10 flex-shrink-0 font-mono">
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

function StatCard({ label, value, unit, color, delay = '' }) {
  const colorMap = {
    gold: 'var(--gold)',
    patina: 'var(--patina-bright)',
  }
  return (
    <div className={`p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] card-hover animate-fade-in ${delay}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)] mb-1.5">{label}</p>
      <p className="text-2xl font-display font-medium" style={{ color: colorMap[color] }}>
        {value}<span className="text-sm text-[var(--text-muted)] ml-1 font-body font-normal">{unit}</span>
      </p>
    </div>
  )
}
