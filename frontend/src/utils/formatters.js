export function formatCurrency(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

export function avatarInitials(name) {
  return (name || '?').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase()
}

export function formatDate(val) {
  if (!val) return '—'
  if (Array.isArray(val)) {
    const [y, mo, d] = val
    return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`
  }
  const dt = new Date(val)
  if (isNaN(dt.getTime())) return val
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}
