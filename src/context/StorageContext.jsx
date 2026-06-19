import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getNextReviewTime } from '../utils/ebbinghaus'

const StorageContext = createContext(null)

const STORAGE_KEYS = {
  wrongWords: 'zhique_wrong_words',
  stats: 'zhique_stats',
  daily: 'zhique_daily',
  settings: 'zhique_settings',
}

/** 读取 localStorage JSON */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/** 写入 localStorage JSON */
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('存储失败:', e)
  }
}

/** 获取今天的日期字符串 YYYY-MM-DD */
export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function StorageProvider({ children }) {
  // —— 错词本 ——
  const [wrongWords, setWrongWords] = useState(() => loadJSON(STORAGE_KEYS.wrongWords, []))

  // —— 学习统计 ——
  const [stats, setStats] = useState(() => loadJSON(STORAGE_KEYS.stats, {
    totalPracticed: 0,
    totalCorrect: 0,
    streak: 0,
    lastVisit: null,
    dailyStats: {}, // { "2024-01-01": { practiced: 10, correct: 8 } }
    levelProgress: {}, // { cet4: { practiced: 100, total: 7508 } }
  }))

  // —— 每日单词 ——
  const [daily, setDaily] = useState(() => loadJSON(STORAGE_KEYS.daily, {
    date: null,
    words: [],
    studied: [],
    levelId: 'cet4',
  }))

  // —— 设置 ——
  const [settings, setSettings] = useState(() => loadJSON(STORAGE_KEYS.settings, {
    autoSpeak: true,
    lang: 'en-US',
    practiceMode: 'spelling', // 'spelling' | 'letter'
    dailyCount: 10,
  }))

  // 持久化
  useEffect(() => { saveJSON(STORAGE_KEYS.wrongWords, wrongWords) }, [wrongWords])
  useEffect(() => { saveJSON(STORAGE_KEYS.stats, stats) }, [stats])
  useEffect(() => { saveJSON(STORAGE_KEYS.daily, daily) }, [daily])
  useEffect(() => { saveJSON(STORAGE_KEYS.settings, settings) }, [settings])

  // —— 每日打卡检查 ——
  useEffect(() => {
    const today = todayKey()
    setStats(prev => {
      if (prev.lastVisit === today) return prev
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const newStreak = prev.lastVisit === yesterday ? prev.streak + 1 : 1
      return { ...prev, lastVisit: today, streak: newStreak }
    })
  }, [])

  // —— 错词本操作 ——
  const addWrongWord = useCallback((word, translation, levelId) => {
    setWrongWords(prev => {
      const existing = prev.find(w => w.word === word)
      if (existing) {
        return prev.map(w =>
          w.word === word
            ? { ...w, wrongCount: w.wrongCount + 1, lastWrong: Date.now() }
            : w
        )
      }
      return [...prev, {
        word,
        translation,
        levelId,
        wrongCount: 1,
        firstWrong: Date.now(),
        lastWrong: Date.now(),
        reviewCount: 0,
        nextReview: getNextReviewTime(0, Date.now()),
        mastered: false,
      }]
    })
  }, [])

  const removeWrongWord = useCallback((word) => {
    setWrongWords(prev => prev.filter(w => w.word !== word))
  }, [])

  const markWordMastered = useCallback((word) => {
    setWrongWords(prev =>
      prev.map(w => w.word === word ? { ...w, mastered: true } : w)
    )
  }, [])

  /** 复习成功：推进艾宾浩斯曲线 */
  const reviewWordSuccess = useCallback((word) => {
    setWrongWords(prev =>
      prev.map(w => {
        if (w.word !== word) return w
        const newCount = w.reviewCount + 1
        return {
          ...w,
          reviewCount: newCount,
          nextReview: getNextReviewTime(newCount, Date.now()),
          mastered: newCount >= 9, // 完成9次复习后标记为掌握
        }
      })
    )
  }, [])

  /** 复习失败：重置艾宾浩斯曲线 */
  const reviewWordFail = useCallback((word) => {
    setWrongWords(prev =>
      prev.map(w =>
        w.word === word
          ? { ...w, reviewCount: 0, nextReview: getNextReviewTime(0, Date.now()), wrongCount: w.wrongCount + 1 }
          : w
      )
    )
  }, [])

  // —— 统计操作 ——
  const recordPractice = useCallback((correct, levelId) => {
    const today = todayKey()
    setStats(prev => {
      const dayStats = prev.dailyStats[today] || { practiced: 0, correct: 0 }
      const newDayStats = {
        practiced: dayStats.practiced + 1,
        correct: dayStats.correct + (correct ? 1 : 0),
      }
      const levelProg = prev.levelProgress[levelId] || { practiced: 0 }
      return {
        ...prev,
        totalPracticed: prev.totalPracticed + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        dailyStats: { ...prev.dailyStats, [today]: newDayStats },
        levelProgress: {
          ...prev.levelProgress,
          [levelId]: { ...levelProg, practiced: levelProg.practiced + 1 },
        },
      }
    })
  }, [])

  /** 设置词库总数 */
  const setLevelTotal = useCallback((levelId, total) => {
    setStats(prev => ({
      ...prev,
      levelProgress: {
        ...prev.levelProgress,
        [levelId]: { ...(prev.levelProgress[levelId] || {}), total },
      },
    }))
  }, [])

  // —— 每日单词操作 ——
  const setDailyWords = useCallback((words, levelId) => {
    setDaily({
      date: todayKey(),
      words,
      studied: [],
      levelId,
    })
  }, [])

  const markDailyStudied = useCallback((word) => {
    setDaily(prev =>
      prev.studied.includes(word)
        ? prev
        : { ...prev, studied: [...prev.studied, word] }
    )
  }, [])

  // —— 设置操作 ——
  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  const value = {
    // 错词本
    wrongWords,
    addWrongWord,
    removeWrongWord,
    markWordMastered,
    reviewWordSuccess,
    reviewWordFail,
    // 统计
    stats,
    recordPractice,
    setLevelTotal,
    // 每日
    daily,
    setDailyWords,
    markDailyStudied,
    // 设置
    settings,
    updateSettings,
  }

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

export function useStorage() {
  const ctx = useContext(StorageContext)
  if (!ctx) throw new Error('useStorage must be used within StorageProvider')
  return ctx
}
