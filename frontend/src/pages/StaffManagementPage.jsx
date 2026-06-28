import { useState, useEffect } from 'react'
import { apiFetch } from '../services/api'

const BG_CYCLE = ['bg-[#E8420A]','bg-pink-500','bg-teal-500','bg-purple-500','bg-orange-500','bg-green-500','bg-red-400','bg-[#0D0F14]']

const LOG_STATUS = {
  success: { label:'Thành công', bg:'bg-green-100',  text:'text-green-700', dot:'bg-green-500' },
  failed:  { label:'Thất bại',   bg:'bg-red-100',    text:'text-red-600',   dot:'bg-red-500'   },
  blocked: { label:'Bị chặn',    bg:'bg-orange-100', text:'text-orange-700',dot:'bg-orange-500'},
}

function normalizeStaff(dto, index) {
  const words    = (dto.fullName || '').trim().split(/\s+/)
  const initials = words.slice(-2).map(w => w[0] || '').join('').toUpperCase() || '?'
  return {
    id:         dto.id,
    name:       dto.fullName || '—',
    email:      dto.email || '—',
    phone:      dto.phone || '—',
    staffCode:  dto.staffCode || '—',
    joinDate:   dto.hireDate ? new Date(dto.hireDate).toLocaleDateString('vi-VN') : '—',
    lastLogin:  '—',
    status:     'active',
    role:       'Nhân viên',
    department: '—',
    initials,
    bg: BG_CYCLE[index % BG_CYCLE.length],
  }
}

/* ── sub-components ── */
function Avatar({ initials, bg, size='md' }) {
  const sz = size==='lg' ? 'w-14 h-14 text-lg' : size==='sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>
}
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start py-3 border-b border-gray-50 last:border-0">
      <span className="w-32 text-xs text-gray-400 font-medium shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{value || '—'}</span>
    </div>
  )
}
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

/* ══════════════════════════════════════
   STAFF LIST TAB
══════════════════════════════════════ */
const EMPTY_FORM = { name:'', email:'', phone:'', staffCode:'', hireDate:'', password:'' }

