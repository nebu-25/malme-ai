import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import VoiceRecorder from './components/VoiceRecorder.jsx'
import MemoList from './components/MemoList.jsx'
import RecordPage from './pages/RecordPage.jsx'
import ProcessingPage from './pages/ProcessingPage.jsx'
import MemoDetailPage from './pages/MemoDetailPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

// 라우트 구성 — PRD 3장 "화면 목록" 기준
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<VoiceRecorder />} />
      <Route path="/memos" element={<MemoList />} />
      <Route path="/record" element={<RecordPage />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/memo/:memoId" element={<MemoDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
