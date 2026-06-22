import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Login from './components/Login.jsx'

// 로그인 화면(진입점)은 즉시 로드, 인증 이후 화면들은 지연 로드(코드 스플리팅)로
// 초기 번들을 가볍게 한다. firestore/auth 등 무거운 의존성도 필요한 시점에 로드됨.
const VoiceRecorder = lazy(() => import('./components/VoiceRecorder.jsx'))
const MemoList = lazy(() => import('./components/MemoList.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))

// 청크 로딩 중 잠깐 보여줄 폴백
function RouteFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ color: '#a855f7', animation: 'app-spin 1s linear infinite' }} />
      <style>{`@keyframes app-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// 라우트 구성 — 실제 화면 4개로 통합
// · 녹음/처리중/결과 미리보기 → VoiceRecorder 한 화면 (/home)
// · 목록/검색/상세·편집·삭제(모달) → MemoList 한 화면 (/memos)
// · 계정·로그아웃 → SettingsPage (/settings)
export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<VoiceRecorder />} />
        <Route path="/memos" element={<MemoList />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