function StaffListTab() {
  const [staff, setStaff]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [panel, setPanel]               = useState(null)
  const [deleteId, setDeleteId]         = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [toast, setToast]               = useState(null)

  useEffect(() => {
    apiFetch('/api/manager/staff')
      .then(data => setStaff(data.map((d, i) => normalizeStaff(d, i))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q) || s.staffCode.toLowerCase().includes(q)
  })
  const activeCount   = staff.filter(s => s.status === 'active').length
  const selectedStaff = panel !== null && panel !== 'add' ? staff.find(s => s.id === panel) : null

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2800) }
  function openAdd()      { setForm(EMPTY_FORM); setFormErrors({}); setPanel('add') }
  function openDetail(id) { setPanel(id) }
  function closePanel()   { setPanel(null) }

  async function handleAdd() {
    const e = {}
    if (!form.name.trim())       e.name      = 'Vui lòng nhập họ tên'
    if (!form.email.trim())      e.email     = 'Vui lòng nhập email'
    if (!form.phone.trim())      e.phone     = 'Vui lòng nhập số điện thoại'
    if (!form.staffCode.trim())  e.staffCode = 'Vui lòng nhập mã nhân viên'
    if (!form.hireDate)          e.hireDate  = 'Vui lòng chọn ngày vào làm'
    if (!form.password.trim())   e.password  = 'Vui lòng nhập mật khẩu'
    if (Object.keys(e).length) { setFormErrors(e); return }

    const payload = {
      fullName:  form.name.trim(),
      email:     form.email.trim(),
      phone:     form.phone.replace(/\s/g, ''),
      staffCode: form.staffCode.trim(),
      hireDate:  form.hireDate,
      password:  form.password,
    }

    try {
      const dto = await apiFetch('/api/manager/staff', { method: 'POST', body: JSON.stringify(payload) })
      const newEntry = normalizeStaff(dto, staff.length)
      setStaff(p => [newEntry, ...p])
      closePanel()
      showToast(`Đã thêm nhân viên ${form.name.trim()}`)
    } catch (err) {
      showToast(`Lỗi: ${err.message}`)
    }
  }

  async function handleDelete(id) {
    const t = staff.find(s => s.id === id)
    try {
      await apiFetch(`/api/manager/staff/${id}`, { method: 'DELETE' })
      setStaff(p => p.filter(s => s.id !== id))
      setDeleteId(null)
      closePanel()
      showToast(`Đã xoá nhân viên ${t?.name}`)
    } catch (err) {
      showToast(`Lỗi: ${err.message}`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách nhân viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thêm mới và quản lý thông tin nhân viên</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Thêm nhân viên
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Tổng nhân viên', value:staff.length,  color:'blue',   icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label:'Đang hoạt động', value:activeCount,   color:'green',  icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label:'Kết quả tìm',    value:filtered.length, color:'purple', icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
        ].map((c, i) => {
          const clr = { blue:['bg-[#E8420A]','text-[#E8420A]'], green:['bg-green-500','text-green-600'], purple:['bg-purple-500','text-purple-600'] }[c.color]
          return (
            <div key={i} className="bg-white rounded border border-gray-200 p-5 flex items-center gap-4">
              <span className={`w-12 h-12 rounded flex items-center justify-center text-white shrink-0 ${clr[0]}`}>{c.icon}</span>
              <div><p className="text-xs text-gray-500 font-medium">{c.label}</p><p className={`text-3xl font-bold ${clr[1]}`}>{c.value}</p></div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, email, SĐT, mã NV..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
        </div>
        <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {staff.length} nhân viên</span>
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
                {['Nhân viên','Mã NV','Số điện thoại','Ngày vào làm',''].map((h,i) => (
                  <th key={i} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không tìm thấy nhân viên nào</td></tr>
                : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.initials} bg={s.bg} size="sm" />
                        <div><p className="font-semibold text-gray-800">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-600">{s.staffCode}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm">{s.phone}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{s.joinDate}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => openDetail(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                        Chi tiết →
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer overlay */}
      {panel && <div className="fixed inset-0 bg-black/30 z-40" onClick={closePanel} />}

      {/* Add drawer */}
      {panel === 'add' && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div><h2 className="text-lg font-bold text-gray-900">Thêm nhân viên mới</h2><p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p></div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Họ và tên *" error={formErrors.name}><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Nguyễn Văn A" className={inp} /></Field>
            <Field label="Email *" error={formErrors.email}><input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@techstore.vn" type="email" className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Số điện thoại *" error={formErrors.phone}><input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="0912345678" className={inp} /></Field>
              <Field label="Mã nhân viên *" error={formErrors.staffCode}><input value={form.staffCode} onChange={e => setForm(f=>({...f,staffCode:e.target.value}))} placeholder="NV001" className={inp} /></Field>
            </div>
            <Field label="Ngày vào làm *" error={formErrors.hireDate}><input type="date" value={form.hireDate} onChange={e => setForm(f=>({...f,hireDate:e.target.value}))} className={inp} /></Field>
            <Field label="Mật khẩu *" error={formErrors.password}>
              <div className="flex gap-2">
                <input value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" type="text" className={inp} />
                <button onClick={() => setForm(f=>({...f,password:Math.random().toString(36).slice(2,10)}))} className="shrink-0 px-3 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap">Tự động</button>
              </div>
            </Field>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleAdd} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors">Thêm nhân viên</button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selectedStaff && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 pt-5 pb-6 relative">
            <button onClick={closePanel} className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/10 cursor-pointer"><svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-4">
              <Avatar initials={selectedStaff.initials} bg={selectedStaff.bg} size="lg" />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight">{selectedStaff.name}</h2>
                <p className="text-sm text-white/60 mt-0.5">{selectedStaff.email}</p>
                <span className="mt-2 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-400/20 text-green-300">● Hoạt động</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <InfoRow label="Số điện thoại"  value={selectedStaff.phone} />
            <InfoRow label="Mã nhân viên"    value={selectedStaff.staffCode} />
            <InfoRow label="Ngày vào làm"    value={selectedStaff.joinDate} />
            <InfoRow label="Đăng nhập gần đây" value={selectedStaff.lastLogin} />
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
            <button onClick={() => setDeleteId(selectedStaff.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Xoá nhân viên
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (() => {
        const t = staff.find(s => s.id === deleteId)
        return (
          <>
            <div className="fixed inset-0 bg-black/50 z-[60]" />
            <div className="fixed inset-0 flex items-center justify-center z-[60]">
              <div className="bg-white rounded shadow-2xl w-[380px] p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Xoá nhân viên?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">Bạn có chắc muốn xoá <span className="font-semibold text-gray-800">{t?.name}</span>?<br />Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ bỏ</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors">Xác nhận xoá</button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}

/* ══════════════════════════════════════
   LOGIN LOG TAB
══════════════════════════════════════ */
function LoginLogTab() {
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
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Email, vai trò..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
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
            <tbody className="divide-y divide-gray-50">
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

/* ══════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════ */
const TABS = [
  { id:'list',  label:'Danh sách nhân viên', icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { id:'logs',  label:'Nhật ký đăng nhập',  icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
]

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Tìm kiếm nhanh..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <img src="https://placehold.co/34x34/f9a8d4/9d174d?text=AD" alt="avatar" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab===tab.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-7">
        {activeTab === 'list' && <StaffListTab />}
        {activeTab === 'logs' && <LoginLogTab />}
      </div>
    </div>
  )
}
