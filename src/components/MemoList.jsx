import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Search, Settings, Loader2, X, Pencil, Trash2, Check } from 'lucide-react'
import { auth, db } from '../firebase.js'
import NavBar from './NavBar.jsx'

// 홈/메모 목록 화면 (PRD 4.2)
const CATEGORIES = ['생활', '업무', '아이디어', '기타']

export default function MemoList() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeCategory, setActiveCategory] = useState('전체')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState(null) // 상세 모달 대상 메모

  // 로그인 필수
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthChecked(true)
      if (!u) navigate('/', { replace: true })
    })
    return () => unsub()
  }, [navigate])

  // 내 메모 실시간 구독 (최신순)
  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError('')

    // ⚠️ userId == + orderBy(createdAt) 복합 인덱스가 필요할 수 있습니다.
    //    Firebase 콘솔 → Firestore → 색인:  memos { userId ASC, createdAt DESC }
    //    (에러 메시지의 링크를 누르면 자동 생성됩니다.)
    const q = query(
      collection(db, 'memos'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMemos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('메모 조회 실패:', err)
        setError('메모를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
        setLoading(false)
      },
    )
    return () => unsub()
  }, [user])

  // 카테고리 탭 + 검색어 클라이언트 필터링
  const visibleMemos = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return memos.filter((m) => {
      if (activeCategory !== '전체' && m.category !== activeCategory) return false
      if (!kw) return true
      const haystack = [m.summary, m.rawText, ...(m.tags || [])].join(' ').toLowerCase()
      return haystack.includes(kw)
    })
  }, [memos, activeCategory, search])

  if (!authChecked) {
    return (
      <div style={styles.fullCenter}>
        <Loader2 size={28} className="ml-spin" style={{ color: '#a855f7' }} />
        <style>{css}</style>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header style={styles.header}>
        <h1 style={styles.title}>내 메모</h1>
        <button onClick={() => navigate('/settings')} aria-label="설정" style={styles.iconBtn}>
          <Settings size={20} />
        </button>
      </header>

      {/* 검색창 */}
      <div style={styles.searchBox}>
        <Search size={18} color="#a78bfa" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="메모 검색 (요약·원문·태그)"
          style={styles.searchInput}
        />
      </div>

      {/* 카테고리 필터 탭 */}
      <div style={styles.tabRow}>
        {['전체', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={cat === activeCategory ? styles.tabActive : styles.tab}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 목록 (반응형 그리드) */}
      {loading ? (
        <div style={styles.fullCenter}>
          <Loader2 size={26} className="ml-spin" style={{ color: '#a855f7' }} />
        </div>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : visibleMemos.length === 0 ? (
        <div style={styles.empty}>
          {memos.length === 0
            ? '아직 메모가 없어요.\n홈에서 마이크를 눌러 첫 메모를 남겨보세요.'
            : '조건에 맞는 메모가 없어요.'}
        </div>
      ) : (
        <div className="ml-grid">
          {visibleMemos.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)} style={styles.card}>
              <p style={styles.summary}>{m.summary || m.rawText || '(내용 없음)'}</p>
              <div style={styles.tags}>
                {(m.tags || []).map((t, idx) => (
                  <span key={`${t}-${idx}`} style={styles.tag}>#{t}</span>
                ))}
              </div>
              <div style={styles.cardFooter}>
                {m.category && <span style={styles.category}>{m.category}</span>}
                <span style={styles.date}>{formatDate(m.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <MemoDetailModal
          memo={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <NavBar />
    </div>
  )
}

// 상세 모달 — 보기 / 편집(updateDoc) / 삭제(deleteDoc)
function MemoDetailModal({ memo, onClose }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    summary: memo.summary || '',
    rawText: memo.rawText || '',
    category: memo.category || '기타',
    tagsText: (memo.tags || []).join(', '),
  })

  const handleSave = async () => {
    setSaving(true)
    setErr('')
    try {
      const tags = form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await updateDoc(doc(db, 'memos', memo.id), {
        summary: form.summary.trim(),
        rawText: form.rawText.trim(),
        category: form.category,
        tags,
      })
      setEditing(false)
    } catch (e) {
      console.error('수정 실패:', e)
      setErr('수정에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('이 메모를 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setErr('')
    try {
      await deleteDoc(doc(db, 'memos', memo.id))
      onClose()
    } catch (e) {
      console.error('삭제 실패:', e)
      setErr('삭제에 실패했어요. 다시 시도해 주세요.')
      setSaving(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHead}>
          <span style={styles.modalCategory}>{editing ? '메모 편집' : memo.category}</span>
          <button onClick={onClose} aria-label="닫기" style={styles.iconBtn}>
            <X size={20} />
          </button>
        </div>

        {editing ? (
          <>
            <label style={styles.label}>요약</label>
            <input
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              style={styles.input}
            />
            <label style={styles.label}>원문</label>
            <textarea
              value={form.rawText}
              onChange={(e) => setForm({ ...form, rawText: e.target.value })}
              rows={4}
              style={{ ...styles.input, resize: 'vertical' }}
            />
            <label style={styles.label}>카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={styles.input}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label style={styles.label}>태그 (쉼표로 구분)</label>
            <input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <p style={styles.modalSummary}>{memo.summary}</p>
            <div style={styles.tags}>
              {(memo.tags || []).map((t, idx) => (
                <span key={`${t}-${idx}`} style={styles.tag}>#{t}</span>
              ))}
            </div>
            <p style={styles.modalRaw}>{memo.rawText}</p>
            <p style={styles.date}>{formatDate(memo.createdAt)}</p>
          </>
        )}

        {err && <p style={styles.error}>{err}</p>}

        <div style={styles.modalActions}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={styles.btnGhost} disabled={saving}>
                취소
              </button>
              <button onClick={handleSave} style={styles.btnPrimary} disabled={saving}>
                <Check size={16} style={{ marginRight: 6 }} /> {saving ? '저장 중…' : '저장'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} style={styles.btnDanger} disabled={saving}>
                <Trash2 size={16} style={{ marginRight: 6 }} /> 삭제
              </button>
              <button onClick={() => setEditing(true)} style={styles.btnPrimary}>
                <Pencil size={16} style={{ marginRight: 6 }} /> 편집
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// serverTimestamp() 반영 전(null)일 수 있으니 가드
function formatDate(ts) {
  if (!ts || typeof ts.toDate !== 'function') return '방금 전'
  return ts.toDate().toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 반응형 그리드: 모바일 1열 / 태블릿 2열 / PC 3열
const css = `
.ml-spin{animation:mlspin 1s linear infinite}
@keyframes mlspin{to{transform:rotate(360deg)}}
.ml-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.ml-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:960px){.ml-grid{grid-template-columns:repeat(3,1fr)}}
`

// 보라/핑크 톤
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: '24px 20px 88px',
    background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)',
  },
  fullCenter: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: 800, color: '#7c3aed', margin: 0 },
  iconBtn: { border: 'none', background: 'transparent', color: '#7c3aed', padding: 4, cursor: 'pointer' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: '#f5e8ff', borderRadius: 14,
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#3b0764' },
  tabRow: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 },
  tab: {
    flex: '0 0 auto', fontSize: 13, fontWeight: 600, color: '#9333ea',
    background: '#f5e8ff', border: '1px solid #f0e0ff', padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
  },
  tabActive: {
    flex: '0 0 auto', fontSize: 13, fontWeight: 700, color: '#fff',
    background: 'linear-gradient(135deg,#a855f7,#ec4899)', border: 'none', padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
  },
  empty: { minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#a78bfa', whiteSpace: 'pre-line', lineHeight: 1.7 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center', padding: '24px 0' },
  card: {
    textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
    background: '#fff', border: '1px solid #f3e8ff', borderRadius: 18, padding: 16,
    boxShadow: '0 6px 18px rgba(168,85,247,0.10)', cursor: 'pointer',
  },
  summary: { fontSize: 15, fontWeight: 700, color: '#3b0764', margin: 0, lineHeight: 1.5 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { fontSize: 12, color: '#9333ea', background: '#f5e8ff', padding: '3px 8px', borderRadius: 999 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  category: { fontSize: 11, color: '#fff', background: 'linear-gradient(135deg,#a855f7,#ec4899)', padding: '3px 9px', borderRadius: 999 },
  date: { fontSize: 12, color: '#a78bfa' },

  // 모달
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(59,7,100,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100,
  },
  modal: {
    width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto',
    background: '#fff', borderRadius: 22, padding: 20,
    display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: '0 20px 50px rgba(168,85,247,0.3)',
  },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalCategory: { fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#a855f7,#ec4899)', padding: '4px 12px', borderRadius: 999 },
  modalSummary: { fontSize: 17, fontWeight: 800, color: '#3b0764', margin: '4px 0 0' },
  modalRaw: { fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 },
  label: { fontSize: 12, fontWeight: 700, color: '#9333ea', marginTop: 6 },
  input: { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e9d5ff', borderRadius: 12, outline: 'none', color: '#3b0764', fontFamily: 'inherit', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: 10, marginTop: 10 },
  btnPrimary: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px', fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#a855f7,#ec4899)', border: 'none', borderRadius: 14, cursor: 'pointer' },
  btnGhost: { flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, color: '#7c3aed', background: '#fff', border: '1px solid #e9d5ff', borderRadius: 14, cursor: 'pointer' },
  btnDanger: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px', fontSize: 14, fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, cursor: 'pointer' },
}
