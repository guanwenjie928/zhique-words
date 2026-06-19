/**
 * 挖空算法工具
 * 支持两种模式：拼写填空（整词挖空）和字母填空（部分字母挖空）
 */

/**
 * 字母填空模式：随机挖掉 30%-50% 的字母
 * @param {string} word - 目标单词
 * @returns {{ display: string[], blanks: number[] }} display 数组（null 表示挖空），blanks 为挖空索引
 */
export function createLetterBlanks(word) {
  const letters = word.split('')
  const len = letters.length
  // 至少挖1个，最多挖一半
  const minBlanks = 1
  const maxBlanks = Math.max(minBlanks, Math.floor(len * 0.5))
  const blankCount = Math.min(maxBlanks, Math.max(minBlanks, Math.floor(len * (0.3 + Math.random() * 0.2))))

  // 随机选择挖空位置（确保不全部挖空）
  const indices = [...Array(len).keys()]
  const blankIndices = []
  const shuffled = shuffle(indices)

  for (let i = 0; i < blankCount && i < shuffled.length; i++) {
    blankIndices.push(shuffled[i])
  }

  blankIndices.sort((a, b) => a - b)

  const display = letters.map((ch, i) =>
    blankIndices.includes(i) ? null : ch
  )

  return { display, blanks: blankIndices, answer: word }
}

/**
 * 拼写填空模式：整个单词挖空
 * @param {string} word
 * @returns {{ display: null, answer: string }}
 */
export function createSpellingBlank(word) {
  return { display: null, blanks: [...Array(word.length).keys()], answer: word }
}

/**
 * 检查字母填空答案
 * @param {string} word - 正确单词
 * @param {string[]} inputs - 用户输入的字母数组（对应挖空位置）
 * @param {number[]} blankIndices - 挖空位置索引
 * @returns {{ correct: boolean, results: boolean[] }}
 */
export function checkLetterBlanks(word, inputs, blankIndices) {
  const results = blankIndices.map((idx, i) => {
    const expected = word[idx]
    const actual = (inputs[i] || '').toLowerCase()
    return actual === expected.toLowerCase()
  })
  return {
    correct: results.every(r => r),
    results,
  }
}

/**
 * 检查拼写填空答案
 * @param {string} word - 正确单词
 * @param {string} input - 用户输入的完整单词
 * @returns {boolean}
 */
export function checkSpellingBlank(word, input) {
  return (input || '').trim().toLowerCase() === word.toLowerCase()
}

/**
 * Fisher-Yates 洗牌
 */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 从词库中随机选取 N 个单词
 * @param {Array} words - 词库数组
 * @param {number} n - 选取数量
 * @param {Array} exclude - 排除的单词列表
 * @returns {Array}
 */
export function pickRandomWords(words, n, exclude = []) {
  const excludeSet = new Set(exclude)
  const available = words.filter(w => !excludeSet.has(w.word))
  return shuffle(available).slice(0, n)
}
