import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Share2, Trash2 } from 'lucide-react'

// 4.5 메모 상세 화면
export default function MemoDetailPage() {
  const navigate = useNavigate()
  const { memoId } = useParams()

  // TODO: memoId로 Firestore에서 메모 조회

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} aria-label="뒤로" style={iconBtn}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button aria-label="공유" style={iconBtn}><Share2 size={20} /></button>
          <button aria-label="삭제" style={iconBtn}><Trash2 size={20} /></button>
        </div>
      </header>

      <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>메모 ID: {memoId}</p>

      {/* TODO: 요약(강조), 태그 칩 3개, 카테고리, 원문, 작성일시 */}
      <h2 style={{ fontSize: 18 }}>AI 요약이 여기에 표시됩니다</h2>
      <p style={{ color: 'var(--color-muted)' }}>원문 텍스트가 여기에 표시됩니다.</p>
    </div>
  )
}

const iconBtn = {
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text)',
  padding: 4,
}
