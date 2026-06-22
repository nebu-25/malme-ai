import { Loader2 } from 'lucide-react'

// 4.4 처리중 화면
export default function ProcessingPage() {
  // TODO: ① 텍스트 변환(STT) → ② AI 요약/태그/카테고리 → ③ Firestore 저장
  //       완료 시 navigate(`/memo/${newMemoId}`)
  return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center', gap: 16, textAlign: 'center' }}>
      <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
      <p style={{ fontSize: 16 }}>AI가 메모를 정리하고 있어요…</p>
      <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>텍스트로 바꾸는 중 · 요약/태그 정리 중 · 저장 중</p>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
