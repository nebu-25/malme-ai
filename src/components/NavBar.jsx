import { useLocation, useNavigate } from 'react-router-dom'
import { Mic, LayoutList } from 'lucide-react'

// 하단 내비게이션 바 (홈/메모목록)
const ITEMS = [
  { label: '홈', icon: Mic, path: '/home' },
  { label: '메모목록', icon: LayoutList, path: '/memos' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={styles.bar}>
      <div style={styles.inner}>
        {ITEMS.map(({ label, icon: Icon, path }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{ ...styles.item, color: active ? '#9333ea' : '#b9a8d6' }}
            >
              <Icon size={22} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

const styles = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #f3e8ff',
    zIndex: 50,
  },
  inner: {
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
  },
  item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '10px 0 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
}
