import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [mode, setMode] = useState('spelling') // spelling | letter
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [reviewMode, setReviewMode] = useState(false) // 错词复习模式

  const wordbank = getWordbank(levelId)
  const { words, loading, error } = useWordList(reviewMode ? null : wordbank?.file)
  const { settings, addWrongWord, recordPractice, setLevelTotal, wrongWords } = useStorage()

  // 设置总数
  useEffect(() => {
    if (words.length > 0 && !reviewMode) {
      setLevelTotal(levelId, words.length)
    }
  }, [words, levelId, setLevelTotal, reviewMode])

  // 生成练习队列
  const generateQueue = useCallback(() => {
    if (reviewMode) {
      // 错词复习模式：使用错词本中到期复习的词
      const dueWords = wrongWords
        .filter(w => !w.mastered)
        .map(w => ({
          word: w.word,
          translations: [{ translation: w.translation, type: '' }],
        }))
      setQueue(shuffle(dueWords).slice(0, 20))
    } else if (words.length > 0) {
      const picked = pickRandomWords(words, 20)
      setQueue(picked)
    }
    setCurrentIndex(0)
    setSessionStats({ correct: 0, wrong: 0 })
  }, [words, reviewMode, wrongWords])

  useEffect(() => {
    generateQueue()
  }, [generateQueue])

  // 处理答题
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
      if (reviewMode) {
        // 复习模式下复习失败
        // reviewWordFail 已经在 StorageContext
      } else {
        addWrongWord(currentWord.word, translation, levelId)
      }
    } else if (reviewMode) {
      // 复习模式下复习成功
      // reviewWordSuccess 已经在 StorageContext
    }
  }, [queue, currentIndex, reviewMode, levelId, recordPractice, addWrongWord])

  // 下一题
  const handleNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 队列用完，重新生成
      generateQueue()
    }
  }, [currentIndex, queue.length, generateQueue])

  const currentWord = queue[currentIndex]
  const total = queue.length
  const accuracy = sessionStats.correct + sessionStats.wrong > 0
    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.wrong)) * 100)
    : 100

  // 等级选择器
  const handleLevelChange = (newLevelId) => {
    setLevelId(newLevelId)
    setReviewMode(false)
    setSearchParams({ level: newLevelId })
  }

  return (
    <div className="space-y-6">
      {/* 顶部控制栏 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl md:text-2xl text-[var(--ks-champagne)] font-medium">
            {reviewMode ? '错词复习' : `${wordbank?.name || '四级'} 练习`}
          </h1>
          <div className="flex items-center gap-3">
            {/* 模式切换 */}
            <div className="flex rounded border border-[var(--ks-rule)] overflow-hidden">
              <button
                onClick={() => setMode('spelling')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'spelling'
                    ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)]'
                    : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-text)]'
                }`}
              >
                拼写填空
              </button>
              <button
                onClick={() => setMode('letter')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'letter'
                    ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)]'
                    : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-text)]'
                }`}
              >
                字母填空
              </button>
            </div>
          </div>
        </div>

        {/* 等级选择 + 模式切换 */}
        <div className="flex items-center gap-2 flex-wrap">
          {!reviewMode && WORDBANKS.map(wb => (
            <button
              key={wb.id}
              onClick={() => handleLevelChange(wb.id)}
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
            onClick={() => setReviewMode(!reviewMode)}
            className={`px-3 py-1 text-xs rounded border transition-all ml-auto ${
              reviewMode
                ? 'border-[var(--ks-vermilion)] text-[var(--ks-vermilion)] bg-[var(--ks-vermilion)]/8'
                : 'border-[var(--ks-rule)] text-[var(--ks-text-faint)] hover:border-[var(--ks-vermilion)]'
            }`}
          >
            {reviewMode ? '退出复习' : '错词复习'}
          </button>
        </div>
      </div>

      {/* 练习统计 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--ks-text-faint)]">正确</span>
          <span className="font-mono text-[var(--ks-patina)]">{sessionStats.correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--ks-text-faint)]">错误</span>
          <span className="font-mono text-[var(--ks-vermilion)]">{sessionStats.wrong}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--ks-text-faint)]">正确率</span>
          <span className="font-mono text-[var(--ks-kinpaku)]">{accuracy}%</span>
        </div>
      </div>

      {/* 进度条 */}
      {total > 0 && (
        <ProgressBar current={currentIndex + 1} total={total} color="gold" />
      )}

      {/* 练习卡片 */}
      {loading && (
        <div className="p-12 text-center text-[var(--ks-text-muted)]">
          <div className="inline-block animate-spin text-2xl mb-3">⟳</div>
          <p>正在加载词库…</p>
        </div>
      )}

      {error && (
        <div className="p-8 text-center border border-[var(--ks-vermilion)]/30 rounded-lg bg-[var(--ks-vermilion)]/5">
          <p className="text-[var(--ks-vermilion)] mb-2">加载失败</p>
          <p className="text-sm text-[var(--ks-text-muted)]">{error}</p>
        </div>
      )}

      {!loading && !error && currentWord && (
        <div key={`${currentIndex}-${currentWord.word}`} className="animate-fade-in">
          <WordCard
            wordData={currentWord}
            mode={mode}
            onAnswer={handleAnswer}
            autoSpeak={settings.autoSpeak}
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm rounded border border-[var(--ks-rule)] text-[var(--ks-text-muted)] hover:border-[var(--ks-rule-strong)] hover:text-[var(--ks-kinpaku)] transition-colors"
            >
              跳过 →
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !currentWord && (
        <div className="p-12 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-[var(--ks-text-muted)] mb-2">
            {reviewMode ? '暂无需要复习的错词' : '词库为空'}
          </p>
          {reviewMode && (
            <p className="text-sm text-[var(--ks-text-faint)]">
              继续练习来积累错词吧！
            </p>
          )}
        </div>
      )}
    </div>
  )
}
