import { useState, useEffect, useRef } from 'react'
import { createLetterBlanks, checkLetterBlanks, checkSpellingBlank } from '../utils/blank'
import PronounceButton from './PronounceButton'
import { useSpeech } from '../hooks/useSpeech'

/**
 * 单词练习卡片 — 支持拼写填空和字母填空两种模式
 * 布局: 单词在上 → 释义在下 → 发音 → 按钮
 * 自动播报: 每个新单词加载时自动播报一次
 */
export default function WordCard({ wordData, mode, onAnswer, onNext, autoSpeak }) {
  const [userInput, setUserInput] = useState('')
  const [letterInputs, setLetterInputs] = useState([])
  const [blankData, setBlankData] = useState(null)
  const [status, setStatus] = useState('pending') // pending | correct | wrong
  const [checked, setChecked] = useState(false)
  const inputRef = useRef(null)

  // 语音播报 — 在 WordCard 内部直接使用 hook，支持自动播报
  const { speak } = useSpeech()

  const word = wordData?.word || ''
  const translations = wordData?.translations || []
  const translationText = translations.map(t => `${t.type || ''} ${t.translation}`).join('；')

  // 初始化 + 自动播报
  useEffect(() => {
    if (!word) return
    setStatus('pending')
    setChecked(false)
    setUserInput('')

    if (mode === 'letter') {
      const data = createLetterBlanks(word)
      setBlankData(data)
      setLetterInputs(new Array(data.blanks.length).fill(''))
    } else {
      setBlankData(null)
      setLetterInputs([])
    }

    const timer = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(timer)
  }, [word, mode])

  // 自动播报 — 新单词加载后播报一次（延迟 300ms 确保 voices 就绪）
  useEffect(() => {
    if (!word || !autoSpeak) return
    const timer = setTimeout(() => {
      speak(word, true) // auto=true, rate=0.75 稍慢
    }, 300)
    return () => clearTimeout(timer)
  }, [word, autoSpeak, speak])

  // 提交答案
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (checked) return

    let correct = false
    if (mode === 'spelling') {
      correct = checkSpellingBlank(word, userInput)
    } else if (mode === 'letter' && blankData) {
      const result = checkLetterBlanks(word, letterInputs, blankData.blanks)
      correct = result.correct
    }

    setStatus(correct ? 'correct' : 'wrong')
    setChecked(true)
    onAnswer?.(correct)
  }

  // 回车提交 / 下一题
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!checked) {
        handleSubmit(e)
      } else {
        onNext?.()
      }
    }
  }

  if (!word) return null

  const cardStyle = status === 'correct'
    ? { borderColor: 'rgba(93, 186, 176, 0.4)', boxShadow: 'var(--shadow-patina)' }
    : status === 'wrong'
      ? { borderColor: 'rgba(214, 90, 74, 0.4)', boxShadow: '0 4px 20px rgba(214, 90, 74, 0.1)' }
      : { borderColor: 'var(--border)' }

  return (
    <div
      className={`p-6 md:p-10 rounded-2xl bg-[var(--bg-raised)] border transition-all duration-500 ${status === 'wrong' ? 'animate-wrong-shake' : ''}`}
      style={cardStyle}
    >
      {/* 填空区 — 单词在最上方 */}
      {mode === 'spelling' ? (
        <SpellingMode
          userInput={userInput}
          setUserInput={setUserInput}
          checked={checked}
          status={status}
          word={word}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <LetterMode
          blankData={blankData}
          letterInputs={letterInputs}
          setLetterInputs={setLetterInputs}
          checked={checked}
          word={word}
          onKeyDown={handleKeyDown}
        />
      )}

      {/* 分隔线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent my-6" />

      {/* 释义区 — 在单词下方 */}
      <div className="text-center mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] mb-2">
          释义 · MEANING
        </p>
        <p className="text-base md:text-lg text-[var(--text-base)] leading-relaxed">
          {translationText}
        </p>
      </div>

      {/* 发音按钮 */}
      <div className="flex justify-center mb-6">
        <PronounceButton word={word} size="md" />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3">
        {!checked ? (
          <button
            onClick={handleSubmit}
            className="px-10 py-3 rounded-xl bg-[var(--gold)] text-[var(--bg-base)] font-semibold text-sm tracking-wide hover:bg-[var(--gold-bright)] hover:shadow-[var(--shadow-gold)] active:scale-95 transition-all duration-300"
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={() => onNext?.()}
            className="px-10 py-3 rounded-xl bg-[var(--gold)] text-[var(--bg-base)] font-semibold text-sm tracking-wide hover:bg-[var(--gold-bright)] hover:shadow-[var(--shadow-gold)] active:scale-95 transition-all duration-300"
          >
            下一题 →
          </button>
        )}
      </div>

      {/* 结果反馈 */}
      {checked && (
        <div className={`mt-5 text-center text-sm font-medium animate-fade-in ${
          status === 'correct' ? 'text-[var(--patina-bright)]' : 'text-[var(--vermilion-bright)]'
        }`}>
          {status === 'correct' ? (
            <span className="inline-flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              回答正确
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              回答错误，已加入错词本
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** 字母填空模式 — 行内下划线风格 */
function LetterMode({ blankData, letterInputs, setLetterInputs, checked, word, onKeyDown }) {
  if (!blankData) return null

  const { display, blanks } = blankData

  const handleSingleChange = (blankIdx, value) => {
    const newInputs = [...letterInputs]
    newInputs[blankIdx] = value
    setLetterInputs(newInputs)
    // 自动跳到下一个空
    if (value && blankIdx < blanks.length - 1) {
      const nextInput = document.getElementById(`blank-${blankIdx + 1}`)
      nextInput?.focus()
    }
  }

  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] mb-5">
        补全缺失字母 · FILL IN THE BLANKS
      </p>
      {/* 行内下划线 — 可见字母和挖空位在同一行流畅展示 */}
      <div className="flex items-center justify-center gap-0.5 flex-wrap" style={{ lineHeight: 1.2 }}>
        {display.map((ch, i) => {
          const blankIdx = blanks.indexOf(i)
          if (ch === null) {
            const value = letterInputs[blankIdx] || ''
            const expected = word[i]
            const isWrong = checked && value.toLowerCase() !== expected.toLowerCase()
            const isRight = checked && value.toLowerCase() === expected.toLowerCase()
            return (
              <input
                key={i}
                id={`blank-${blankIdx}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleSingleChange(blankIdx, e.target.value)}
                onKeyDown={onKeyDown}
                disabled={checked}
                className={`letter-blank-input ${
                  isWrong
                    ? 'letter-blank-wrong'
                    : isRight
                      ? 'letter-blank-correct'
                      : ''
                }`}
                autoComplete="off"
              />
            )
          }
          return (
            <span key={i} className="letter-visible">
              {ch}
            </span>
          )
        })}
      </div>
      {/* 答题后显示完整单词 */}
      {checked && (
        <p className="mt-3 text-sm text-[var(--text-muted)] animate-fade-in">
          完整单词: <span className="text-[var(--gold)] font-medium font-mono">{word}</span>
        </p>
      )}
    </div>
  )
}

/** 拼写填空模式 — 整词输入 */
function SpellingMode({ userInput, setUserInput, checked, status, word, inputRef, onKeyDown }) {
  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] mb-5">
        拼写单词 · SPELL THE WORD
      </p>
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={checked}
        placeholder="输入完整的英文单词…"
        className={`spelling-input ${
          checked
            ? status === 'correct'
              ? 'spelling-correct'
              : 'spelling-wrong'
            : ''
        }`}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {checked && status === 'wrong' && (
        <p className="mt-3 text-sm text-[var(--text-muted)] animate-fade-in">
          正确答案: <span className="text-[var(--gold)] font-medium font-mono">{word}</span>
        </p>
      )}
    </div>
  )
}
