import { useState, useMemo } from 'react'
import { useStorage } from '../context/StorageContext'
import { getReviewStatus, getEbbinghausProgress } from '../utils/ebbinghaus'
import { getWordbank } from '../data/wordbank-meta'
import PronounceButton from '../components/PronounceButton'
import { Link } from 'react-router-dom'

export default function WrongBook() {
  const { wrongWords, removeWrongWord, markWordMastered, reviewWordSuccess, reviewWordFail } = useStorage()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

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
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl text-[var(--text-bright)] font-semibold">错词本</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono uppercase tracking-wider">
            Ebbinghaus Review System
          </p>
        </div>
        <Link
          to="/practice"
          className="px-5 py-2.5 text-sm rounded-xl bg-[var(--gold)] text-[var(--bg-base)] font-semibold hover:bg-[var(--gold-bright)] hover:shadow-[var(--shadow-gold)] active:scale-95 transition-all duration-300"
        >
          开始复习
        </Link>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in stagger-1">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] text-center card-hover">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">总错词</p>
          <p className="text-2xl font-display font-medium text-[var(--text-bright)] mt-1">{wrongWords.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--vermilion)]/30 bg-[var(--vermilion-glow)] text-center card-hover">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">待复习</p>
          <p className="text-2xl font-display font-medium text-[var(--vermilion-bright)] mt-1">{dueCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--patina)]/30 bg-[var(--patina-glow)] text-center card-hover">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-faint)]">已掌握</p>
          <p className="text-2xl font-display font-medium text-[var(--patina-bright)] mt-1">{masteredCount}</p>
        </div>
      </div>

      {/* 筛选 + 搜索 */}
      <div className="flex items-center gap-3 flex-wrap animate-fade-in stagger-2">
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-raised)]">
          {[
            { key: 'all', label: '未掌握' },
            { key: 'due', label: `待复习 (${dueCount})` },
            { key: 'mastered', label: '已掌握' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-xs font-medium transition-all duration-300 ${
                filter === f.key
                  ? 'bg-[var(--gold)] text-[var(--bg-base)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-bright)]'
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
        <div className="p-12 md:p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] animate-scale-in">
          <p className="text-5xl mb-4 animate-float">📭</p>
          <p className="text-[var(--text-muted)] font-medium">
            {filter === 'mastered' ? '还没有已掌握的错词' : '暂无错词，继续练习吧'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredWords.map((w, i) => {
            const status = getReviewStatus(w)
            const progress = getEbbinghausProgress(w.reviewCount)
            const wb = getWordbank(w.levelId)
            return (
              <div
                key={w.word}
                className={`p-4 rounded-xl border bg-[var(--bg-raised)] card-hover animate-fade-in ${
                  status.urgent && !w.mastered
                    ? 'border-[var(--vermilion)]/30'
                    : 'border-[var(--border)]'
                } ${i < 8 ? `stagger-${i + 1}` : ''}`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* 左侧：单词信息 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-[var(--text-bright)]">{w.word}</span>
                        {wb && <span className="text-[10px] font-mono text-[var(--text-faint)] uppercase tracking-wider">{wb.name}</span>}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] truncate mt-0.5">{w.translation}</p>
                    </div>
                    <PronounceButton word={w.word} size="sm" />
                  </div>

                  {/* 右侧：状态 + 操作 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!w.mastered && (
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                        status.urgent
                          ? 'border-[var(--vermilion)]/40 text-[var(--vermilion-bright)]'
                          : 'border-[var(--border)] text-[var(--text-faint)]'
                      }`}>
                        {status.label}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[var(--text-faint)]">
                      ×{w.wrongCount}
                    </span>
                    {!w.mastered && (
                      <span className="text-[10px] font-mono text-[var(--text-faint)]">
                        {progress.current}/{progress.total}
                      </span>
                    )}
                    {w.mastered && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-[var(--patina)]/40 text-[var(--patina-bright)]">
                        ✓ 已掌握
                      </span>
                    )}
                    {!w.mastered && (
                      <>
                        <button
                          onClick={() => reviewWordSuccess(w.word)}
                          className="w-7 h-7 flex items-center justify-center text-xs rounded-lg border border-[var(--patina)]/40 text-[var(--patina-bright)] hover:bg-[var(--patina-glow)] active:scale-90 transition-all duration-200"
                          title="标记复习成功"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => reviewWordFail(w.word)}
                          className="w-7 h-7 flex items-center justify-center text-xs rounded-lg border border-[var(--vermilion)]/40 text-[var(--vermilion-bright)] hover:bg-[var(--vermilion-glow)] active:scale-90 transition-all duration-200"
                          title="标记复习失败"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => markWordMastered(w.word)}
                      className="px-2 py-1 text-[10px] rounded-lg border border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--patina)] hover:text-[var(--patina-bright)] transition-all duration-200"
                      title="标记为已掌握"
                    >
                      掌握
                    </button>
                    <button
                      onClick={() => removeWrongWord(w.word)}
                      className="px-2 py-1 text-[10px] rounded-lg border border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--vermilion)] hover:text-[var(--vermilion-bright)] transition-all duration-200"
                      title="删除"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 艾宾浩斯进度条 */}
                {!w.mastered && progress.total > 0 && (
                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: progress.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          i < progress.current
                            ? 'bg-[var(--patina)]'
                            : 'bg-[var(--bg-input)]'
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
