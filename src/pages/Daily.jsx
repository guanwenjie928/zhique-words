import { useState, useEffect, useMemo } from 'react'
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

  // 生成每日单词
  const generateDaily = () => {
    if (words.length === 0) return
    const count = settings.dailyCount || 10
    const picked = pickRandomWords(words, count)
    setDailyWords(picked, levelId)
    setCurrentIndex(0)
    setFlipped(false)
  }

  // 自动生成
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl text-[var(--ks-champagne)] font-medium">每日单词</h1>
          <p className="text-sm text-[var(--ks-text-faint)] mt-1">
            每天 {settings.dailyCount || 10} 个新词，循序渐进
          </p>
        </div>
        {/* 等级选择 */}
        <div className="flex items-center gap-2 flex-wrap">
          {WORDBANKS.map(wb => (
            <button
              key={wb.id}
              onClick={() => { setLevelId(wb.id); }}
              className={`px-3 py-1 text-xs rounded border transition-all ${
                levelId === wb.id
                  ? 'border-[var(--ks-rule-strong)] text-[var(--ks-kinpaku)] bg-[var(--ks-kinpaku)]/8'
                  : 'border-[var(--ks-rule)] text-[var(--ks-text-faint)] hover:border-[var(--ks-rule-strong)]'
              }`}
            >
              {wb.name}
            </button>
          ))}
          <button
            onClick={generateDaily}
            className="px-3 py-1 text-xs rounded border border-[var(--ks-rule-strong)] text-[var(--ks-kinpaku)] hover:bg-[var(--ks-kinpaku)]/10 transition-colors"
          >
            换一批
          </button>
        </div>
      </div>

      {/* 进度 */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[var(--ks-text-faint)]">今日进度</span>
            <span className="text-[var(--ks-kinpaku)]">{daily.studied?.length || 0} / {daily.words?.length || 0}</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--ks-graphite)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ks-kinpaku)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 卡片区域 */}
      {loading ? (
        <div className="p-12 text-center text-[var(--ks-text-muted)]">
          <div className="inline-block animate-spin text-2xl mb-3">⟳</div>
          <p>加载词库中…</p>
        </div>
      ) : currentWord ? (
        <div className="max-w-lg mx-auto">
          {/* 翻转卡片 */}
          <div
            onClick={handleFlip}
            className="relative cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : '',
                minHeight: '280px',
              }}
            >
              {/* 正面：英文 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-lg border border-[var(--ks-rule-strong)] bg-[var(--ks-raised)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--ks-text-faint)] mb-4">
                  WORD {currentIndex + 1} / {daily.words.length}
                </p>
                <p className="text-3xl md:text-4xl font-medium text-[var(--ks-champagne)] text-center mb-4">
                  {currentWord.word}
                </p>
                <PronounceButton word={currentWord.word} size="lg" />
                <p className="mt-6 text-xs text-[var(--ks-text-faint)]">点击卡片查看释义</p>
                {isStudied && (
                  <span className="absolute top-3 right-3 text-xs text-[var(--ks-patina)]">✓ 已学</span>
                )}
              </div>

              {/* 背面：中文释义 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-lg border border-[var(--ks-kinpaku)] bg-[var(--ks-lacquer-deep)]"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--ks-kinpaku)] mb-4">
                  释义
                </p>
                <p className="text-xl md:text-2xl text-[var(--ks-champagne)] text-center leading-relaxed">
                  {currentWord.translations?.map(t => `${t.type || ''} ${t.translation}`).join('；')}
                </p>
                <p className="mt-4 text-lg text-[var(--ks-text-muted)]">{currentWord.word}</p>
                <PronounceButton word={currentWord.word} size="md" />
                <p className="mt-6 text-xs text-[var(--ks-text-faint)]">点击卡片翻回</p>
              </div>
            </div>
          </div>

          {/* 导航 */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-sm rounded border border-[var(--ks-rule)] text-[var(--ks-text-muted)] hover:border-[var(--ks-rule-strong)] hover:text-[var(--ks-kinpaku)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← 上一个
            </button>
            <span className="text-xs font-mono text-[var(--ks-text-faint)]">
              {currentIndex + 1} / {daily.words.length}
            </span>
            {currentIndex < daily.words.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm rounded border border-[var(--ks-rule-strong)] text-[var(--ks-kinpaku)] hover:bg-[var(--ks-kinpaku)]/10 transition-colors"
              >
                下一个 →
              </button>
            ) : (
              <Link
                to="/practice"
                className="px-4 py-2 text-sm rounded border border-[var(--ks-rule-strong)] bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)] hover:bg-[var(--ks-kinpaku-rich)] transition-colors"
              >
                去练习 →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-[var(--ks-text-muted)]">点击"换一批"生成今日单词</p>
        </div>
      )}
    </div>
  )
}
