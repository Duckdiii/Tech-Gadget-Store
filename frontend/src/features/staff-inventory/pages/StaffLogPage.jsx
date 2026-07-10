import { useAuth } from '../../../context/AuthContext'
import { useStaffLogs } from '../hooks/useStaffLogs'
import ViewImportModal from '../components/ViewImportModal'
import ViewExportModal from '../components/ViewExportModal'
import { fmt, resolveExportType } from '../utils/inventoryHelpers'

const EXPORT_TYPE_CFG = {
  sale:     { label: 'Xuất bán',        bg: 'bg-orange-50',   text: 'text-[#E8420A]'   },
  transfer: { label: 'Chuyển kho',      bg: 'bg-purple-100', text: 'text-purple-600' },
  damage:   { label: 'Hỏng / Thanh lý', bg: 'bg-red-100',    text: 'text-red-600'    },
  return:   { label: 'Trả NCC',         bg: 'bg-amber-100',  text: 'text-amber-700'  },
}

export default function StaffLogPage() {
  const { user } = useAuth()
  const {
    activeTab, setActiveTab,
    search, setSearch,
    viewLog, setViewLog,
    loading,
    importFiltered,
    exportFiltered,
  } = useStaffLogs()

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Lịch sử phiếu</h1>
          <p className="text-xs text-gray-400 mt-0.5">Xem lại các phiếu nhập / xuất đã tạo</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'NV'}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-8 flex items-center gap-1">
        {[
          { id: 'import', label: 'Phiếu nhập', badge: importFiltered.length, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
          { id: 'export', label: 'Phiếu xuất', badge: exportFiltered.length, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab===tab.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {tab.icon}{tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab===tab.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{tab.badge}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex-1 px-8 py-6 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số phiếu, nhà cung cấp, đối tượng..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
          </div>

          {/* Import Log Table */}
          {activeTab === 'import' && (
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Số phiếu','Ngày / Giờ','Nhà cung cấp','Thủ kho thực hiện','Số SP','Giá trị',''].map((h,i) => (
                      <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {importFiltered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Không có phiếu nhập nào</td></tr>
                  ) : importFiltered.map(log => {
                    const sub = log.items.reduce((s,r) => s + r.qty*r.unitPrice, 0)
                    const total = sub + Math.round(sub*0.1)
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-teal-700">{log.id}</td>
                        <td className="px-4 py-3.5"><p className="text-xs font-medium text-gray-800">{log.date}</p><p className="text-[11px] text-gray-400">{log.time}</p></td>
                        <td className="px-4 py-3.5 text-xs font-medium text-gray-700">{log.supplier}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{log.staff}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-700">{log.items.length}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-800">{fmt(total)}đ</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setViewLog({ type:'import', log })} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-teal-50">
                            Xem phiếu →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Export Log Table */}
          {activeTab === 'export' && (
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Số phiếu','Ngày / Giờ','Loại xuất','Người nhận / Lý do','Số SP','Giá trị',''].map((h,i) => (
                      <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exportFiltered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Không có phiếu xuất nào</td></tr>
                  ) : exportFiltered.map(log => {
                    const typeKey = resolveExportType(log.note)
                    const tc = EXPORT_TYPE_CFG[typeKey]
                    const val = log.items.reduce((s,r) => s + r.qty*r.unitPrice, 0)
                    const total = typeKey === 'sale' ? val + Math.round(val*0.1) : val
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-600">{log.id}</td>
                        <td className="px-4 py-3.5"><p className="text-xs font-medium text-gray-800">{log.date}</p><p className="text-[11px] text-gray-400">{log.time}</p></td>
                        <td className="px-4 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc?.bg || 'bg-gray-100'} ${tc?.text || 'text-gray-700'}`}>{tc?.label || 'Mặc định'}</span></td>
                        <td className="px-4 py-3.5 text-xs font-medium text-gray-700">{log.recipient}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-700">{log.items.length}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-800">{fmt(total)}đ</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setViewLog({ type:'export', log })} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-600 hover:text-slate-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-slate-50">
                            Xem phiếu →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewLog?.type === 'import' && <ViewImportModal log={viewLog.log} onClose={() => setViewLog(null)} />}
      {viewLog?.type === 'export' && <ViewExportModal log={viewLog.log} onClose={() => setViewLog(null)} />}
    </div>
  )
}
