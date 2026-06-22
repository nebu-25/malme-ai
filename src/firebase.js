// Firebase 초기화
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBznjMjvcuu2YPUunw18mDfwnC9hRk9yNI",
  authDomain: "malme-ai-hs.firebaseapp.com",
  projectId: "malme-ai-hs",
  storageBucket: "malme-ai-hs.firebasestorage.app",
  messagingSenderId: "357769384769",
  appId: "1:357769384769:web:6766fbe4ecddf8e0eb47c0",
  measurementId: "G-X4PG05SX67"
}

const app = initializeApp(firebaseConfig)

// 인증 (Google 로그인)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Firestore (메모 저장소) — 오프라인 IndexedDB 캐시 활성화
// 구식 enableIndexedDbPersistence 대신 최신 persistentLocalCache 사용.
// 여러 탭을 동시에 열어도 동작하도록 persistentMultipleTabManager 적용.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export default app
