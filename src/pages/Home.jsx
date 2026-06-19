import { WORDBANKS } from '../data/wordbank-meta'
import { useStorage, todayKey } from '../context/StorageContext'
import LevelCard from '../components/LevelCard'
import { Link } from 'react-router-dom'

export default function Home() {
  const { stats, wrongWords, daily } = useStorage()
  const today = todayKey()
  const todayStats = stats.dailyStats[today] || { practiced: 0, correct: 0 }
  const todayAccuracy = todayStats.practiced > 0
    ? Math.round((todayStats.correct / todayStats.practiced) * 100)
    : 0

  const totalWrong = wrongWords.filter(w => !w.mastered).length
  const dailyStudied = daily.studied?.length || 0
  const dailyTotal = daily.words?.length || 0
  const dailyDone = daily.date === today && dailyTotal > 0

  return (
    <div className="space-y-8">
      {/* Hero 区 */}
      <div className="pt-4 md:pt-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🐦</span>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--ks-kinpaku)]">
            ZHIQUE WORDS
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-light text-[var(--ks-champagne)] leading-tight">
          增加你的英语词汇量
        </h1>
        <p className="mt-2 text-[var(--ks-text-muted)] text-sm md:text-base max-w-md">
          随机挖空 · 补全单词 · 错词复习 · 循序渐进
        </p>
      </div>

      {/* 今日概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="今日练习" value={todayStats.practiced} unit="词" color="gold" />
        <StatBox label="今日正确率" value={todayAccuracy} unit="%" color="patina" />
        <StatBox label="连续打卡" value={stats.streak} unit="天" color="gold" />
        <StatBox label="待复习错词" value={totalWrong} unit="词" color={totalWrong > 0 ? 'vermilion' : 'patina'} />
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink
          to="/practice"
          title="开始练习"
          desc="随机挖空补全"
          icon="✍️"
        />
        <QuickLink
          to="/daily"
          title={dailyDone ? `每日单词 ${dailyStudied}/${dailyTotal}` : '每日单词'}
          desc={dailyDone ? '继续今日学习' : '今日尚未开始'}
          icon="📅"
          highlight={!dailyDone}
        />
        <QuickLink
          to="/wrong-book"
          title="错词复习"
          desc={totalWrong > 0 ? `${totalWrong} 个待复习` : '暂无错词'}
          icon="🔁"
        />
      </div>

      {/* 词库选择 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[var(--ks-champagne)] font-medium">选择词库</h2>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">
            {WORDBANKS.length} 个等级
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORDBANKS.map(wb => (
            <LevelCard
              key={wb.id}
              wordbank={wb}
              progress={stats.levelProgress[wb.id]}
              wrongCount={wrongWords.filter(w => w.levelId === wb.id && !w.mastered).length}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, unit, color }) {
  const colorMap = {
    gold: 'var(--ks-kinpaku)',
    patina: 'var(--ks-patina)',
    vermilion: 'var(--ks-vermilion)',
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

function QuickLink({ to, title, desc, icon, highlight }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
        highlight
          ? 'border-[var(--ks-rule-strong)] bg-[var(--ks-kinpaku)]/5 hover:bg-[var(--ks-kinpaku)]/10'
          : 'border-[var(--ks-rule)] bg-[var(--ks-raised)] hover:border-[var(--ks-rule-strong)]'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--ks-champagne)] truncate">{title}</p>
        <p className="text-xs text-[var(--ks-text-faint)] truncate">{desc}</p>
      </div>
      <span className="text-[var(--ks-text-faint)]">→</span>
    </Link>
  )
}
