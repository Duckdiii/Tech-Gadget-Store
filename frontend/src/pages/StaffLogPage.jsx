import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

const fmt = n => n.toLocaleString('vi-VN')

const EXPORT_TYPE_CFG = {
  sale:     { label: 'Xuất bán',        bg: 'bg-orange-50',   text: 'text-[#E8420A]'   },
  transfer: { label: 'Chuyển kho',      bg: 'bg-purple-100', text: 'text-purple-600' },
  damage:   { label: 'Hỏng / Thanh lý', bg: 'bg-red-100',    text: 'text-red-600'    },
  return:   { label: 'Trả NCC',         bg: 'bg-amber-100',  text: 'text-amber-700'  },
}

function parseDetails(detailsStr) {
  if (!detailsStr) return { ram: '', storage: '', color: '' }
  const parts = detailsStr.split('/').map(s => s.trim())
  let ram = ''
  let storage = ''
  let color = ''
  parts.forEach(p => {
    if (p.toLowerCase().includes('ram')) {
      ram = p.replace(/gb\s*ram/i, '').trim()
    } else if (p.toLowerCase().includes('storage')) {
      storage = p.replace(/gb\s*storage/i, '').trim()
    } else {
      color = p
    }
  })
  return { ram, storage, color }
}

function groupLogs(logs, typeFilter) {
  const filtered = logs.filter(l => l.type === typeFilter)
  const groups = {}
  filtered.forEach(item => {
    if (!groups[item.logId]) {
      const dt = new Date(item.createdTime)
      const dateStr = dt.toLocaleDateString('vi-VN')
      const timeStr = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      groups[item.logId] = {
        id: item.logId,
        date: dateStr,
        time: timeStr,
        supplier: typeFilter === 'IMPORT' ? (item.noteOrReason?.split(';')[0] || 'Nhà cung cấp') : undefined,
        recipient: typeFilter === 'EXPORT' ? (item.noteOrReason?.split(';')[0] || 'Người nhận') : undefined,
        staff: item.performedBy === 'user-stf-01' ? 'Trần Thị Bích' : item.performedBy === 'user-stf-02' ? 'Lê Hoàng Cường' : item.performedBy === 'user-mgr-01' ? 'Nguyễn Văn An' : item.performedBy,
        status: item.status.toLowerCase(),
        note: item.noteOrReason || '',
        items: [],
        total: 0,
      }
    }
    groups[item.logId].items.push({
      name: item.productName,
      sku: item.productDetails || 'N/A',
      qty: item.quantity,
      unitPrice: item.price,
    })
    groups[item.logId].total += item.quantity * item.price
  })
  return Object.values(groups)
}

/* ── Import Receipt View Modal ── */
function ViewImportModal({ log, onClose }) {
  const sub   = log.items.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const vat   = Math.round(sub * 0.1)
  const total = sub + vat
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-teal-700  px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU NHẬP KHO</h2>
            <div className="flex justify-between mt-2 text-sm opacity-90">
              <span>Số phiếu: <strong>{log.id}</strong></span>
              <span>{log.date} · {log.time}</span>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Nhà cung cấp</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.supplier}</p></div>
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Thủ kho thực hiện</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.staff}</p></div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-400">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-400">SL</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Đơn giá</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {log.items.map((r,i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5"><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[11px] text-gray-400">{r.sku}</p></td>
                      <td className="px-3 py-2.5 text-center font-bold text-teal-700">{r.qty}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-800 text-xs">{fmt(r.qty*r.unitPrice)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-teal-50 rounded p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Cộng tiền hàng</span><span>{fmt(sub)}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>VAT (10%)</span><span>{fmt(vat)}đ</span></div>
              <div className="flex justify-between border-t border-teal-200 pt-2 font-bold text-teal-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
            </div>
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Export Receipt View Modal ── */
function ViewExportModal({ log, onClose }) {
  const typeKey = log.note.includes('transfer') ? 'transfer' : log.note.includes('damage') ? 'damage' : log.note.includes('return') ? 'return' : 'sale'
  const tc = EXPORT_TYPE_CFG[typeKey]
  const sub = log.items.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const isSale = typeKey === 'sale'
  const vat = isSale ? Math.round(sub * 0.1) : 0
  const total = sub + vat

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gray-900  px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-90">Số phiếu: <strong>{log.id}</strong></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc?.bg || 'bg-gray-100'} ${tc?.text || 'text-gray-700'}`}>{tc?.label || 'Xuất kho'}</span>
            </div>
            <p className="text-sm opacity-80 mt-1">{log.date} · {log.time}</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Loại xuất</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{tc?.label || 'Mặc định'}</p></div>
              <div className="bg-gray-50 rounded p-3"><p className="text-xs text-gray-400">Người nhận / Lý do</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.recipient}</p></div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-400">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-400">SL xuất</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-400">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {log.items.map((r,i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5"><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[11px] text-gray-400">{r.sku}</p></td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600">{r.qty}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-gray-600">{fmt(r.unitPrice)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(isSale || typeKey === 'return') && (
              <div className="bg-slate-50 rounded p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500"><span>Tổng giá trị xuất</span><span className="font-semibold">{fmt(sub)}đ</span></div>
                {isSale && <div className="flex justify-between text-gray-500"><span>VAT (10%)</span><span className="font-semibold">{fmt(vat)}đ</span></div>}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
              </div>
            )}
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Root Page ── */
export default function StaffLogPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('import')
  const [search, setSearch]       = useState('')
  const [viewLog, setViewLog]     = useState(null)
  const [importLogs, setImportLogs] = useState([])
  const [exportLogs, setExportLogs] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        const logs = await apiFetch('/api/manager/warehouse-logs')
        const imports = groupLogs(logs, 'IMPORT')
        const exports = groupLogs(logs, 'EXPORT')
        setImportLogs(imports)
        setExportLogs(exports)
      } catch (err) {
        console.error("Failed to load logs history", err)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  const importFiltered = importLogs.filter(l => {
    const q = search.toLowerCase()
    return !q || l.id.toLowerCase().includes(q) || l.supplier?.toLowerCase().includes(q)
  })

  const exportFiltered = exportLogs.filter(l => {
    const q = search.toLowerCase()
    return !q || l.id.toLowerCase().includes(q) || l.recipient?.toLowerCase().includes(q)
  })

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
                    const typeKey = log.note.includes('transfer') ? 'transfer' : log.note.includes('damage') ? 'damage' : log.note.includes('return') ? 'return' : 'sale'
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
