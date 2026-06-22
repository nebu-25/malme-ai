import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import VoiceRecorder from './components/VoiceRecorder.jsx'
import MemoList from './components/MemoList.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

// 라우트 구성 — 실제 화면 4개로 통합
// · 녹음/처리중/결과 미리보기 → VoiceRecorder 한 화면 (/home)
// · 목록/검색/상세·편집·삭제(모달) → MemoList 한 화면 (/memos)
// · 계정·로그아웃 → SettingsPage (/settings)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<VoiceRecorder />} />
      <Route path="/memos" element={<MemoList />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
