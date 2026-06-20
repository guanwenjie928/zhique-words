import { useCallback, useRef, useState, useEffect } from 'react'

/**
 * 发音 Hook — 基于 Web Speech API
 * 支持英美音切换，自动播报（rate 稍慢），手动播报（rate 正常）
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lang, setLang] = useState('en-US') // en-US 美音, en-GB 英音
  const [voicesReady, setVoicesReady] = useState(false)
  const voicesRef = useRef([])

  // 加载可用语音列表
  const loadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        voicesRef.current = voices
        setVoicesReady(true)
      }
    }
  }, [])

  /**
   * 朗读文本
   * @param {string} text — 要朗读的文本
   * @param {boolean} auto — 是否为自动播报（自动播报 rate=0.75 稍慢，手动 rate=0.85 正常）
   */
  const speak = useCallback((text, auto = false) => {
    if (!('speechSynthesis' in window) || !text) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = auto ? 0.75 : 0.85
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

  // 初始化加载语音 — 使用 useEffect 避免渲染期间副作用
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    // 部分浏览器需要延迟才能获取 voices
    const timer = setTimeout(loadVoices, 500)
    return () => {
      clearTimeout(timer)
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [loadVoices])

  return { speak, isSpeaking, lang, toggleLang, voicesReady }
}
