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
      <div className="pt-6 md:pt-10 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-float">🐦</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
            Zhique Words
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light text-[var(--text-bright)] leading-tight">
          增加你的<br/>
          <span className="text-gradient-gold font-medium">英语词汇量</span>
        </h1>
        <p className="mt-3 text-[var(--text-muted)] text-sm md:text-base max-w-md">
          随机挖空 · 补全单词 · 发音朗读 · 错词复习 · 循序渐进
        </p>
      </div>

      {/* 今日概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="今日练习" value={todayStats.practiced} unit="词" color="gold" delay="stagger-1" />
        <StatBox label="今日正确率" value={todayAccuracy} unit="%" color="patina" delay="stagger-2" />
        <StatBox label="连续打卡" value={stats.streak} unit="天" color="gold" delay="stagger-3" />
        <StatBox label="待复习错词" value={totalWrong} unit="词" color={totalWrong > 0 ? 'vermilion' : 'patina'} delay="stagger-4" />
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickLink
          to="/practice"
          title="开始练习"
          desc="随机挖空补全"
          icon="✍️"
          delay="stagger-1"
        />
        <QuickLink
          to="/daily"
          title={dailyDone ? `每日单词 ${dailyStudied}/${dailyTotal}` : '每日单词'}
          desc={dailyDone ? '继续今日学习' : '今日尚未开始'}
          icon="📅"
          highlight={!dailyDone}
          delay="stagger-2"
        />
        <QuickLink
          to="/wrong-book"
          title="错词复习"
          desc={totalWrong > 0 ? `${totalWrong} 个待复习` : '暂无错词'}
          icon="🔁"
          delay="stagger-3"
        />
      </div>

      {/* 词库选择 */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg text-[var(--text-bright)] font-medium">选择词库</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">
            {WORDBANKS.length} 个等级
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORDBANKS.map((wb, i) => (
            <LevelCard
              key={wb.id}
              wordbank={wb}
              progress={stats.levelProgress[wb.id]}
              wrongCount={wrongWords.filter(w => w.levelId === wb.id && !w.mastered).length}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, unit, color, delay = '' }) {
  const colorMap = {
    gold: 'var(--gold)',
    patina: 'var(--patina-bright)',
    vermilion: 'var(--vermilion-bright)',
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

function QuickLink({ to, title, desc, icon, highlight, delay = '' }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 animate-fade-in card-hover ${delay} ${
        highlight
          ? 'border-[var(--border-gold-strong)] bg-[var(--gold-glow)] hover:bg-[var(--gold-glow)] hover:shadow-[var(--shadow-gold)]'
          : 'border-[var(--border)] bg-[var(--bg-raised)] hover:border-[var(--border-gold)]'
      }`}
    >
      <span className="text-2xl transition-transform duration-300 hover:scale-110">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-bright)] truncate">{title}</p>
        <p className="text-xs text-[var(--text-faint)] truncate mt-0.5">{desc}</p>
      </div>
      <svg className="text-[var(--text-faint)] group-hover:text-[var(--gold)] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  )
}
