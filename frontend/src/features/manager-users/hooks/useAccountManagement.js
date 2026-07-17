import { useState, useEffect } from 'react'
import { managerUsersService } from '../services/managerUsersService'

const BG_CYCLE = ['bg-[#E8420A]','bg-teal-500','bg-purple-500','bg-pink-500','bg-orange-500','bg-[#0D0F14]','bg-green-500','bg-red-400','bg-cyan-500','bg-yellow-500']

function normalizeAccount(dto, index) {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.email,
    username: dto.email.split('@')[0],
    status: (dto.status || '').toLowerCase(),
    role: dto.role || 'STAFF',
    createdAt: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString('vi-VN') : '—',
    lastLogin: '—',
    loginCount: dto.loginLogsIds?.length ?? 0,
    initials: dto.email[0].toUpperCase(),
    bg: BG_CYCLE[index % BG_CYCLE.length],
  }
}

export function useAccountManagement() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchAccounts = () => {
    setLoading(true)
    managerUsersService.getAccounts()
      .then(data => setAccounts(data.map((d, i) => normalizeAccount(d, i))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const total = accounts.length
  const active = accounts.filter(a => a.status === 'active').length
  const blocked = accounts.filter(a => a.status === 'blocked').length

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase()
    return (
      (!q || a.email.toLowerCase().includes(q)) &&
      (!statusFilter || a.status === statusFilter) &&
      (!roleFilter || a.role === roleFilter)
    )
  })

  async function handleBlock(id) {
    try {
      const data = await managerUsersService.blockAccount(id)
      setAccounts(p => p.map(x => x.id === id ? { ...x, status: (data.status || '').toLowerCase() } : x))
      showToast('Đã khoá tài khoản')
    } catch (e) {
      showToast(`Lỗi: ${e.message}`)
    }
  }

  async function handleUnblock(id) {
    try {
      const data = await managerUsersService.unblockAccount(id)
      setAccounts(p => p.map(x => x.id === id ? { ...x, status: (data.status || '').toLowerCase() } : x))
      showToast('Đã mở khoá tài khoản')
    } catch (e) {
      showToast(`Lỗi: ${e.message}`)
    }
  }

  async function handleDelete(id) {
    try {
      await managerUsersService.deleteAccount(id)
      setAccounts(p => p.filter(x => x.id !== id))
      showToast('Đã xoá tài khoản')
    } catch (e) {
      showToast(`Lỗi: ${e.message}`)
    }
  }

  return {
    accounts,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    selected,
    setSelected,
    toast,
    total,
    active,
    blocked,
    filtered,
    handleBlock,
    handleUnblock,
    handleDelete,
    showToast,
  }
}
