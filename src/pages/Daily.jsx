import { useState, useEffect } from 'react'
import { WORDBANKS, getWordbank } from '../data/wordbank-meta'
import { useWordList } from '../hooks/useWordList'
import { useStorage, todayKey } from '../context/StorageContext'
import { pickRandomWords } from '../utils/blank'
import PronounceButton from '../components/PronounceButton'
import { Link } from 'react-router-dom'

export default function Daily() {
  const { daily, setDailyWords, markDailyStudied, settings } = useStorage()
  const [levelId, setLevelId] = useState(daily.levelId || 'cet4')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const wordbank = getWordbank(levelId)
  const { words, loading } = useWordList(wordbank?.file)
  const today = todayKey()

  const isTodayReady = daily.date === today && daily.words?.length > 0

  const generateDaily = () => {
    if (words.length === 0) return
    const count = settings.dailyCount || 10
    const picked = pickRandomWords(words, count)
    setDailyWords(picked, levelId)
    setCurrentIndex(0)
    setFlipped(false)
  }

  useEffect(() => {
    if (!isTodayReady && words.length > 0) {
      generateDaily()
    }
  }, [words, isTodayReady])

  const currentWord = daily.words?.[currentIndex]
  const isStudied = currentWord ? daily.studied?.includes(currentWord.word) : false

  const handleFlip = () => {
    setFlipped(!flipped)
    if (!flipped && currentWord) {
      markDailyStudied(currentWord.word)
    }
  }

  const handleNext = () => {
    if (currentIndex < (daily.words?.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1)
      setFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setFlipped(false)
    }
  }

  const progress = daily.words?.length > 0
    ? Math.round((daily.studied?.length / daily.words.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl text-[var(--text-bright)] font-semibold">每日单词</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono uppercase tracking-wider">
            Daily Words · 每天 {settings.dailyCount || 10} 词
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {WORDBANKS.map(wb => (
            <button
              key={wb.id}
              onClick={() => { setLevelId(wb.id); }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-300 ${
                levelId === wb.id
                  ? 'border-[var(--border-gold-strong)] text-[var(--gold)] bg-[var(--gold-glow)]'
                  : 'border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--border-gold)]'
              }`}
            >
              {wb.name}
            </button>
          ))}
          <button
            onClick={generateDaily}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border-gold-strong)] text-[var(--gold)] hover:bg-[var(--gold-glow)] transition-all duration-300 active:scale-95"
          >
            换一批
          </button>
        </div>
      </div>

      {/* 进度 */}
      <div className="flex items-center gap-4 animate-fade-in stagger-1">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[var(--text-faint)] uppercase tracking-wider">今日进度</span>
            <span className="text-[var(--gold)] font-semibold">{daily.studied?.length || 0} / {daily.words?.length || 0}</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-input)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)] rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 卡片区域 */}
      {loading ? (
        <div className="max-w-lg mx-auto">
          <div className="p-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)]">
            <div className="space-y-4">
              <div className="h-3 w-20 skeleton rounded mx-auto" />
              <div className="h-8 w-40 skeleton rounded mx-auto" />
              <div className="h-10 w-10 skeleton rounded-full mx-auto" />
            </div>
          </div>
        </div>
      ) : currentWord ? (
        <div className="max-w-lg mx-auto animate-fade-in stagger-2">
          {/* 翻转卡片 */}
          <div
            onClick={handleFlip}
            className="relative cursor-pointer select-none"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : '',
                minHeight: '300px',
              }}
            >
              {/* 正面：英文 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-raised)] hover:shadow-[var(--shadow-gold)] transition-shadow duration-500"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] mb-4">
                  WORD {currentIndex + 1} / {daily.words.length}
                </p>
                <p className="text-3xl md:text-5xl font-display font-medium text-[var(--text-bright)] text-center mb-4">
                  {currentWord.word}
                </p>
                <PronounceButton word={currentWord.word} size="lg" />
                <p className="mt-8 text-xs text-[var(--text-faint)] flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 15l-6 6M9 9l6-6M9 15l-6-6M15 9l6 6" strokeLinecap="round"/></svg>
                  点击卡片查看释义
                </p>
                {isStudied && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 text-[10px] font-medium rounded-full border border-[var(--patina)]/40 text-[var(--patina-bright)] bg-[var(--patina-glow)]">
                    ✓ 已学
                  </span>
                )}
              </div>

              {/* 背面：中文释义 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--gold)] bg-[var(--bg-deep)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)] mb-4">
                  释义 · MEANING
                </p>
                <p className="text-xl md:text-2xl text-[var(--text-bright)] text-center leading-relaxed font-display">
                  {currentWord.translations?.map(t => `${t.type || ''} ${t.translation}`).join('；')}
                </p>
                <p className="mt-4 text-lg text-[var(--text-muted)] font-mono">{currentWord.word}</p>
                <PronounceButton word={currentWord.word} size="md" />
                <p className="mt-8 text-xs text-[var(--text-faint)]">点击卡片翻回</p>
              </div>
            </div>
          </div>

          {/* 导航 */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 text-sm rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-gold)] hover:text-[var(--gold)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              ← 上一个
            </button>
            <span className="font-mono text-xs text-[var(--text-faint)]">
              {currentIndex + 1} / {daily.words.length}
            </span>
            {currentIndex < daily.words.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 text-sm rounded-xl border border-[var(--border-gold-strong)] text-[var(--gold)] hover:bg-[var(--gold-glow)] transition-all duration-300 active:scale-95"
              >
                下一个 →
              </button>
            ) : (
              <Link
                to="/practice"
                className="px-5 py-2.5 text-sm rounded-xl bg-[var(--gold)] text-[var(--bg-base)] font-semibold hover:bg-[var(--gold-bright)] hover:shadow-[var(--shadow-gold)] transition-all duration-300 active:scale-95"
              >
                去练习 →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 md:p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-scale-in">
          <p className="text-5xl mb-4 animate-float">📅</p>
          <p className="text-[var(--text-muted)] font-medium">点击"换一批"生成今日单词</p>
        </div>
      )}
    </div>
  )
}
