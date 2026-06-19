import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WORDBANKS, getWordbank } from '../data/wordbank-meta'
import { useWordList } from '../hooks/useWordList'
import { useStorage } from '../context/StorageContext'
import { shuffle, pickRandomWords } from '../utils/blank'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'

export default function Practice() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [levelId, setLevelId] = useState(searchParams.get('level') || 'cet4')
  const [mode, setMode] = useState('spelling')
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [reviewMode, setReviewMode] = useState(false)

  const wordbank = getWordbank(levelId)
  const { words, loading, error } = useWordList(reviewMode ? null : wordbank?.file)
  const { settings, addWrongWord, recordPractice, setLevelTotal, wrongWords } = useStorage()

  // 用 ref 保存 wrongWords，避免 wrongWords 变化导致队列重新生成
  const wrongWordsRef = useRef(wrongWords)
  wrongWordsRef.current = wrongWords

  // 用 ref 保存是否已初始化过队列，防止重复生成
  const queueInitialized = useRef(false)

  useEffect(() => {
    if (words.length > 0 && !reviewMode) {
      setLevelTotal(levelId, words.length)
    }
  }, [words, levelId, setLevelTotal, reviewMode])

  const generateQueue = useCallback(() => {
    if (reviewMode) {
      const dueWords = wrongWordsRef.current
        .filter(w => !w.mastered)
        .map(w => ({
          word: w.word,
          translations: [{ translation: w.translation, type: '' }],
        }))
      setQueue(shuffle(dueWords).slice(0, 20))
    } else if (words.length > 0) {
      setQueue(pickRandomWords(words, 20))
    }
    setCurrentIndex(0)
    setSessionStats({ correct: 0, wrong: 0 })
  }, [words, reviewMode])

  // 仅在 words 或 reviewMode 变化时生成队列
  useEffect(() => {
    queueInitialized.current = false
    generateQueue()
    queueInitialized.current = true
  }, [generateQueue])

  const handleAnswer = useCallback((correct) => {
    const currentWord = queue[currentIndex]
    if (!currentWord) return

    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }))

    if (!reviewMode) {
      recordPractice(correct, levelId)
    }

    if (!correct) {
      const translation = currentWord.translations?.[0]?.translation || ''
      addWrongWord(currentWord.word, translation, levelId)
    }
  }, [queue, currentIndex, reviewMode, levelId, recordPractice, addWrongWord])

  // 下一题
  const handleNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      generateQueue()
    }
  }, [currentIndex, queue.length, generateQueue])

  const currentWord = queue[currentIndex]
  const total = queue.length
  const accuracy = sessionStats.correct + sessionStats.wrong > 0
    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.wrong)) * 100)
    : 100

  const handleLevelChange = (newLevelId) => {
    setLevelId(newLevelId)
    setReviewMode(false)
    setSearchParams({ level: newLevelId })
  }

  return (
    <div className="space-y-6">
      {/* 顶部控制栏 */}
      <div className="flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl text-[var(--text-bright)] font-semibold">
              {reviewMode ? '错词复习' : `${wordbank?.name || '四级'} 练习`}
            </h1>
            <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono uppercase tracking-wider">
              {reviewMode ? 'EBBINGHAUS REVIEW' : wordbank?.nameEn}
            </p>
          </div>
          {/* 模式切换 */}
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-raised)]">
            <button
              onClick={() => setMode('spelling')}
              className={`px-4 py-2 text-xs font-medium transition-all duration-300 ${
                mode === 'spelling'
                  ? 'bg-[var(--gold)] text-[var(--bg-base)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-bright)]'
              }`}
            >
              拼写填空
            </button>
            <button
              onClick={() => setMode('letter')}
              className={`px-4 py-2 text-xs font-medium transition-all duration-300 ${
                mode === 'letter'
                  ? 'bg-[var(--gold)] text-[var(--bg-base)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-bright)]'
              }`}
            >
              字母填空
            </button>
          </div>
        </div>

        {/* 等级选择 + 模式切换 */}
        <div className="flex items-center gap-2 flex-wrap">
          {!reviewMode && WORDBANKS.map(wb => (
            <button
              key={wb.id}
              onClick={() => handleLevelChange(wb.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-300 ${
                levelId === wb.id
                  ? 'border-[var(--border-gold-strong)] text-[var(--gold)] bg-[var(--gold-glow)]'
                  : 'border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--border-gold)] hover:text-[var(--text-muted)]'
              }`}
            >
              {wb.name}
            </button>
          ))}
          <button
            onClick={() => setReviewMode(!reviewMode)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-300 ml-auto ${
              reviewMode
                ? 'border-[var(--vermilion)] text-[var(--vermilion-bright)] bg-[var(--vermilion-glow)]'
                : 'border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--vermilion)] hover:text-[var(--vermilion-bright)]'
            }`}
          >
            {reviewMode ? '退出复习' : '错词复习'}
          </button>
        </div>
      </div>

      {/* 练习统计 */}
      <div className="flex items-center gap-6 text-sm animate-fade-in stagger-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">正确</span>
          <span className="font-mono font-semibold text-[var(--patina-bright)]">{sessionStats.correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">错误</span>
          <span className="font-mono font-semibold text-[var(--vermilion-bright)]">{sessionStats.wrong}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">正确率</span>
          <span className="font-mono font-semibold text-[var(--gold)]">{accuracy}%</span>
        </div>
      </div>

      {/* 进度条 */}
      {total > 0 && (
        <div className="animate-fade-in stagger-2">
          <ProgressBar current={currentIndex + 1} total={total} color="gold" />
        </div>
      )}

      {/* 练习卡片 */}
      {loading && (
        <div className="p-12 md:p-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)]">
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton rounded mx-auto" />
            <div className="h-6 w-48 skeleton rounded mx-auto" />
            <div className="h-px bg-[var(--border)] my-6" />
            <div className="h-4 w-32 skeleton rounded mx-auto" />
            <div className="h-12 w-64 skeleton rounded mx-auto" />
            <div className="h-10 w-32 skeleton rounded mx-auto mt-4" />
          </div>
        </div>
      )}

      {error && (
        <div className="p-8 text-center rounded-2xl border border-[var(--vermilion)]/30 bg-[var(--vermilion-glow)] animate-scale-in">
          <p className="text-[var(--vermilion-bright)] mb-2 font-medium">加载失败</p>
          <p className="text-sm text-[var(--text-muted)] font-mono">{error}</p>
        </div>
      )}

      {!loading && !error && currentWord && (
        <div key={`${currentIndex}-${currentWord.word}`} className="animate-fade-in stagger-3">
          <WordCard
            wordData={currentWord}
            mode={mode}
            onAnswer={handleAnswer}
            onNext={handleNext}
            autoSpeak={settings.autoSpeak}
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-gold)] hover:text-[var(--gold)] transition-all duration-300"
            >
              跳过 →
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !currentWord && (
        <div className="p-12 md:p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-scale-in">
          <p className="text-5xl mb-4 animate-float">📚</p>
          <p className="text-[var(--text-muted)] mb-2 font-medium">
            {reviewMode ? '暂无需要复习的错词' : '词库为空'}
          </p>
          {reviewMode && (
            <p className="text-sm text-[var(--text-faint)]">
              继续练习来积累错词吧
            </p>
          )}
        </div>
      )}
    </div>
  )
}
