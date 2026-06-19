import { useSpeech } from '../hooks/useSpeech'

/**
 * 发音按钮 — 使用 Web Speech API 朗读单词
 */
export default function PronounceButton({ word, size = 'md', autoPlay = false, lang, onLangChange }) {
  const { speak, isSpeaking, lang: hookLang, toggleLang } = useSpeech()

  const sizeMap = {
    sm: { btn: 'w-8 h-8', icon: 'text-sm' },
    md: { btn: 'w-10 h-10', icon: 'text-base' },
    lg: { btn: 'w-12 h-12', icon: 'text-lg' },
  }
  const sz = sizeMap[size] || sizeMap.md

  const handleSpeak = (e) => {
    e?.stopPropagation()
    if (word) speak(word, 0.8)
  }

  // 自动播放
  if (autoPlay && word) {
    speak(word, 0.8)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSpeak}
        className={`${sz.btn} flex items-center justify-center rounded-full border transition-all duration-300 ${
          isSpeaking
            ? 'border-[var(--ks-patina)] bg-[var(--ks-patina)]/10 text-[var(--ks-patina)]'
            : 'border-[var(--ks-rule)] text-[var(--ks-text-muted)] hover:border-[var(--ks-rule-strong)] hover:text-[var(--ks-kinpaku)]'
        }`}
        aria-label={`朗读 ${word}`}
        title="点击朗读"
      >
        {isSpeaking ? (
          <svg className={`${sz.icon} animate-pulse`} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        ) : (
          <svg className={sz.icon} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        )}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); toggleLang() }}
        className="px-2 py-1 text-xs font-mono uppercase tracking-wider rounded border border-[var(--ks-rule)] text-[var(--ks-text-faint)] hover:text-[var(--ks-kinpaku)] hover:border-[var(--ks-rule-strong)] transition-colors"
        title="切换发音口音"
      >
        {hookLang === 'en-US' ? 'US' : 'UK'}
      </button>
    </div>
  )
}
