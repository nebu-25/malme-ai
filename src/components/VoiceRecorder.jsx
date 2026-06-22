import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Mic, Square, Loader2, Check, RotateCcw, Save } from 'lucide-react'
import { auth, db } from '../firebase.js'
import { transcribeAudio, summarizeMemo } from '../utils/aiProcessor.js'
import NavBar from './NavBar.jsx'

// 음성 녹음 화면 (PRD 4.3 + 4.4)
// 흐름: 대기 → 녹음 중 → 변환 중 → AI 정리 중 → 완료 → 저장
const STATUS = {
  idle: { label: '마이크를 눌러 메모를 시작하세요', busy: false },
  recording: { label: '녹음 중…  말씀해 주세요', busy: false },
  transcribing: { label: '텍스트로 바꾸는 중…', busy: true },
  summarizing: { label: 'AI가 요약·태그·카테고리 정리 중…', busy: true },
  done: { label: '정리 완료! 저장할 수 있어요', busy: false },
  saving: { label: '저장 중…', busy: true },
  saved: { label: '저장되었습니다 ✓', busy: false },
}

export default function VoiceRecorder() {
  const navigate = useNavigate()

  // 로그인 필수 — 인증 확인
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [status, setStatus] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState(null) // { rawText, summary, tags, category }
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Firebase Auth 체크: 미로그인 시 로그인 화면으로
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthChecked(true)
      if (!u) navigate('/', { replace: true })
    })
    return () => unsub()
  }, [navigate])

  // 언마운트 시 자원 정리
  useEffect(() => {
    return () => {
      stopTimer()
      cleanupStream()
    }
  }, [])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 마이크 스트림 정리 (track.stop())
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // data:audio/webm;base64,xxxx → 앞부분 제거하고 base64만
        const base64 = String(reader.result).split(',')[1] || ''
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

  const startRecording = async () => {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = handleRecordingStop

      recorder.start()
      setStatus('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch (err) {
      console.error('마이크 접근 실패:', err)
      setError('마이크를 사용할 수 없어요. 브라우저 권한을 확인해 주세요.')
      setStatus('idle')
    }
  }

  const stopRecording = () => {
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop() // → onstop 트리거
    }
  }

  const cancelRecording = () => {
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    cleanupStream()
    chunksRef.current = []
    setStatus('idle')
    setSeconds(0)
  }

  // 녹음 종료 → 마이크 정리 → STT → AI 정리
  const handleRecordingStop = async () => {
    cleanupStream() // track.stop()으로 마이크 끄기

    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const base64 = await blobToBase64(blob)

      setStatus('transcribing')
      const rawText = await transcribeAudio(base64, 'audio/webm')

      setStatus('summarizing')
      const { summary, tags, category } = await summarizeMemo(rawText)

      setResult({ rawText, summary, tags, category })
      setStatus('done')
    } catch (err) {
      console.error('AI 처리 실패:', err)
      setError('처리 중 문제가 발생했어요. 다시 시도해 주세요.')
      setStatus('idle')
    }
  }

  // Firestore 'memos' 저장 (PRD 6장 데이터 구조)
  const saveMemo = async () => {
    if (!result || !user) return
    setError('')
    setStatus('saving')
    try {
      await addDoc(collection(db, 'memos'), {
        userId: user.uid,
        rawText: result.rawText,
        summary: result.summary,
        tags: result.tags,
        category: result.category,
        createdAt: serverTimestamp(),
        // audioUrl: (선택) Firebase Storage 연동 시 추가
      })
      setStatus('saved')
      // 잠시 후 메모 목록으로 이동 (목록의 카드를 누르면 상세·편집·삭제 모달이 열림)
      setTimeout(() => navigate('/memos'), 800)
    } catch (err) {
      console.error('저장 실패:', err)
      setError('저장에 실패했어요. 다시 시도해 주세요.')
      setStatus('done')
    }
  }

  const reset = () => {
    setResult(null)
    setError('')
    setSeconds(0)
    setStatus('idle')
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const info = STATUS[status]

  if (!authChecked) {
    return (
      <div style={styles.page}>
        <Loader2 size={28} className="vr-spin" style={{ color: '#a855f7' }} />
        <style>{spinKeyframes}</style>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>새 음성 메모</h1>
        {user && <span style={styles.user}>{user.displayName || user.email}</span>}
      </header>

      {/* 상태 표시 */}
      <div style={styles.statusBox}>
        {info.busy && <Loader2 size={22} className="vr-spin" style={{ color: '#a855f7' }} />}
        <span style={styles.statusText}>{info.label}</span>
      </div>

      {/* 타이머 (녹음 중) */}
      {status === 'recording' && <div style={styles.timer}>{mmss}</div>}

      {/* 결과 미리보기 */}
      {result && (status === 'done' || status === 'saving' || status === 'saved') && (
        <div style={styles.resultCard}>
          <p style={styles.summary}>{result.summary}</p>
          <div style={styles.tags}>
            {result.tags.map((t) => (
              <span key={t} style={styles.tag}>#{t}</span>
            ))}
            <span style={styles.category}>{result.category}</span>
          </div>
          <p style={styles.rawText}>{result.rawText}</p>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      {/* 컨트롤 */}
      <div style={styles.controls}>
        {status === 'idle' && (
          <button onClick={startRecording} style={styles.micBtn} aria-label="녹음 시작">
            <Mic size={34} />
          </button>
        )}

        {status === 'recording' && (
          <div style={styles.row}>
            <button onClick={cancelRecording} style={styles.secondaryBtn} aria-label="취소">취소</button>
            <button onClick={stopRecording} style={styles.stopBtn} aria-label="정지">
              <Square size={28} />
            </button>
          </div>
        )}

        {status === 'done' && (
          <div style={styles.row}>
            <button onClick={reset} style={styles.secondaryBtn}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> 다시 녹음
            </button>
            <button onClick={saveMemo} style={styles.saveBtn}>
              <Save size={18} style={{ marginRight: 6 }} /> 저장
            </button>
          </div>
        )}

        {status === 'saved' && (
          <div style={styles.savedBadge}>
            <Check size={20} /> 저장 완료
          </div>
        )}
      </div>

      <NavBar />
      <style>{spinKeyframes}</style>
    </div>
  )
}

const spinKeyframes = `.vr-spin{animation:vrspin 1s linear infinite}@keyframes vrspin{to{transform:rotate(360deg)}}`

// 모바일 우선 · 따뜻한 보라/핑크 톤
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '24px 20px 96px',
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    background: 'linear-gradient(180deg, #faf5ff 0%, #fff 60%)',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: 800, color: '#7c3aed', margin: 0 },
  user: { fontSize: 12, color: '#a78bfa', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statusBox: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  statusText: { fontSize: 15, color: '#9333ea', fontWeight: 600, textAlign: 'center' },
  timer: { fontSize: 44, fontWeight: 700, color: '#ec4899', fontVariantNumeric: 'tabular-nums' },
  resultCard: {
    width: '100%',
    background: '#fff',
    border: '1px solid #f3e8ff',
    borderRadius: 20,
    padding: 18,
    boxShadow: '0 8px 24px rgba(168,85,247,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  summary: { fontSize: 16, fontWeight: 700, color: '#3b0764', margin: 0 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  tag: { fontSize: 13, color: '#9333ea', background: '#f5e8ff', padding: '4px 10px', borderRadius: 999 },
  category: { fontSize: 12, color: '#fff', background: 'linear-gradient(135deg,#a855f7,#ec4899)', padding: '4px 10px', borderRadius: 999, marginLeft: 'auto' },
  rawText: { fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: 0 },
  error: { color: '#dc2626', fontSize: 13, textAlign: 'center', margin: 0 },
  controls: { marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' },
  row: { display: 'flex', gap: 16, alignItems: 'center', width: '100%', justifyContent: 'center' },
  micBtn: {
    width: 88, height: 88, borderRadius: '50%', border: 'none',
    background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 28px rgba(236,72,153,0.4)',
  },
  stopBtn: {
    width: 72, height: 72, borderRadius: '50%', border: 'none',
    background: '#ef4444', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 18px', fontSize: 14, fontWeight: 600,
    color: '#7c3aed', background: '#fff', border: '1px solid #e9d5ff', borderRadius: 14,
  },
  saveBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 28px', fontSize: 15, fontWeight: 700,
    color: '#fff', background: 'linear-gradient(135deg,#a855f7,#ec4899)', border: 'none', borderRadius: 14,
  },
  savedBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 20px', fontSize: 15, fontWeight: 700,
    color: '#16a34a', background: '#f0fdf4', borderRadius: 14,
  },
}
