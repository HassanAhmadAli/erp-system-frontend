const ACCESS_TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refresh_token"
const AUTH_TOKEN_CHANGE_EVENT = "erp-auth-token-change"

function emitAuthTokenChange() {
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT))
}

export function subscribeAuthTokenChange(onChange: () => void) {
  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, onChange)
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (!accessToken?.trim() || !refreshToken?.trim()) {
    throw new Error("Invalid token response from server")
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  emitAuthTokenChange()
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  emitAuthTokenChange()
}
