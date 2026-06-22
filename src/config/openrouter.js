// OpenRouter 모델 구성 — 단일 진실 공급원(single source of truth)
// 모든 AI 호출(STT, 요약/태그/카테고리)은 이 설정을 import 해서 사용합니다.
// 값은 .env 에서 주입됩니다. (PRD 7장 "AI 모델 구성" 참고)

export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

// 기본 모델 → 폴백1 → 폴백2 순서로 자동 재시도
export const OPENROUTER_MODELS = {
  default: import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  fallbacks: [
    import.meta.env.VITE_OPENROUTER_FALLBACK_1 || 'google/gemini-2.5-pro',
    import.meta.env.VITE_OPENROUTER_FALLBACK_2 || 'openai/gpt-audio',
  ],
}

// 폴백 순서를 하나의 배열로: [기본, 폴백1, 폴백2]
export const MODEL_CHAIN = [OPENROUTER_MODELS.default, ...OPENROUTER_MODELS.fallbacks]

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// OpenRouter 권장 헤더 (요청 출처 표기용)
export const OPENROUTER_HEADERS = {
  'HTTP-Referer': import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  'X-Title': import.meta.env.VITE_APP_NAME || '말메 AI',
}
