import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ChevronLeft, LogOut, Loader2, User } from 'lucide-react'
import { auth } from '../firebase.js'

// 설정 화면 (PRD 4.7) — 계정 정보 + 실제 로그아웃
export default function SettingsPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')

  // 로그인 필수 — 미로그인 시 로그인 화면으로
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthChecked(true)
      if (!u) navigate('/', { replace: true })
    })
    return () => unsub()
  }, [navigate])

  const handleLogout = async () => {
    setError('')
    setLoggingOut(true)
    try {
      await signOut(auth)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('로그아웃 실패:', err)
      setError('로그아웃에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setLoggingOut(false)
    }
  }

  if (!authChecked) {
    return (
      <div style={styles.fullCenter}>
        <Loader2 size={28} className="set-spin" style={{ color: '#a855f7' }} />
        <style>{css}</style>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header style={styles.header}>
        <button onClick={() => navigate(-1)} aria-label="뒤로" style={styles.iconBtn}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={styles.title}>설정</h1>
      </header>

      {/* 계정 정보 카드 */}
      <div style={styles.card}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" style={styles.avatar} referrerPolicy="no-referrer" />
        ) : (
          <div style={styles.avatarFallback}>
            <User size={26} color="#fff" />
          </div>
        )}
        <div style={styles.accountText}>
          {user?.displayName && <p style={styles.name}>{user.displayName}</p>}
          <p style={styles.email}>{user?.email || '로그인된 계정'}</p>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={handleLogout} disabled={loggingOut} style={styles.logoutBtn}>
        {loggingOut ? (
          <Loader2 size={18} className="set-spin" />
        ) : (
          <LogOut size={18} />
        )}
        {loggingOut ? '로그아웃 중…' : '로그아웃'}
      </button>

      <p style={styles.version}>말메 AI v0.1.0</p>
    </div>
  )
}

const css = `.set-spin{animation:setspin 1s linear infinite}@keyframes setspin{to{transform:rotate(360deg)}}`

// 보라/핑크 톤 (components 디자인과 통일)
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '24px 20px',
    maxWidth: 480,
    margin: '0 auto',
    background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)',
  },
  fullCenter: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { display: 'flex', alignItems: 'center', gap: 8 },
  iconBtn: { border: 'none', background: 'transparent', color: '#7c3aed', padding: 4, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 800, color: '#7c3aed', margin: 0 },
  card: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', border: '1px solid #f3e8ff', borderRadius: 18, padding: 16,
    boxShadow: '0 6px 18px rgba(168,85,247,0.10)',
  },
  avatar: { width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: {
    width: 52, height: 52, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#a855f7,#ec4899)',
  },
  accountText: { display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  name: { fontSize: 16, fontWeight: 700, color: '#3b0764', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  email: { fontSize: 13, color: '#a78bfa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  error: { color: '#dc2626', fontSize: 13, textAlign: 'center', margin: 0 },
  logoutBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', fontSize: 15, fontWeight: 700,
    color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, cursor: 'pointer',
  },
  version: { textAlign: 'center', fontSize: 12, color: '#a78bfa', marginTop: 'auto' },
}
