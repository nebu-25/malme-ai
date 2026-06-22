# 말메 AI

> 말로 메모하면 AI가 알아서 정리해주는 음성 메모 PWA

말메 AI는 마이크에 말을 하면 텍스트로 변환하고, AI가 **한 줄 요약 + 태그 3개 + 카테고리 1개**까지 자동으로 붙여서 저장해주는 음성 메모 앱입니다.

기존 음성 메모 앱들은 "녹음 → 텍스트 변환"까지만 도와줄 뿐, 그 이후 정리(요약, 분류, 검색)는 사용자가 직접 해야 했습니다. 그 결과 메모가 쌓이기만 하고 다시 찾아보지 않는 "메모 무덤"이 되곤 합니다.

말메 AI의 핵심 가치는 **"녹음 그 이후"**입니다. 말하기만 하면 텍스트 변환, 요약, 분류, 검색까지 AI가 알아서 처리합니다. 즉 단순 메모장이 아니라 **한국어 특화 "제2의 뇌(Second Brain)"**를 지향합니다.

자세한 기획 배경은 [`docs/prd.md`](docs/prd.md)를 참고하세요.

---

## 주요 기능

1. **음성 녹음** — 브라우저의 `MediaRecorder` API로 마이크 음성을 녹음
2. **STT (Speech-to-Text)** — 녹음 파일을 AI 모델에게 보내 텍스트로 변환
3. **AI 자동 정리** — 변환된 텍스트를 다시 AI에게 보내 한 줄 요약 + 태그 3개 + 카테고리 1개 생성
4. **메모 저장** — 원문 + 요약 + 태그 + 카테고리 + 작성일시를 Firestore에 저장
5. **메모 목록 / 검색 / 카테고리 필터** — 저장된 메모를 최신순 카드로 보고, 검색어와 카테고리로 필터링
6. **상세 보기 · 편집 · 삭제** — 모달을 통해 메모 내용 확인, 수정, 삭제
7. **Google 로그인** — Firebase Auth로 구글 계정 로그인, 본인 메모만 조회 가능
8. **PWA 설치** — 홈 화면에 추가해서 네이티브 앱처럼 사용 가능

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | React 18 + Vite |
| 라우팅 | react-router-dom |
| 인증 / DB / 호스팅 | Firebase (Auth, Firestore, Hosting) |
| AI 처리 | OpenRouter API (여러 AI 모델을 한 곳에서 호출하는 중개 서비스) |
| PWA | vite-plugin-pwa |
| 아이콘 | lucide-react |

---

## 화면 / 라우트 구조

기획 초안(PRD)의 7개 화면을 실제 구현에서는 **4개 라우트**로 통합했습니다.

| 경로 | 컴포넌트 | 역할 |
|---|---|---|
| `/` | `Login` | Google 로그인 |
| `/home` | `VoiceRecorder` | 새 음성 메모 — 녹음 + 처리중 + 결과 미리보기 + 저장을 한 화면에서 처리 |
| `/memos` | `MemoList` | 메모 목록 — 검색 + 카테고리 필터 + 상세/편집/삭제(모달) |
| `/settings` | `SettingsPage` | 설정 — 계정 정보 확인 + 로그아웃 |

라우트 정의는 [`src/App.jsx`](src/App.jsx)에서 확인할 수 있습니다.

---

## AI 모델 구성 (OpenRouter 폴백 체인)

모든 AI 처리(STT, 요약/태그/카테고리 정리)는 OpenRouter API를 통해 처리합니다. 기본 모델이 실패하면 자동으로 다음 모델로 재시도합니다.

| 순서 | 모델 ID | 역할 |
|---|---|---|
| 기본 | `google/gemini-2.5-flash` | 빠르고 비용이 합리적인 1차 처리 모델 |
| 폴백 1 | `google/gemini-2.5-pro` | 기본 모델 실패 시 더 안정적인 상위 모델로 재시도 |
| 폴백 2 | `openai/gpt-audio` | 최종 안전망, 오디오 입력 직접 지원 |

> 모델 ID는 `.env`의 `VITE_OPENROUTER_MODEL`, `VITE_OPENROUTER_FALLBACK_1`, `VITE_OPENROUTER_FALLBACK_2`로 설정합니다.

---

