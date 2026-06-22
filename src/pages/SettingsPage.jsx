import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut } from 'lucide-react'

// 4.7 설정 화면
export default function SettingsPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Firebase Auth signOut
    navigate('/')
  }

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} aria-label="뒤로" style={{ border: 'none', background: 'transparent', padding: 4 }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: 20, margin: 0 }}>설정</h1>
      </header>

      {/* TODO: 계정 정보(이메일/프로필) 표시 */}
      <div style={{ marginTop: 16, color: 'var(--color-muted)' }}>로그인된 계정 정보가 여기에 표시됩니다.</div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px',
          fontSize: 15,
          border: '1px solid #ef4444',
          color: '#ef4444',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <LogOut size={18} /> 로그아웃
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted)', marginTop: 16 }}>
        말메 AI v0.1.0
      </p>
    </div>
  )
}
