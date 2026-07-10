import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'

const LOG_STATUS = {
  success: { label:'Thành công', bg:'bg-green-100',  text:'text-green-700', dot:'bg-green-500' },
  failed:  { label:'Thất bại',   bg:'bg-red-100',    text:'text-red-600',   dot:'bg-red-500'   },
  blocked: { label:'Bị chặn',    bg:'bg-orange-100', text:'text-orange-700',dot:'bg-orange-500'},
}

export default function LoginLogTab() {
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')

  useEffect(() => {
    apiFetch('/api/manager/login-logs')
      .then(data => setLogs(data.map(log => ({
        id:        log.id,
        email:     log.email,
        roleName:  log.roleName || '—',
        status:    (log.loginStatus || '').toLowerCase(),
        loginTime: log.loginTime,
      }))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.email.toLowerCase().includes(q) || l.roleName.toLowerCase().includes(q)) &&
      (!statusFilter || l.status === statusFilter)
    )
  })

  const successCount = filtered.filter(l => l.status === 'success').length
  const failCount    = filtered.filter(l => l.status !== 'success').length

  function formatLoginTime(loginTime) {
    if (!loginTime) return '—'
    const d = new Date(loginTime)
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký đăng nhập</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} bản ghi · <span className="text-green-600 font-semibold">{successCount} thành công</span>
            {failCount > 0 && <> · <span className="text-red-500 font-semibold">{failCount} thất bại/chặn</span></>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs text-left">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Email, vai trò..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
          <option value="blocked">Bị chặn</option>
        </select>
      </div>

      {/* Loading / Error */}
      {loading && <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>}
      {error && !loading && <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Tài khoản','Vai trò','Thời gian đăng nhập','Trạng thái'].map((h,i) => (
                  <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {filtered.length === 0
                ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không có bản ghi nào</td></tr>
                : filtered.map(log => {
                  const ls = LOG_STATUS[log.status] || LOG_STATUS.failed
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-800 text-xs">{log.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{log.roleName}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 font-mono">{formatLoginTime(log.loginTime)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${ls.bg} ${ls.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ls.dot}`} />
                          {ls.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
