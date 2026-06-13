import { useState } from 'react'

/* ── shared constants ── */
const ROLES       = ['Quản lý', 'Nhân viên bán hàng', 'Quản lý kho', 'Kế toán', 'Hỗ trợ khách hàng']
const DEPARTMENTS = ['Kinh doanh', 'Kho vận', 'Tài chính', 'Kỹ thuật', 'CSKH']

const ROLE_BADGE = {
  'Quản lý':               'bg-blue-100 text-blue-700',
  'Nhân viên bán hàng':    'bg-green-100 text-green-700',
  'Quản lý kho':           'bg-amber-100 text-amber-700',
  'Kế toán':               'bg-purple-100 text-purple-700',
  'Hỗ trợ khách hàng':    'bg-pink-100 text-pink-700',
}
const BG_CYCLE = ['bg-blue-500','bg-pink-500','bg-teal-500','bg-purple-500','bg-orange-500','bg-green-500','bg-red-400','bg-indigo-500']

const INIT_STAFF = [
  { id:1, name:'Trần Văn An',     email:'van.an@techstore.vn',      phone:'0901 234 567', role:'Quản lý',              department:'Kinh doanh', status:'active',   joinDate:'12/01/2023', lastLogin:'2 giờ trước',      initials:'TA', bg:'bg-blue-500'   },
  { id:2, name:'Nguyễn Thị Bích', email:'thi.bich@techstore.vn',    phone:'0912 345 678', role:'Nhân viên bán hàng',   department:'Kinh doanh', status:'active',   joinDate:'05/03/2023', lastLogin:'Hôm qua',           initials:'NB', bg:'bg-pink-500'   },
  { id:3, name:'Lê Hoàng Dũng',   email:'hoang.dung@techstore.vn',  phone:'0923 456 789', role:'Quản lý kho',          department:'Kho vận',    status:'active',   joinDate:'20/04/2023', lastLogin:'30 phút trước',     initials:'LD', bg:'bg-teal-500'   },
  { id:4, name:'Phạm Minh Châu',  email:'minh.chau@techstore.vn',   phone:'0934 567 890', role:'Kế toán',              department:'Tài chính',  status:'inactive', joinDate:'15/06/2023', lastLogin:'3 ngày trước',      initials:'PC', bg:'bg-purple-500' },
  { id:5, name:'Hoàng Thị Diệu',  email:'thi.dieu@techstore.vn',    phone:'0945 678 901', role:'Hỗ trợ khách hàng',  department:'CSKH',       status:'active',   joinDate:'01/08/2023', lastLogin:'1 giờ trước',       initials:'HD', bg:'bg-orange-500' },
  { id:6, name:'Vũ Quốc Hùng',    email:'quoc.hung@techstore.vn',   phone:'0956 789 012', role:'Nhân viên bán hàng',  department:'Kinh doanh', status:'active',   joinDate:'22/09/2023', lastLogin:'Vừa xong',          initials:'VH', bg:'bg-green-500'  },
  { id:7, name:'Đỗ Thị Lan',      email:'thi.lan@techstore.vn',     phone:'0967 890 123', role:'Quản lý kho',         department:'Kho vận',    status:'inactive', joinDate:'10/11/2023', lastLogin:'1 tuần trước',      initials:'ĐL', bg:'bg-red-400'    },
  { id:8, name:'Bùi Thanh Phong', email:'thanh.phong@techstore.vn', phone:'0978 901 234', role:'Kỹ thuật viên',       department:'Kỹ thuật',   status:'active',   joinDate:'03/01/2024', lastLogin:'4 giờ trước',       initials:'BP', bg:'bg-indigo-500' },
]

