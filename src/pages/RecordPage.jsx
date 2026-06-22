import { useNavigate } from 'react-router-dom'
import { Square, X } from 'lucide-react'

// 4.3 녹음 화면
export default function RecordPage() {
  const navigate = useNavigate()

  const handleStop = () => {
    // TODO: MediaRecorder 녹음 종료 → 처리중 화면으로 전달
    navigate('/processing')
  }

  return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center', gap: 24, textAlign: 'center' }}>
      <p style={{ fontSize: 18, color: 'var(--color-muted)' }}>말씀해 주세요…</p>
      {/* TODO: 파형/타이머 표시 */}
      <div style={{ fontSize: 40, fontVariantNumeric: 'tabular-nums' }}>00:00</div>

      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <button onClick={() => navigate(-1)} aria-label="취소" style={circleBtn('#e5e7eb', '#374151')}>
          <X size={28} />
        </button>
        <button onClick={handleStop} aria-label="정지" style={circleBtn('#ef4444', '#fff')}>
          <Square size={28} />
        </button>
      </div>
    </div>
  )
}

const circleBtn = (bg, color) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  border: 'none',
  background: bg,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})
