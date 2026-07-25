import { describe, it, expect, beforeEach, vi } from 'vitest'

// Module giữ `memoryToken` ở module scope, nên phải reset module + import động
// trong từng test để các test không rò rỉ state qua nhau.
async function loadAuthToken() {
  vi.resetModules() // reset module để tránh rò rỉ state qua các test
  return import('./authToken')
}

beforeEach(() => {
  localStorage.clear()
})

describe('token', () => { //nhóm các test liên quan đến token
  it('getToken trả về null khi chưa set gì', async () => { //test getToken trả về null khi chưa set gì
    const { getToken } = await loadAuthToken()
    expect(getToken()).toBeNull()
  })

  it('setToken lưu vào memory và localStorage', async () => {
    const { setToken, getToken } = await loadAuthToken()
    setToken('abc123')
    expect(getToken()).toBe('abc123')
    expect(localStorage.getItem('tech_store_token_v1')).toBe('abc123')
  })

  it('clearToken xoá cả memory và localStorage', async () => {
    const { setToken, clearToken, getToken } = await loadAuthToken()
    setToken('abc123')
    clearToken()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem('tech_store_token_v1')).toBeNull()
  })

  it('getToken đọc từ localStorage nếu memory rỗng (vd. sau khi reload trang)', async () => {
    localStorage.setItem('tech_store_token_v1', 'persisted-token')
    const { getToken } = await loadAuthToken()
    expect(getToken()).toBe('persisted-token')
  })
})
//persisted user là nhóm các test liên quan đến persisted user, tức là dữ liệu người dùng được lưu trữ trong localStorage để giữ trạng thái đăng nhập giữa các phiên làm việc.
describe('persisted user', () => { // nhóm các test liên quan đến persisted user  
  it('getPersistedUser trả về null khi chưa có gì', async () => {
    const { getPersistedUser } = await loadAuthToken()
    expect(getPersistedUser()).toBeNull()
  })

  it('setPersistedUser lưu và getPersistedUser đọc lại đúng object', async () => {
    const { setPersistedUser, getPersistedUser } = await loadAuthToken()
    const user = { id: 1, name: 'Duy' }
    setPersistedUser(user)
    expect(getPersistedUser()).toEqual(user)
  })

  it('clearPersistedUser xoá user đã lưu', async () => {
    const { setPersistedUser, clearPersistedUser, getPersistedUser } = await loadAuthToken()
    setPersistedUser({ id: 1, name: 'Duy' })
    clearPersistedUser()
    expect(getPersistedUser()).toBeNull()
  })

  it('getPersistedUser trả về null khi dữ liệu trong localStorage không phải JSON hợp lệ', async () => {
    localStorage.setItem('tech_store_user_v1', 'not-json')
    const { getPersistedUser } = await loadAuthToken()
    expect(getPersistedUser()).toBeNull()
  })
})
