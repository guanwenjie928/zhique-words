import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 词库加载 Hook — 按需加载 JSON 数据
 */
export function useWordList(file) {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})

  const loadWords = useCallback(async () => {
    if (!file) return
    if (cacheRef.current[file]) {
      setWords(cacheRef.current[file])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(file)
      if (!res.ok) throw new Error(`加载失败: ${res.status}`)
      const data = await res.json()
      cacheRef.current[file] = data
      setWords(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [file])

  useEffect(() => {
    loadWords()
  }, [loadWords])

  return { words, loading, error }
}
