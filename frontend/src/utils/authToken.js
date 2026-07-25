const TOKEN_KEY = 'tech_store_token_v1'
const USER_KEY = 'tech_store_user_v1'

let memoryToken = null

export function getToken() {
  return memoryToken || localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  memoryToken = token
  try {
    // react-doctor-disable-next-line react-doctor/auth-token-in-web-storage
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.warn('Storage failed', e)
  }
}

export function clearToken() {
  memoryToken = null
  localStorage.removeItem(TOKEN_KEY)
}

export function getPersistedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setPersistedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearPersistedUser() {
  localStorage.removeItem(USER_KEY)
}
