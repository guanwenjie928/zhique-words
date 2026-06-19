import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/practice', label: '练习', icon: PracticeIcon },
  { path: '/wrong-book', label: '错词本', icon: BookIcon },
  { path: '/stats', label: '统计', icon: ChartIcon },
  { path: '/daily', label: '每日', icon: DailyIcon },
]

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <path d="M12 3v18M3 12h18" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" strokeLinecap="round"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <path d="M4 4h12a2 2 0 012 2v14H6a2 2 0 01-2-2V4z" strokeLinejoin="round"/>
      <path d="M18 4v16M8 8h6M8 12h6" strokeLinecap="round"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round"/>
    </svg>
  )
}
function DailyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <rect x="3" y="5" width="18" height="16" rx="2" strokeLinejoin="round"/>
      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round"/>
      <circle cx="12" cy="14" r="2" fill="currentColor"/>
    </svg>
  )
}

/** 顶部导航栏（桌面端） */
export function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ks-rule)] bg-[var(--ks-lacquer)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl">🐦</span>
          <span className="font-display text-lg font-semibold tracking-wide text-[var(--ks-champagne)] group-hover:text-[var(--ks-kinpaku)] transition-colors">
            知雀单词
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all duration-200 ${
                  active
                    ? 'text-[var(--ks-kinpaku)] bg-[var(--ks-kinpaku)]/8'
                    : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-text)] hover:bg-[var(--ks-raised)]'
                }`}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

/** 底部导航栏（移动端） */
export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ks-rule)] bg-[var(--ks-lacquer-deep)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-[var(--ks-kinpaku)]' : 'text-[var(--ks-text-faint)]'
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/** 全局布局 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--ks-lacquer)]">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 lg:px-6 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
