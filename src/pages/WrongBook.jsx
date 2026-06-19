import { useState, useMemo } from 'react'
import { useStorage } from '../context/StorageContext'
import { getReviewStatus, getEbbinghausProgress } from '../utils/ebbinghaus'
import { getWordbank } from '../data/wordbank-meta'
import PronounceButton from '../components/PronounceButton'
import { Link } from 'react-router-dom'

export default function WrongBook() {
  const { wrongWords, removeWrongWord, markWordMastered, reviewWordSuccess, reviewWordFail } = useStorage()
  const [filter, setFilter] = useState('all') // all | due | mastered
  const [search, setSearch] = useState('')
  const [selectedWord, setSelectedWord] = useState(null)

  const filteredWords = useMemo(() => {
    let result = wrongWords
    if (filter === 'due') {
      result = result.filter(w => !w.mastered && getReviewStatus(w).urgent)
    } else if (filter === 'mastered') {
      result = result.filter(w => w.mastered)
    } else {
      result = result.filter(w => !w.mastered)
    }
    if (search.trim()) {
      result = result.filter(w =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        (w.translation || '').includes(search)
      )
    }
    return result.sort((a, b) => b.lastWrong - a.lastWrong)
  }, [wrongWords, filter, search])

  const dueCount = wrongWords.filter(w => !w.mastered && getReviewStatus(w).urgent).length
  const masteredCount = wrongWords.filter(w => w.mastered).length

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl text-[var(--ks-champagne)] font-medium">错词本</h1>
          <p className="text-sm text-[var(--ks-text-faint)] mt-1">
            基于艾宾浩斯遗忘曲线智能复习
          </p>
        </div>
        <Link
          to="/practice"
          className="px-4 py-2 text-sm rounded border border-[var(--ks-rule-strong)] bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)] font-medium hover:bg-[var(--ks-kinpaku-rich)] transition-colors"
        >
          开始复习
        </Link>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-[var(--ks-rule)] bg-[var(--ks-raised)] text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">总错词</p>
          <p className="text-xl font-medium text-[var(--ks-champagne)] mt-1">{wrongWords.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--ks-vermilion)]/30 bg-[var(--ks-vermilion)]/5 text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">待复习</p>
          <p className="text-xl font-medium text-[var(--ks-vermilion)] mt-1">{dueCount}</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--ks-patina)]/30 bg-[var(--ks-patina)]/5 text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--ks-text-faint)]">已掌握</p>
          <p className="text-xl font-medium text-[var(--ks-patina)] mt-1">{masteredCount}</p>
        </div>
      </div>

      {/* 筛选 + 搜索 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded border border-[var(--ks-rule)] overflow-hidden">
          {[
            { key: 'all', label: '未掌握' },
            { key: 'due', label: `待复习 (${dueCount})` },
            { key: 'mastered', label: '已掌握' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                filter === f.key
                  ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-lacquer-deep)]'
                  : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-text)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="搜索单词或释义…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs flex-1 min-w-[150px]"
        />
      </div>

      {/* 错词列表 */}
      {filteredWords.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-[var(--ks-text-muted)]">
            {filter === 'mastered' ? '还没有已掌握的错词' : '暂无错词，继续练习吧！'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWords.map(w => {
            const status = getReviewStatus(w)
            const progress = getEbbinghausProgress(w.reviewCount)
            const wb = getWordbank(w.levelId)
            return (
              <div
                key={w.word}
                className={`p-4 rounded-lg border bg-[var(--ks-raised)] transition-all ${
                  status.urgent && !w.mastered
                    ? 'border-[var(--ks-vermilion)]/30'
                    : 'border-[var(--ks-rule)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* 左侧：单词信息 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-[var(--ks-champagne)]">{w.word}</span>
                        {wb && <span className="text-xs text-[var(--ks-text-faint)]">{wb.name}</span>}
                      </div>
                      <p className="text-sm text-[var(--ks-text-muted)] truncate mt-0.5">{w.translation}</p>
                    </div>
                    <PronounceButton word={w.word} size="sm" />
                  </div>

                  {/* 右侧：状态 + 操作 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 复习状态 */}
                    {!w.mastered && (
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${
                        status.urgent
                          ? 'border-[var(--ks-vermilion)]/40 text-[var(--ks-vermilion)]'
                          : 'border-[var(--ks-rule)] text-[var(--ks-text-faint)]'
                      }`}>
                        {status.label}
                      </span>
                    )}
                    {/* 错误次数 */}
                    <span className="text-xs font-mono text-[var(--ks-text-faint)]">
                      ×{w.wrongCount}
                    </span>
                    {/* 艾宾浩斯进度 */}
                    {!w.mastered && (
                      <span className="text-xs font-mono text-[var(--ks-text-faint)]">
                        {progress.current}/{progress.total}
                      </span>
                    )}
                    {w.mastered && (
                      <span className="px-2 py-0.5 text-xs rounded-full border border-[var(--ks-patina)]/40 text-[var(--ks-patina)]">
                        ✓ 已掌握
                      </span>
                    )}
                    {/* 操作按钮 */}
                    {!w.mastered && (
                      <>
                        <button
                          onClick={() => reviewWordSuccess(w.word)}
                          className="px-2 py-1 text-xs rounded border border-[var(--ks-patina)]/40 text-[var(--ks-patina)] hover:bg-[var(--ks-patina)]/10 transition-colors"
                          title="标记复习成功"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => reviewWordFail(w.word)}
                          className="px-2 py-1 text-xs rounded border border-[var(--ks-vermilion)]/40 text-[var(--ks-vermilion)] hover:bg-[var(--ks-vermilion)]/10 transition-colors"
                          title="标记复习失败"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => markWordMastered(w.word)}
                      className="px-2 py-1 text-xs rounded border border-[var(--ks-rule)] text-[var(--ks-text-faint)] hover:border-[var(--ks-patina)] hover:text-[var(--ks-patina)] transition-colors"
                      title="标记为已掌握"
                    >
                      掌握
                    </button>
                    <button
                      onClick={() => removeWrongWord(w.word)}
                      className="px-2 py-1 text-xs rounded border border-[var(--ks-rule)] text-[var(--ks-text-faint)] hover:border-[var(--ks-vermilion)] hover:text-[var(--ks-vermilion)] transition-colors"
                      title="删除"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 艾宾浩斯进度条 */}
                {!w.mastered && progress.total > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: progress.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full ${
                          i < progress.current ? 'bg-[var(--ks-patina)]' : 'bg-[var(--ks-graphite)]'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
