import { useState } from 'react'

const ROLE_OPTIONS = ['manager', 'staff', 'customer']
const ROLE_LABEL   = { manager: 'Quản lý', staff: 'Nhân viên', customer: 'Khách hàng' }
const ROLE_BADGE   = {
  manager:  'bg-orange-50 text-[#C4350A]',
  staff:    'bg-teal-100 text-teal-700',
  customer: 'bg-purple-100 text-purple-700',
}
const STATUS_CFG = {
  active:   { label:'Hoạt động',  bg:'bg-green-100',  text:'text-green-700',  dot:'bg-green-500'  },
  blocked:  { label:'Bị khoá',    bg:'bg-red-100',    text:'text-red-600',    dot:'bg-red-500'    },
  pending:  { label:'Chờ duyệt',  bg:'bg-amber-100',  text:'text-amber-700',  dot:'bg-amber-400'  },
}
const BG_CYCLE = ['bg-[#E8420A]','bg-teal-500','bg-purple-500','bg-pink-500','bg-orange-500','bg-[#0D0F14]','bg-green-500','bg-red-400','bg-cyan-500','bg-yellow-500']

const INIT_ACCOUNTS = [
  { id:1,  username:'admin.tran',    email:'van.an@techstore.vn',      name:'Trần Văn An',     role:'manager',  status:'active',  createdAt:'12/01/2023', lastLogin:'2 giờ trước',     loginCount:284, initials:'TA', bg:'bg-[#E8420A]'   },
  { id:2,  username:'staff.nguyen',  email:'thi.bich@techstore.vn',    name:'Nguyễn Thị Bích', role:'staff',    status:'active',  createdAt:'05/03/2023', lastLogin:'Hôm qua',          loginCount:156, initials:'NB', bg:'bg-teal-500'   },
  { id:3,  username:'staff.le',      email:'hoang.dung@techstore.vn',  name:'Lê Hoàng Dũng',   role:'staff',    status:'active',  createdAt:'20/04/2023', lastLogin:'30 phút trước',    loginCount:211, initials:'LD', bg:'bg-purple-500' },
  { id:4,  username:'staff.pham',    email:'minh.chau@techstore.vn',   name:'Phạm Minh Châu',  role:'staff',    status:'blocked', createdAt:'15/06/2023', lastLogin:'3 ngày trước',     loginCount:87,  initials:'PC', bg:'bg-pink-500'   },
  { id:5,  username:'cust.nguyen1',  email:'nguyenvana@gmail.com',      name:'Nguyễn Văn A',    role:'customer', status:'active',  createdAt:'02/01/2024', lastLogin:'5 phút trước',     loginCount:32,  initials:'NA', bg:'bg-orange-500' },
  { id:6,  username:'cust.tran2',    email:'tranthib@gmail.com',        name:'Trần Thị B',      role:'customer', status:'active',  createdAt:'10/02/2024', lastLogin:'1 tuần trước',     loginCount:14,  initials:'TB', bg:'bg-[#0D0F14]' },
  { id:7,  username:'cust.le3',      email:'levanc@gmail.com',          name:'Lê Văn C',        role:'customer', status:'pending', createdAt:'01/06/2024', lastLogin:'Chưa đăng nhập',  loginCount:0,   initials:'LC', bg:'bg-green-500'  },
  { id:8,  username:'staff.vu',      email:'quoc.hung@techstore.vn',   name:'Vũ Quốc Hùng',    role:'staff',    status:'active',  createdAt:'22/09/2023', lastLogin:'Vừa xong',         loginCount:175, initials:'VH', bg:'bg-cyan-500'   },
  { id:9,  username:'cust.pham4',    email:'phamminhe@gmail.com',       name:'Phạm Minh E',     role:'customer', status:'blocked', createdAt:'15/03/2024', lastLogin:'1 tháng trước',    loginCount:7,   initials:'PE', bg:'bg-yellow-500' },
  { id:10, username:'staff.bui',     email:'thanh.phong@techstore.vn', name:'Bùi Thanh Phong',  role:'staff',    status:'active',  createdAt:'03/01/2024', lastLogin:'4 giờ trước',      loginCount:120, initials:'BP', bg:'bg-red-400'    },
]

