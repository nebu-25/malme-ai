import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'

// 4.6 검색 화면
export default function SearchPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} aria-label="뒤로" style={{ border: 'none', background: 'transparent', padding: 4 }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f1f3f9', borderRadius: 8 }}>
          <Search size={18} color="var(--color-muted)" />
          <input
            placeholder="메모 검색…"
            style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15 }}
          />
        </div>
      </header>

      {/* TODO: 최근 검색어 / 검색 결과 카드 목록 (원문·요약 내 키워드 매칭) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
        검색어를 입력해 과거 메모를 찾아보세요.
      </div>
    </div>
  )
}
