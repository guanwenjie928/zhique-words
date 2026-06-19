/**
 * 词库元数据配置
 * 数据来源: KyleBing/english-vocabulary (GitHub)
 * 路径使用 import.meta.env.BASE_URL 确保子路径部署正常
 */
const BASE = import.meta.env.BASE_URL || '/'

export const WORDBANKS = [
  {
    id: 'junior',
    name: '初中',
    nameEn: 'Junior High',
    file: `${BASE}data/1-junior.json`,
    icon: '📘',
    color: 'patina',
    description: '初中基础词汇',
  },
  {
    id: 'senior',
    name: '高中',
    nameEn: 'Senior High',
    file: `${BASE}data/2-senior.json`,
    icon: '📗',
    color: 'patina',
    description: '高中进阶词汇',
  },
  {
    id: 'cet4',
    name: '四级',
    nameEn: 'CET-4',
    file: `${BASE}data/3-cet4.json`,
    icon: '🎯',
    color: 'gold',
    description: '大学英语四级核心词汇',
  },
  {
    id: 'cet6',
    name: '六级',
    nameEn: 'CET-6',
    file: `${BASE}data/4-cet6.json`,
    icon: '🎖️',
    color: 'gold',
    description: '大学英语六级核心词汇',
  },
  {
    id: 'kaoyan',
    name: '考研',
    nameEn: 'Postgrad',
    file: `${BASE}data/5-kaoyan.json`,
    icon: '🏆',
    color: 'gold',
    description: '研究生入学考试词汇',
  },
  {
    id: 'toefl',
    name: '托福',
    nameEn: 'TOEFL',
    file: `${BASE}data/6-toefl.json`,
    icon: '🌐',
    color: 'gold',
    description: '托福考试核心词汇',
  },
  {
    id: 'sat',
    name: 'SAT',
    nameEn: 'SAT',
    file: `${BASE}data/7-sat.json`,
    icon: '⭐',
    color: 'gold',
    description: 'SAT 考试核心词汇',
  },
]

/** 根据ID获取词库 */
export function getWordbank(id) {
  return WORDBANKS.find(wb => wb.id === id)
}