function Avatar({ initials, bg, size='md' }) {
  const sz = size==='lg' ? 'w-14 h-14 text-lg' : size==='sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>
}
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="w-36 text-xs text-gray-400 font-medium shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700 font-medium break-all">{value || '—'}</span>
    </div>
  )
}

/* ══════════════════════════════════════
   ACCOUNT DETAIL DRAWER
══════════════════════════════════════ */
function AccountDetailDrawer({ account, onClose, onBlock, onUnblock, onDelete, onResetPwd }) {
  const [blockConfirm,  setBlockConfirm]  = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [resetConfirm,  setResetConfirm]  = useState(false)
  const [resetDone,     setResetDone]     = useState(false)
  const st = STATUS_CFG[account.status]

  function handleReset() {
    setResetConfirm(false)
    setResetDone(true)
    onResetPwd(account.id)
  }

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 pt-5 pb-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/10 cursor-pointer">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <Avatar initials={account.initials} bg={account.bg} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">{account.name}</h2>
              <p className="text-sm text-white/60 mt-0.5">@{account.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_BADGE[account.role]}`}>{ROLE_LABEL[account.role]}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>● {st.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <InfoRow label="Email"              value={account.email} />
          <InfoRow label="Tên tài khoản"      value={account.username} />
          <InfoRow label="Vai trò"             value={ROLE_LABEL[account.role]} />
          <InfoRow label="Trạng thái"          value={st.label} />
          <InfoRow label="Ngày tạo"            value={account.createdAt} />
          <InfoRow label="Đăng nhập gần đây"   value={account.lastLogin} />
          <InfoRow label="Tổng lần đăng nhập"  value={`${account.loginCount} lần`} />

          {resetDone && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded px-4 py-3">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-sm font-semibold text-green-700">Đã gửi email đặt lại mật khẩu</p>
                <p className="text-xs text-green-600 mt-0.5">{account.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <button onClick={() => setResetConfirm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Đặt lại mật khẩu
          </button>
          <div className="flex gap-2">
            {account.status === 'blocked'
              ? <button onClick={() => { onUnblock(account.id); onClose() }} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-green-200 rounded text-sm font-medium text-green-700 hover:bg-green-50 cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                  Mở khoá
                </button>
              : <button onClick={() => setBlockConfirm(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-orange-200 rounded text-sm font-medium text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg>
                  Khoá tài khoản
                </button>
            }
            <button onClick={() => setDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Xoá tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* Block confirm */}
      {blockConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Khoá tài khoản?</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Tài khoản <span className="font-semibold text-gray-800">@{account.username}</span> sẽ không thể đăng nhập.<br />Bạn có thể mở khoá sau.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setBlockConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
                <button onClick={() => { onBlock(account.id); setBlockConfirm(false); onClose() }} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-semibold cursor-pointer transition-colors">Khoá tài khoản</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Xoá tài khoản?</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Tài khoản <span className="font-semibold text-gray-800">@{account.username}</span> sẽ bị xoá vĩnh viễn.<br />Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ bỏ</button>
                <button onClick={() => { onDelete(account.id); setDeleteConfirm(false); onClose() }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors">Xác nhận xoá</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reset confirm */}
      {resetConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Đặt lại mật khẩu?</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Link đặt lại mật khẩu sẽ được gửi đến<br /><span className="font-semibold text-gray-800">{account.email}</span></p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setResetConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
                <button onClick={handleReset} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors">Gửi email</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* ══════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════ */
export default function AccountManagementPage() {
  const [accounts, setAccounts]       = useState(INIT_ACCOUNTS)
  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected]       = useState(null)
  const [toast, setToast]             = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const total   = accounts.length
  const active  = accounts.filter(a => a.status === 'active').length
  const blocked = accounts.filter(a => a.status === 'blocked').length
  const pending = accounts.filter(a => a.status === 'pending').length

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase()
    return (
      (!q || a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) &&
      (!roleFilter   || a.role   === roleFilter) &&
      (!statusFilter || a.status === statusFilter)
    )
  })

  function handleBlock(id) {
    const a = accounts.find(x => x.id === id)
    setAccounts(p => p.map(x => x.id === id ? { ...x, status: 'blocked' } : x))
    showToast(`Đã khoá tài khoản @${a?.username}`)
  }
  function handleUnblock(id) {
    const a = accounts.find(x => x.id === id)
    setAccounts(p => p.map(x => x.id === id ? { ...x, status: 'active' } : x))
    showToast(`Đã mở khoá tài khoản @${a?.username}`)
  }
  function handleDelete(id) {
    const a = accounts.find(x => x.id === id)
    setAccounts(p => p.filter(x => x.id !== id))
    showToast(`Đã xoá tài khoản @${a?.username}`)
  }
  function handleResetPwd(id) {
    const a = accounts.find(x => x.id === id)
    showToast(`Đã gửi email đặt lại mật khẩu đến ${a?.email}`)
  }

  const selectedAccount = selected !== null ? accounts.find(a => a.id === selected) : null

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
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

      <div className="flex-1 px-8 py-7 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem và quản lý toàn bộ tài khoản trong hệ thống</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Tổng tài khoản',  value:total,   color:'blue',   icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
            { label:'Đang hoạt động', value:active,  color:'green',  icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label:'Bị khoá',         value:blocked, color:'red',    icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg> },
            { label:'Chờ duyệt',       value:pending, color:'amber',  icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map((c,i) => {
            const clr = { blue:['bg-[#E8420A]','text-[#E8420A]'], green:['bg-green-500','text-green-600'], red:['bg-red-500','text-red-600'], amber:['bg-amber-400','text-amber-600'] }[c.color]
            return (
              <div key={i} className="bg-white rounded border border-gray-200 p-5 flex items-center gap-4">
                <span className={`w-12 h-12 ${clr[0]} rounded flex items-center justify-center text-white shrink-0`}>{c.icon}</span>
                <div><p className="text-xs text-gray-500 font-medium">{c.label}</p><p className={`text-3xl font-bold ${clr[1]}`}>{c.value}</p></div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên, username, email..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
            <option value="">Tất cả vai trò</option>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị khoá</option>
            <option value="pending">Chờ duyệt</option>
          </select>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {total} tài khoản</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Tài khoản','Username','Vai trò','Ngày tạo','Đăng nhập gần đây','Số lần đăng nhập','Trạng thái',''].map((h,i) => (
                  <th key={i} className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy tài khoản nào</td></tr>
                : filtered.map(acc => {
                  const st = STATUS_CFG[acc.status]
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={acc.initials} bg={acc.bg} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{acc.name}</p>
                            <p className="text-[11px] text-gray-400">{acc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-600">@{acc.username}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[acc.role]}`}>{ROLE_LABEL[acc.role]}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500">{acc.createdAt}</td>
                      <td className="px-4 py-4 text-xs text-gray-500">{acc.lastLogin}</td>
                      <td className="px-4 py-4 text-xs text-gray-600 font-medium">{acc.loginCount}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => setSelected(acc.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                          Chi tiết →
                        </button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer overlay */}
      {selectedAccount && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelected(null)} />}

      {/* Drawer */}
      {selectedAccount && (
        <AccountDetailDrawer
          account={selectedAccount}
          onClose={() => setSelected(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onDelete={handleDelete}
          onResetPwd={handleResetPwd}
        />
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}
