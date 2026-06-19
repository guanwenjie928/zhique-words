import { useCallback, useRef, useState } from 'react'

/**
 * 发音 Hook — 基于 Web Speech API
 * 支持英美音切换，无需外部依赖
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lang, setLang] = useState('en-US') // en-US 美音, en-GB 英音
  const voicesRef = useRef([])

  // 加载可用语音列表
  const loadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
  }, [])

  const speak = useCallback((text, rate = 0.8) => {
    if (!('speechSynthesis' in window) || !text) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = 1

    // 尝试匹配对应语言的语音
    if (voicesRef.current.length === 0) loadVoices()
    const voice = voicesRef.current.find(v => v.lang === lang)
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [lang, loadVoices])

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en-US' ? 'en-GB' : 'en-US')
  }, [])

  // 初始化加载语音
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  return { speak, isSpeaking, lang, toggleLang }
}
