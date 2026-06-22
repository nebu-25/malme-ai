import { useNavigate } from 'react-router-dom'
import { Mic, Search, Settings } from 'lucide-react'

// 4.2 홈/메모 목록 화면
export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>내 메모</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/search')} aria-label="검색" style={iconBtn}>
            <Search size={20} />
          </button>
          <button onClick={() => navigate('/settings')} aria-label="설정" style={iconBtn}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* TODO: 태그 필터 칩 / 날짜별 메모 카드 목록 (Firestore 연동) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
        아직 메모가 없어요. 마이크를 눌러 첫 메모를 남겨보세요.
      </div>

      <button
        onClick={() => navigate('/record')}
        aria-label="녹음 시작"
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--color-primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
        }}
      >
        <Mic size={32} />
      </button>
    </div>
  )
}

const iconBtn = {
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text)',
  padding: 4,
}
