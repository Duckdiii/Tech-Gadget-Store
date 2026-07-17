const TOKEN_KEY = 'tech_store_token'
const USER_KEY = 'tech_store_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
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