const EMPTY_FORM = { name:'', email:'', phone:'', role:'', department:'', password:'', status:'active' }

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
function StaffListTab() {
  const [staff, setStaff]               = useState(INIT_STAFF)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [panel, setPanel]               = useState(null)
  const [deleteId, setDeleteId]         = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [editMode, setEditMode]         = useState(false)
  const [editForm, setEditForm]         = useState({})
  const [toast, setToast]               = useState(null)

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    return (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)) &&
           (!roleFilter || s.role === roleFilter) &&
           (!statusFilter || s.status === statusFilter)
  })
  const activeCount   = staff.filter(s => s.status === 'active').length
  const inactiveCount = staff.filter(s => s.status === 'inactive').length
  const deptCount     = new Set(staff.map(s => s.department)).size
  const selectedStaff = typeof panel === 'number' ? staff.find(s => s.id === panel) : null

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2800) }
  function openAdd()   { setForm(EMPTY_FORM); setFormErrors({}); setPanel('add') }
  function openDetail(id) { setEditMode(false); setPanel(id) }
  function closePanel()   { setPanel(null); setEditMode(false) }

  function handleAdd() {
    const e = {}
    if (!form.name.trim())     e.name     = 'Vui lòng nhập họ tên'
    if (!form.email.trim())    e.email    = 'Vui lòng nhập email'
    if (!form.role)            e.role     = 'Vui lòng chọn chức vụ'
    if (!form.department)      e.department = 'Vui lòng chọn phòng ban'
    if (!form.password.trim()) e.password = 'Vui lòng nhập mật khẩu'
    if (Object.keys(e).length) { setFormErrors(e); return }
    const words    = form.name.trim().split(/\s+/)
    const initials = words.slice(-2).map(w => w[0]).join('').toUpperCase()
    const bg       = BG_CYCLE[staff.length % BG_CYCLE.length]
    const newS     = { id: Date.now(), name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, department: form.department, status: form.status, joinDate: new Date().toLocaleDateString('vi-VN'), lastLogin: 'Chưa đăng nhập', initials, bg }
    setStaff(p => [newS, ...p]); closePanel(); showToast(`Đã thêm nhân viên ${newS.name}`)
  }
  function handleSaveEdit() {
    setStaff(p => p.map(s => s.id === panel ? { ...s, ...editForm } : s))
    setEditMode(false); showToast('Đã cập nhật thông tin nhân viên')
  }
  function handleDelete(id) {
    const t = staff.find(s => s.id === id)
    setStaff(p => p.filter(s => s.id !== id)); setDeleteId(null); closePanel(); showToast(`Đã xoá nhân viên ${t?.name}`)
  }
  function handleToggleStatus(id) {
    setStaff(p => p.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách nhân viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thêm mới và quản lý thông tin nhân viên</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Thêm nhân viên
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Tổng nhân viên', value:staff.length,   color:'blue',   icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label:'Đang hoạt động', value:activeCount,   color:'green',  icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label:'Tạm ngưng',      value:inactiveCount, color:'red',    icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label:'Phòng ban',      value:deptCount,     color:'purple', icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
        ].map((c, i) => {
          const clr = { blue:['bg-blue-50','bg-blue-500','text-blue-600'], green:['bg-green-50','bg-green-500','text-green-600'], red:['bg-red-50','bg-red-500','text-red-600'], purple:['bg-purple-50','bg-purple-500','text-purple-600'] }[c.color]
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${clr[1]}`}>{c.icon}</span>
              <div><p className="text-xs text-gray-500 font-medium">{c.label}</p><p className={`text-3xl font-bold ${clr[2]}`}>{c.value}</p></div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, email, SĐT..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
          <option value="">Tất cả chức vụ</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm ngưng</option>
        </select>
        <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {staff.length} nhân viên</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nhân viên','Chức vụ','Phòng ban','Ngày vào','Đăng nhập gần đây','Trạng thái',''].map((h,i) => (
                <th key={i} className={`px-${i===0?6:4} py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide ${i===5?'text-center':'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không tìm thấy nhân viên nào</td></tr>
              : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.initials} bg={s.bg} size="sm" />
                      <div><p className="font-semibold text-gray-800">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[s.role] || 'bg-gray-100 text-gray-600'}`}>{s.role}</span></td>
                  <td className="px-4 py-4 text-gray-600">{s.department}</td>
                  <td className="px-4 py-4 text-gray-500">{s.joinDate}</td>
                  <td className="px-4 py-4 text-gray-500">{s.lastLogin}</td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => handleToggleStatus(s.id)} className="cursor-pointer">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.status==='active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status==='active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {s.status==='active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => openDetail(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-blue-50">
                      Chi tiết →
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Drawer overlay */}
      {panel && <div className="fixed inset-0 bg-black/30 z-40" onClick={closePanel} />}

      {/* Add drawer */}
      {panel === 'add' && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div><h2 className="text-lg font-bold text-gray-900">Thêm nhân viên mới</h2><p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p></div>
            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Họ và tên *" error={formErrors.name}><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Nguyễn Văn A" className={inp} /></Field>
            <Field label="Email *" error={formErrors.email}><input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@techstore.vn" type="email" className={inp} /></Field>
            <Field label="Số điện thoại"><input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="09xx xxx xxx" className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Chức vụ *" error={formErrors.role}><select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))} className={inp}><option value="">Chọn chức vụ</option>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></Field>
              <Field label="Phòng ban *" error={formErrors.department}><select value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} className={inp}><option value="">Chọn phòng ban</option>{DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select></Field>
            </div>
            <Field label="Mật khẩu *" error={formErrors.password}>
              <div className="flex gap-2">
                <input value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" type="text" className={inp} />
                <button onClick={() => setForm(f=>({...f,password:Math.random().toString(36).slice(2,10)}))} className="shrink-0 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap">Tự động</button>
              </div>
            </Field>
            <Field label="Trạng thái">
              <div className="flex gap-2 mt-0.5">
                {['active','inactive'].map(v=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,status:v}))} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${form.status===v ? v==='active' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                    {v==='active'?'Hoạt động':'Tạm ngưng'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={closePanel} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
            <button onClick={handleAdd} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors">Thêm nhân viên</button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selectedStaff && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 pt-5 pb-6 relative">
            <button onClick={closePanel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"><svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-4">
              <Avatar initials={selectedStaff.initials} bg={selectedStaff.bg} size="lg" />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight">{selectedStaff.name}</h2>
                <p className="text-sm text-white/60 mt-0.5">{selectedStaff.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_BADGE[selectedStaff.role] || 'bg-gray-100 text-gray-600'}`}>{selectedStaff.role}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${selectedStaff.status==='active' ? 'bg-green-400/20 text-green-300' : 'bg-gray-400/20 text-gray-300'}`}>
                    {selectedStaff.status==='active' ? '● Hoạt động' : '● Tạm ngưng'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {!editMode ? (
              <div>
                <InfoRow label="Số điện thoại"    value={selectedStaff.phone} />
                <InfoRow label="Phòng ban"         value={selectedStaff.department} />
                <InfoRow label="Ngày vào làm"      value={selectedStaff.joinDate} />
                <InfoRow label="Đăng nhập gần đây" value={selectedStaff.lastLogin} />
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Họ và tên"><input value={editForm.name||''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className={inp} /></Field>
                <Field label="Số điện thoại"><input value={editForm.phone||''} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} className={inp} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Chức vụ"><select value={editForm.role||''} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))} className={inp}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></Field>
                  <Field label="Phòng ban"><select value={editForm.department||''} onChange={e=>setEditForm(f=>({...f,department:e.target.value}))} className={inp}>{DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select></Field>
                </div>
                <Field label="Trạng thái">
                  <div className="flex gap-2">
                    {['active','inactive'].map(v=>(
                      <button key={v} onClick={()=>setEditForm(f=>({...f,status:v}))} className={`flex-1 py-2 rounded-lg text-sm font-medium border cursor-pointer ${(editForm.status||selectedStaff.status)===v ? v==='active' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                        {v==='active'?'Hoạt động':'Tạm ngưng'}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
            {!editMode ? (
              <>
                <button onClick={()=>{setEditMode(true);setEditForm({name:selectedStaff.name,phone:selectedStaff.phone,role:selectedStaff.role,department:selectedStaff.department,status:selectedStaff.status})}} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Chỉnh sửa
                </button>
                <button onClick={()=>setDeleteId(selectedStaff.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Xoá nhân viên
                </button>
              </>
            ) : (
              <>
                <button onClick={()=>setEditMode(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
                <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors">Lưu thay đổi</button>
              </>
            )}
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
              <div className="bg-white rounded-2xl shadow-2xl w-[380px] p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Xoá nhân viên?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">Bạn có chắc muốn xoá <span className="font-semibold text-gray-800">{t?.name}</span>?<br />Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ bỏ</button>
                  <button onClick={()=>handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">Xác nhận xoá</button>
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
const LOGIN_LOGS = [
  { id:'LL-001', staffName:'Trần Văn An',     email:'van.an@techstore.vn',      role:'Quản lý',              date:'13/06/2024', time:'08:12:30', ip:'192.168.1.105', device:'Chrome 125 · Windows 11',  location:'TP.HCM, Việt Nam', status:'success', initials:'TA', bg:'bg-blue-500'   },
  { id:'LL-002', staffName:'Vũ Quốc Hùng',    email:'quoc.hung@techstore.vn',   role:'Nhân viên bán hàng',  date:'13/06/2024', time:'08:25:14', ip:'192.168.1.112', device:'Firefox 127 · macOS 14',    location:'TP.HCM, Việt Nam', status:'success', initials:'VH', bg:'bg-green-500'  },
  { id:'LL-003', staffName:'Lê Hoàng Dũng',   email:'hoang.dung@techstore.vn',  role:'Quản lý kho',         date:'13/06/2024', time:'08:31:05', ip:'10.0.0.22',     device:'Chrome 125 · Windows 10',   location:'TP.HCM, Việt Nam', status:'success', initials:'LD', bg:'bg-teal-500'   },
  { id:'LL-004', staffName:'Nguyễn Thị Bích', email:'thi.bich@techstore.vn',    role:'Nhân viên bán hàng',  date:'13/06/2024', time:'09:00:22', ip:'192.168.1.108', device:'Safari 17 · iOS 17',         location:'TP.HCM, Việt Nam', status:'success', initials:'NB', bg:'bg-pink-500'   },
  { id:'LL-005', staffName:'Phạm Minh Châu',  email:'minh.chau@techstore.vn',   role:'Kế toán',             date:'12/06/2024', time:'22:15:30', ip:'203.113.44.92', device:'Chrome 124 · Windows 11',   location:'Hà Nội, Việt Nam', status:'failed',  failReason:'Sai mật khẩu (lần 3)',                     initials:'PC', bg:'bg-purple-500' },
  { id:'LL-006', staffName:'Phạm Minh Châu',  email:'minh.chau@techstore.vn',   role:'Kế toán',             date:'12/06/2024', time:'22:16:02', ip:'203.113.44.92', device:'Chrome 124 · Windows 11',   location:'Hà Nội, Việt Nam', status:'blocked', failReason:'Tài khoản bị khoá sau 3 lần sai mật khẩu', initials:'PC', bg:'bg-purple-500' },
  { id:'LL-007', staffName:'Bùi Thanh Phong', email:'thanh.phong@techstore.vn', role:'Kỹ thuật viên',       date:'12/06/2024', time:'14:22:10', ip:'192.168.1.120', device:'Chrome 125 · Ubuntu 22.04',  location:'TP.HCM, Việt Nam', status:'success', initials:'BP', bg:'bg-indigo-500' },
  { id:'LL-008', staffName:'Hoàng Thị Diệu',  email:'thi.dieu@techstore.vn',    role:'Hỗ trợ khách hàng', date:'11/06/2024', time:'09:45:00', ip:'192.168.1.115', device:'Edge 125 · Windows 11',      location:'TP.HCM, Việt Nam', status:'success', initials:'HD', bg:'bg-orange-500' },
  { id:'LL-009', staffName:'Trần Văn An',     email:'van.an@techstore.vn',      role:'Quản lý',             date:'11/06/2024', time:'08:05:44', ip:'192.168.1.105', device:'Chrome 125 · Windows 11',   location:'TP.HCM, Việt Nam', status:'success', initials:'TA', bg:'bg-blue-500'   },
  { id:'LL-010', staffName:'Lê Hoàng Dũng',   email:'hoang.dung@techstore.vn',  role:'Quản lý kho',         date:'10/06/2024', time:'07:58:30', ip:'10.0.0.22',     device:'Chrome 125 · Windows 10',   location:'TP.HCM, Việt Nam', status:'success', initials:'LD', bg:'bg-teal-500'   },
]

const LOG_STATUS = {
  success: { label:'Thành công', bg:'bg-green-100',  text:'text-green-700', dot:'bg-green-500' },
  failed:  { label:'Thất bại',   bg:'bg-red-100',    text:'text-red-600',   dot:'bg-red-500'   },
  blocked: { label:'Bị chặn',    bg:'bg-orange-100', text:'text-orange-700',dot:'bg-orange-500'},
}

function LoginLogTab() {
  const [search, setSearch]       = useState('')
  const [staffFilter, setStaff]   = useState('')
  const [statusFilter, setStatus] = useState('')

  const staffNames = [...new Set(LOGIN_LOGS.map(l => l.staffName))]

  const filtered = LOGIN_LOGS.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.staffName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.ip.includes(q) || l.device.toLowerCase().includes(q)) &&
      (!staffFilter || l.staffName === staffFilter) &&
      (!statusFilter || l.status === statusFilter)
    )
  })

  const successCount = filtered.filter(l => l.status === 'success').length
  const failCount    = filtered.filter(l => l.status !== 'success').length

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
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-sm cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Xuất log
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, email, IP, thiết bị..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <select value={staffFilter} onChange={e => setStaff(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
          <option value="">Tất cả nhân viên</option>
          {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
          <option value="blocked">Bị chặn</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nhân viên','Ngày / Giờ','Địa chỉ IP','Thiết bị / Trình duyệt','Vị trí','Trạng thái'].map((h,i) => (
                <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0
              ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có bản ghi nào</td></tr>
              : filtered.map(log => {
                const ls = LOG_STATUS[log.status]
                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 ${log.bg} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{log.initials}</div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{log.staffName}</p>
                          <p className="text-[11px] text-gray-400">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-800 font-medium text-xs">{log.date}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{log.time}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{log.ip}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-700">{log.device}</p>
                      {log.failReason && <p className="text-[11px] text-red-500 mt-0.5">{log.failReason}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{log.location}</td>
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
            <input type="text" placeholder="Tìm kiếm nhanh..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
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
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab===tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
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
