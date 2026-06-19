/**
 * 艾宾浩斯遗忘曲线复习间隔计算
 * 间隔: 5分钟 → 30分钟 → 12小时 → 1天 → 2天 → 4天 → 7天 → 15天 → 30天
 */

export const REVIEW_INTERVALS = [
  5 * 60 * 1000,           // 5分钟
  30 * 60 * 1000,          // 30分钟
  12 * 60 * 60 * 1000,     // 12小时
  1 * 24 * 60 * 60 * 1000,  // 1天
  2 * 24 * 60 * 60 * 1000,  // 2天
  4 * 24 * 60 * 60 * 1000,  // 4天
  7 * 24 * 60 * 60 * 1000,  // 7天
  15 * 24 * 60 * 60 * 1000, // 15天
  30 * 24 * 60 * 60 * 1000, // 30天
]

/**
 * 获取下一次复习时间
 * @param {number} reviewCount - 已复习次数
 * @param {number} lastReviewTime - 上次复习时间戳
 * @returns {number} 下次复习时间戳
 */
export function getNextReviewTime(reviewCount, lastReviewTime) {
  const idx = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  return lastReviewTime + REVIEW_INTERVALS[idx]
}

/**
 * 判断一个错词是否到了复习时间
 * @param {Object} wrongWord - 错词记录
 * @returns {boolean}
 */
export function isDueForReview(wrongWord) {
  if (!wrongWord.nextReview) return true
  return Date.now() >= wrongWord.nextReview
}

/**
 * 获取复习状态标签
 * @param {Object} wrongWord
 * @returns {{ label: string, urgent: boolean }}
 */
export function getReviewStatus(wrongWord) {
  if (!wrongWord.nextReview) return { label: '待复习', urgent: true }

  const now = Date.now()
  const diff = wrongWord.nextReview - now

  if (diff <= 0) return { label: '立即复习', urgent: true }
  if (diff < 60 * 60 * 1000) return { label: `${Math.ceil(diff / 60000)}分钟后`, urgent: true }
  if (diff < 24 * 60 * 60 * 1000) return { label: `${Math.ceil(diff / 3600000)}小时后`, urgent: false }
  return { label: `${Math.ceil(diff / 86400000)}天后`, urgent: false }
}

/**
 * 格式化遗忘曲线进度
 * @param {number} reviewCount
 * @returns {{ current: number, total: number, label: string }}
 */
export function getEbbinghausProgress(reviewCount) {
  const total = REVIEW_INTERVALS.length
  const current = Math.min(reviewCount, total)
  const labels = ['5分钟', '30分钟', '12小时', '1天', '2天', '4天', '7天', '15天', '30天']
  return {
    current,
    total,
    label: current >= total ? '已掌握' : `下次: ${labels[current] || '已完成'}`,
  }
}
