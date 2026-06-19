import { useState, useEffect, useRef } from 'react'
import { createLetterBlanks, checkLetterBlanks, checkSpellingBlank } from '../utils/blank'
import PronounceButton from './PronounceButton'

/**
 * 单词练习卡片 — 支持拼写填空和字母填空两种模式
 *
 * @param {Object} wordData - { word, translations }
 * @param {'spelling'|'letter'} mode - 练习模式
 * @param {Function} onAnswer - (correct: boolean) => void
 * @param {boolean} autoSpeak - 是否自动发音
 */
export default function WordCard({ wordData, mode, onAnswer, autoSpeak }) {
  const [userInput, setUserInput] = useState('')
  const [letterInputs, setLetterInputs] = useState([])
  const [blankData, setBlankData] = useState(null)
  const [status, setStatus] = useState('pending') // pending | correct | wrong
  const [checked, setChecked] = useState(false)
  const inputRef = useRef(null)

  const word = wordData?.word || ''
  const translations = wordData?.translations || []
  const translationText = translations.map(t => `${t.type || ''} ${t.translation}`).join('；')

  // 初始化挖空
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

    // 自动聚焦
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [word, mode])

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

  // 下一题
  const handleNext = () => {
    // 由父组件控制
  }

  // 回车提交
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!checked) {
        handleSubmit(e)
      } else {
        handleNext()
      }
    }
  }

  if (!word) return null

  const cardBorder = status === 'correct'
    ? 'border-[var(--ks-patina)]/50'
    : status === 'wrong'
      ? 'border-[var(--ks-vermilion)]/50'
      : 'border-[var(--ks-rule)]'

  return (
    <div className={`p-6 md:p-8 rounded-lg border ${cardBorder} bg-[var(--ks-raised)] transition-all duration-300`}>
      {/* 释义区 */}
      <div className="mb-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--ks-text-faint)] mb-2">释义</p>
        <p className="text-lg md:text-xl text-[var(--ks-champagne)] leading-relaxed">
          {translationText}
        </p>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-[var(--ks-rule)] mb-6" />

      {/* 填空区 */}
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

      {/* 答案揭示 + 发音 */}
      {checked && (
        <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in">
          <div className="text-center">
            <p className={`text-2xl md:text-3xl font-medium ${status === 'correct' ? 'text-[var(--ks-patina)]' : 'text-[var(--ks-kinpaku)]'}`}>
              {word}
            </p>
          </div>
          <PronounceButton word={word} size="md" />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-center gap-3">
        {!checked ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded border border-[var(--ks-rule-strong)] bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)] font-medium hover:bg-[var(--ks-kinpaku-rich)] transition-colors"
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded border border-[var(--ks-rule-strong)] bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)] font-medium hover:bg-[var(--ks-kinpaku-rich)] transition-colors"
          >
            下一题 →
          </button>
        )}
      </div>

      {/* 结果反馈 */}
      {checked && (
        <div className={`mt-4 text-center text-sm font-mono uppercase tracking-wider animate-fade-in ${status === 'correct' ? 'text-[var(--ks-patina)]' : 'text-[var(--ks-vermilion)]'}`}>
          {status === 'correct' ? '✓ 回答正确' : '✗ 回答错误，已加入错词本'}
        </div>
      )}
    </div>
  )
}

/** 拼写填空模式 */
function SpellingMode({ userInput, setUserInput, checked, status, word, inputRef, onKeyDown }) {
  return (
    <div className="text-center">
      <p className="text-xs font-mono uppercase tracking-widest text-[var(--ks-text-faint)] mb-3">拼写单词</p>
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={checked}
        placeholder="输入完整的英文单词…"
        className={`max-w-xs mx-auto text-center text-xl tracking-wider ${
          checked
            ? status === 'correct'
              ? 'border-[var(--ks-patina)] text-[var(--ks-patina)]'
              : 'border-[var(--ks-vermilion)] text-[var(--ks-vermilion)] animate-shake'
            : ''
        }`}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {checked && status === 'wrong' && (
        <p className="mt-2 text-sm text-[var(--ks-text-muted)]">
          正确答案: <span className="text-[var(--ks-kinpaku)] font-medium">{word}</span>
        </p>
      )}
    </div>
  )
}

/** 字母填空模式 */
function LetterMode({ blankData, letterInputs, setLetterInputs, checked, word, onKeyDown }) {
  if (!blankData) return null

  const { display, blanks } = blankData

  return (
    <div className="text-center">
      <p className="text-xs font-mono uppercase tracking-widest text-[var(--ks-text-faint)] mb-3">补全缺失字母</p>
      <div className="flex items-center justify-center gap-1 flex-wrap">
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
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => {
                  const newInputs = [...letterInputs]
                  newInputs[blankIdx] = e.target.value
                  setLetterInputs(newInputs)
                }}
                onKeyDown={onKeyDown}
                disabled={checked}
                className={`w-9 h-12 md:w-10 md:h-12 text-center text-xl font-mono uppercase ${
                  isWrong
                    ? 'border-[var(--ks-vermilion)] text-[var(--ks-vermilion)] bg-[var(--ks-vermilion)]/8'
                    : isRight
                      ? 'border-[var(--ks-patina)] text-[var(--ks-patina)] bg-[var(--ks-patina)]/8'
                      : 'border-[var(--ks-rule-strong)]'
                }`}
                style={{ borderRadius: 'var(--ks-radius)' }}
                autoComplete="off"
              />
            )
          }
          return (
            <span key={i} className="w-9 h-12 md:w-10 md:h-12 flex items-center justify-center text-xl font-mono text-[var(--ks-text-muted)]">
              {ch}
            </span>
          )
        })}
      </div>
      {checked && (
        <p className="mt-3 text-sm text-[var(--ks-text-muted)]">
          完整单词: <span className="text-[var(--ks-kinpaku)] font-medium">{word}</span>
        </p>
      )}
    </div>
  )
}
