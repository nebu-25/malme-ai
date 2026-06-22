import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { Mic } from 'lucide-react'
import { auth, googleProvider } from '../firebase.js'

// 로그인 화면 (PRD 4.1)
// 구성요소: 말메 AI 로고/슬로건, "Google로 로그인" 버튼, 서비스 소개 한 줄
export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/home')
    } catch (err) {
      console.error('Google 로그인 실패:', err)
      setError('로그인에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoCircle}>
          <Mic size={36} color="#fff" />
        </div>

        <h1 style={styles.title}>말메 AI</h1>
        <p style={styles.slogan}>말하면 AI가 정리해드려요</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ ...styles.googleBtn, opacity: loading ? 0.7 : 1 }}
        >
          <GoogleIcon />
          {loading ? '로그인 중…' : 'Google로 로그인'}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      <p style={styles.footer}>한국어 특화 제2의 뇌, 말메 AI</p>
    </div>
  )
}

// 구글 G 로고 (SVG)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// 따뜻한 보라/핑크 톤, 둥근 모서리
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    background: 'linear-gradient(160deg, #f5e8ff 0%, #ffe3f1 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '40px 28px',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius: 28,
    boxShadow: '0 12px 40px rgba(168, 85, 247, 0.18)',
    textAlign: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)',
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    margin: '8px 0 0',
    color: '#7c3aed',
  },
  slogan: {
    fontSize: 15,
    color: '#9333ea',
    margin: 0,
  },
  googleBtn: {
    marginTop: 20,
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: '#3b0764',
    background: '#fff',
    border: '1px solid #e9d5ff',
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.12)',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    margin: '4px 0 0',
  },
  footer: {
    fontSize: 12,
    color: '#a78bfa',
    margin: 0,
  },
}
