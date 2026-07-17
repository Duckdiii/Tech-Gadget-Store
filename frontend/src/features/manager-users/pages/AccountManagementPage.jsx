import { useAccountManagement } from '../hooks/useAccountManagement'
import AccountDetailDrawer from '../components/AccountDetailDrawer'

const STATUS_CFG = {
  active:   { label:'Hoạt động',  bg:'bg-green-100',  text:'text-green-700',  dot:'bg-green-500'  },
  blocked:  { label:'Bị khoá',    bg:'bg-red-100',    text:'text-red-600',    dot:'bg-red-500'    },
  pending:  { label:'Chờ duyệt',  bg:'bg-amber-100',  text:'text-amber-700',  dot:'bg-amber-400'  },
}

const ROLE_CFG = {
  MANAGER:  { label:'Quản lý',    bg:'bg-orange-50',  text:'text-[#C4350A]' },
  STAFF:    { label:'Nhân viên',  bg:'bg-blue-50',    text:'text-blue-700'  },
  CUSTOMER: { label:'Khách hàng', bg:'bg-purple-50',  text:'text-purple-700' },
}



/* ══════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════ */
export default function AccountManagementPage() {
  const {
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
  } = useAccountManagement()
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
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Tổng tài khoản',  value:total,   color:'blue',   icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
            { label:'Đang hoạt động', value:active,  color:'green',  icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label:'Bị khoá',         value:blocked, color:'red',    icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg> },
          ].map((c,i) => {
            const clr = { blue:['bg-[#E8420A]','text-[#E8420A]'], green:['bg-green-500','text-green-600'], red:['bg-red-500','text-red-600'] }[c.color]
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm theo email..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị khoá</option>
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
            <option value="">Tất cả vai trò</option>
            <option value="MANAGER">Quản lý</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} / {total} tài khoản</span>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tài khoản','Vai trò','Ngày tạo','Số lần đăng nhập','Trạng thái',''].map((h,i) => (
                    <th key={i} className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0
                  ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy tài khoản nào</td></tr>
                  : filtered.map(acc => {
                    const st = STATUS_CFG[acc.status] || STATUS_CFG.active
                    const rl = ROLE_CFG[acc.role] || ROLE_CFG.STAFF
                    return (
                      <tr key={acc.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${acc.bg} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{acc.initials}</div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">{acc.email}</p>
                              <p className="text-[11px] text-gray-400">@{acc.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${rl.bg} ${rl.text}`}>
                            {rl.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">{acc.createdAt}</td>
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
        )}
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
