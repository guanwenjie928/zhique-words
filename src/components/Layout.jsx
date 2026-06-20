import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/practice', label: '练习', icon: PracticeIcon },
  { path: '/wrong-book', label: '错词本', icon: BookIcon },
  { path: '/stats', label: '统计', icon: ChartIcon },
  { path: '/daily', label: '每日', icon: DailyIcon },
]

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" />
    </svg>
  )
}
function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a2 2 0 012 2v14H6a2 2 0 01-2-2V4z" />
      <path d="M18 4v16M8 8h6M8 12h6" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}
function DailyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
      <circle cx="12" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** 顶部导航栏（桌面端） */
export function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border-gold)] bg-[var(--bg-raised)] transition-all duration-300 group-hover:border-[var(--border-gold-strong)] group-hover:shadow-[var(--shadow-gold)]">
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🐦</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-wide text-[var(--text-bright)] group-hover:text-[var(--gold)] transition-colors duration-300">
              Spell Free
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-faint)] mt-0.5">
              go go go
            </span>
          </div>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'text-[var(--gold)] bg-[var(--gold-glow)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-bright)] hover:bg-[var(--bg-raised)]'
                }`}
              >
                <Icon />
                <span>{label}</span>
                {active && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-px bg-[var(--gold)] rounded-full" />
                )}
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-300 ${
                active ? 'text-[var(--gold)]' : 'text-[var(--text-faint)]'
              }`}
            >
              <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
                <Icon />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--gold)] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/** 全局布局 */
export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        key={location.pathname}
        className="flex-1 mx-auto w-full max-w-5xl px-4 lg:px-8 py-6 pb-24 md:pb-10 page-enter"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
