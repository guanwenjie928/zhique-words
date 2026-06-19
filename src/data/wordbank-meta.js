/**
 * 词库元数据配置
 * 数据来源: KyleBing/english-vocabulary (GitHub)
 */
export const WORDBANKS = [
  {
    id: 'junior',
    name: '初中',
    nameEn: 'Junior High',
    file: '/data/1-junior.json',
    icon: '📘',
    color: 'patina',
    description: '初中基础词汇',
  },
  {
    id: 'senior',
    name: '高中',
    nameEn: 'Senior High',
    file: '/data/2-senior.json',
    icon: '📗',
    color: 'patina',
    description: '高中进阶词汇',
  },
  {
    id: 'cet4',
    name: '四级',
    nameEn: 'CET-4',
    file: '/data/3-cet4.json',
    icon: '🎯',
    color: 'gold',
    description: '大学英语四级核心词汇',
  },
  {
    id: 'cet6',
    name: '六级',
    nameEn: 'CET-6',
    file: '/data/4-cet6.json',
    icon: '🎖️',
    color: 'gold',
    description: '大学英语六级核心词汇',
  },
  {
    id: 'kaoyan',
    name: '考研',
    nameEn: 'Postgrad',
    file: '/data/5-kaoyan.json',
    icon: '🏆',
    color: 'gold',
    description: '研究生入学考试词汇',
  },
  {
    id: 'toefl',
    name: '托福',
    nameEn: 'TOEFL',
    file: '/data/6-toefl.json',
    icon: '🌐',
    color: 'gold',
    description: '托福考试核心词汇',
  },
  {
    id: 'sat',
    name: 'SAT',
    nameEn: 'SAT',
    file: '/data/7-sat.json',
    icon: '⭐',
    color: 'gold',
    description: 'SAT 考试核心词汇',
  },
]

/** 根据ID获取词库 */
export function getWordbank(id) {
  return WORDBANKS.find(wb => wb.id === id)
}