## 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 환경 변수 설정 (.env.example을 복사 후 값 채우기)
cp .env.example .env
# VITE_OPENROUTER_API_KEY 등을 직접 발급받은 값으로 채워주세요.
# .env 파일은 절대 커밋하지 마세요.

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build

# 5. 빌드 결과 미리보기
npm run preview
```

---

## 환경 변수

`.env.example`을 참고해 `.env` 파일을 작성합니다.

| 변수명 | 의미 | 비밀 여부 |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API 키 (AI 모델 호출용) | 비밀 — 절대 커밋 금지 |
| `VITE_OPENROUTER_MODEL` | 기본 AI 모델 ID (`google/gemini-2.5-flash`) | 공개 가능 |
| `VITE_OPENROUTER_FALLBACK_1` | 1차 폴백 모델 ID (`google/gemini-2.5-pro`) | 공개 가능 |
| `VITE_OPENROUTER_FALLBACK_2` | 2차 폴백 모델 ID (`openai/gpt-audio`) | 공개 가능 |
| `VITE_APP_URL` | 앱 배포 URL (로컬은 `http://localhost:5173`) | 공개 가능 |
| `VITE_APP_NAME` | 앱 이름 (`말메 AI`) | 공개 가능 |

---

## 배포 / CI·CD

GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))가 `main` 브랜치에 push될 때마다 자동으로 빌드하고 Firebase Hosting에 배포합니다.

- **Firebase 프로젝트**: `malme-ai-hs`
- **배포 URL**: https://malme-ai-hs.web.app

### 필요한 GitHub Secrets

| Secret 이름 | 용도 |
|---|---|
| `FIREBASE_TOKEN` | Firebase CLI 배포 인증 토큰 |
| `VITE_OPENROUTER_API_KEY` | 빌드 시 주입되는 OpenRouter API 키 |

모델 ID, 앱 URL 등 비밀이 아닌 값들은 워크플로 파일 안에 직접 값으로 박혀 있으므로 별도 Secret 등록이 필요 없습니다.

### FIREBASE_TOKEN 발급 / 갱신 방법

```bash
firebase login:ci
```

위 명령으로 발급받은 토큰을 GitHub Secret으로 등록합니다.

```bash
gh secret set FIREBASE_TOKEN
```

> 토큰이 만료되면 배포 워크플로에서 `401` 인증 에러가 발생합니다. 이 경우 위 명령을 다시 실행해 토큰을 재발급하고 Secret을 갱신하세요.

---

## 데이터 구조 (Firestore `memos` 컬렉션)

| 필드 | 의미 | 예시 |
|---|---|---|
| `memoId` | 메모 고유 ID | `memo_8f3a2c` |
| `userId` | 작성자(로그인 계정) 고유 ID | `user_a1b2c3` |
| `rawText` | 음성을 텍스트로 변환한 원문 | "내일 오전 10시에 클라이언트랑 미팅" |
| `summary` | AI가 만든 한 줄 요약 | "내일 오전 10시 클라이언트 미팅" |
| `tags` | AI가 붙인 태그 3개 (배열) | `["미팅", "계약서", "내일일정"]` |
| `category` | AI가 분류한 카테고리 1개 | "업무" |
| `createdAt` | 메모 생성 일시 | `2026-06-22 14:32` |

Firestore 보안 규칙상 본인(`userId`)이 작성한 메모만 읽기/쓰기가 가능하며, 다른 사용자의 메모는 조회할 수 없습니다.

---

## 폴더 구조

```
malme-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml        # main 브랜치 push 시 Firebase Hosting 자동 배포
├── docs/
│   └── prd.md                 # 기능 정의서 (화면/기능/흐름/데이터 구조 상세)
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Google 로그인 화면 (/)
│   │   ├── VoiceRecorder.jsx    # 녹음+처리중+결과미리보기+저장 (/home)
│   │   └── MemoList.jsx         # 메모 목록+검색+필터+상세/편집/삭제 (/memos)
│   ├── pages/
│   │   └── SettingsPage.jsx     # 계정 정보+로그아웃 (/settings)
│   ├── utils/                   # STT/AI 정리 등 OpenRouter 연동 로직
│   ├── config/                  # Firebase 등 외부 서비스 초기화 설정
│   └── App.jsx                  # 라우트 정의
├── .env.example                # 환경 변수 템플릿
└── package.json
```

---

## 참고 문서

- 기능 정의서: [`docs/prd.md`](docs/prd.md)
