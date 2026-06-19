import { useSpeech } from '../hooks/useSpeech'

/**
 * 发音按钮 — 使用 Web Speech API 朗读单词
 */
export default function PronounceButton({ word, size = 'md' }) {
  const { speak, isSpeaking, lang, toggleLang } = useSpeech()

  const sizeMap = {
    sm: { btn: 'w-8 h-8', icon: 16 },
    md: { btn: 'w-10 h-10', icon: 20 },
    lg: { btn: 'w-12 h-12', icon: 24 },
  }
  const sz = sizeMap[size] || sizeMap.md

  const handleSpeak = (e) => {
    e?.stopPropagation()
    if (word) speak(word, 0.85)
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleSpeak}
        className={`${sz.btn} flex items-center justify-center rounded-full border transition-all duration-300 active:scale-90 ${
          isSpeaking
            ? 'border-[var(--patina)] bg-[var(--patina-glow)] text-[var(--patina-bright)] animate-pulse-gold'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-gold-strong)] hover:text-[var(--gold)] hover:bg-[var(--gold-glow)]'
        }`}
        aria-label={`朗读 ${word}`}
        title="点击朗读"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={sz.icon} height={sz.icon}>
          {isSpeaking ? (
            <>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </>
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          )}
        </svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); toggleLang() }}
        className="px-2 py-1 text-[10px] font-mono font-medium uppercase tracking-wider rounded border border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--gold)] hover:border-[var(--border-gold-strong)] transition-all duration-300"
        title="切换发音口音"
      >
        {lang === 'en-US' ? 'US' : 'UK'}
      </button>
    </div>
  )
}
