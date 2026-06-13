import { useState } from 'react'

const fmt = n => n.toLocaleString('vi-VN')

const IMPORT_LOGS = [
  { id:'PN-240613-004', date:'13/06/2024', time:'14:22', supplier:'Apple VN',            warehouse:'Kho trung tâm', items:[{name:'iPhone 15 Pro Max 256GB',sku:'APL-IP15PM',qty:5,unitPrice:29990000},{name:'AirPods Pro 2nd Gen',sku:'APL-APP2',qty:10,unitPrice:5990000},{name:'Apple Watch Series 9',sku:'APL-AW9',qty:8,unitPrice:10990000}], total:298890000, note:'Hàng tháng 6' },
  { id:'PN-240613-003', date:'13/06/2024', time:'11:10', supplier:'Samsung VN',           warehouse:'Kho trung tâm', items:[{name:'Samsung Galaxy S24 Ultra',sku:'SAM-S24U',qty:5,unitPrice:27990000},{name:'Samsung 65" QLED TV',sku:'SAM-TV65',qty:2,unitPrice:22990000}], total:185930000, note:'' },
  { id:'PN-240612-002', date:'12/06/2024', time:'09:30', supplier:'Sony VN',              warehouse:'Kho chi nhánh Q1', items:[{name:'Sony WH-1000XM5',sku:'SON-WH5',qty:15,unitPrice:7990000}], total:131835000, note:'Nhập bổ sung' },
  { id:'PN-240611-001', date:'11/06/2024', time:'15:00', supplier:'Dell Technologies VN', warehouse:'Kho trung tâm', items:[{name:'MacBook Air M3 13"',sku:'APL-MBA',qty:3,unitPrice:29990000}], total:98967000, note:'' },
  { id:'PN-240610-003', date:'10/06/2024', time:'10:45', supplier:'Apple VN',             warehouse:'Kho chi nhánh Q7', items:[{name:'iPad Pro 11" M4',sku:'APL-IPD',qty:4,unitPrice:23990000}], total:105556000, note:'Đơn khẩn' },
]

const EXPORT_LOGS = [
  { id:'PX-240613-007', date:'13/06/2024', time:'12:45', type:'sale',     recipient:'KH Nguyễn Văn A',   items:[{name:'iPhone 15 Pro Max 256GB',sku:'APL-IP15PM',qty:1},{name:'AirPods Pro 2nd Gen',sku:'APL-APP2',qty:1}], total:35980000,  note:'' },
  { id:'PX-240613-006', date:'13/06/2024', time:'09:55', type:'sale',     recipient:'KH Trần Thị B',     items:[{name:'Apple Watch Series 9',sku:'APL-AW9',qty:1},{name:'AirPods Pro 2nd Gen',sku:'APL-APP2',qty:1}], total:16980000,  note:'' },
  { id:'PX-240612-005', date:'12/06/2024', time:'16:20', type:'transfer', recipient:'Kho chi nhánh Q7',  items:[{name:'Samsung Galaxy S24 Ultra',sku:'SAM-S24U',qty:2}], total:0,         note:'Chuyển kho phân phối' },
  { id:'PX-240612-004', date:'12/06/2024', time:'11:00', type:'damage',   recipient:'Thanh lý hàng lỗi', items:[{name:'MacBook Air M3 13"',sku:'APL-MBA',qty:1}], total:0,         note:'Màn hình bị trầy' },
  { id:'PX-240611-003', date:'11/06/2024', time:'14:30', type:'sale',     recipient:'KH Lê Văn C',       items:[{name:'Samsung 65" QLED TV',sku:'SAM-TV65',qty:1}], total:25289000,  note:'' },
  { id:'PX-240610-002', date:'10/06/2024', time:'08:45', type:'return',   recipient:'Samsung VN',        items:[{name:'Samsung Galaxy S24 Ultra',sku:'SAM-S24U',qty:1}], total:0,         note:'Lỗi camera' },
]

const EXPORT_TYPE_CFG = {
  sale:     { label:'Xuất bán',        bg:'bg-blue-100',   text:'text-blue-600'   },
  transfer: { label:'Chuyển kho',      bg:'bg-purple-100', text:'text-purple-600' },
  damage:   { label:'Hỏng / Thanh lý', bg:'bg-red-100',    text:'text-red-600'    },
  return:   { label:'Trả NCC',         bg:'bg-amber-100',  text:'text-amber-700'  },
}

const TABS = [
  { id:'import', label:'Phiếu nhập', badge: IMPORT_LOGS.length,
    icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { id:'export', label:'Phiếu xuất', badge: EXPORT_LOGS.length,
    icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
]

/* ── Import Receipt View Modal ── */
function ViewImportModal({ log, onClose }) {
  const sub   = log.items.reduce((s, r) => s + r.qty * r.unitPrice, 0)
  const vat   = Math.round(sub * 0.1)
  const total = sub + vat
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-t-2xl px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU NHẬP KHO</h2>
            <div className="flex justify-between mt-2 text-sm opacity-90">
              <span>Số phiếu: <strong>{log.id}</strong></span>
              <span>{log.date} · {log.time}</span>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">Nhà cung cấp</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.supplier}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">Kho nhận</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.warehouse}</p></div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
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
            <div className="bg-teal-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Cộng tiền hàng</span><span>{fmt(sub)}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>VAT (10%)</span><span>{fmt(vat)}đ</span></div>
              <div className="flex justify-between border-t border-teal-200 pt-2 font-bold text-teal-700 text-base"><span>TỔNG CỘNG</span><span>{fmt(total)}đ</span></div>
            </div>
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Export Receipt View Modal ── */
function ViewExportModal({ log, onClose }) {
  const tc = EXPORT_TYPE_CFG[log.type]
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-2xl px-6 py-5 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">TechStore · Kho vận</p>
            <h2 className="text-2xl font-black mt-1">PHIẾU XUẤT KHO</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm opacity-90">Số phiếu: <strong>{log.id}</strong></span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>{tc.label}</span>
            </div>
            <p className="text-sm opacity-80 mt-1">{log.date} · {log.time}</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">Loại xuất</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{tc.label}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">Người nhận / Đích đến</p><p className="font-semibold text-sm text-gray-800 mt-0.5">{log.recipient}</p></div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-400">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-400">SL xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {log.items.map((r,i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5"><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[11px] text-gray-400">{r.sku}</p></td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600">{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {log.note && <p className="text-xs text-gray-400 italic">Ghi chú: {log.note}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Root Page ── */
export default function StaffLogPage() {
  const [activeTab, setActiveTab] = useState('import')
  const [search, setSearch]       = useState('')
  const [viewLog, setViewLog]     = useState(null)

  const importFiltered = IMPORT_LOGS.filter(l => {
    const q = search.toLowerCase()
    return !q || l.id.toLowerCase().includes(q) || l.supplier.toLowerCase().includes(q)
  })

  const exportFiltered = EXPORT_LOGS.filter(l => {
    const q = search.toLowerCase()
    return !q || l.id.toLowerCase().includes(q) || l.recipient.toLowerCase().includes(q)
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Lịch sử phiếu</h1>
          <p className="text-xs text-gray-400 mt-0.5">Xem lại các phiếu nhập / xuất đã tạo</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">LD</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-8 flex items-center gap-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab===tab.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {tab.icon}{tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab===tab.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{tab.badge}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 px-8 py-6 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số phiếu, nhà cung cấp, đối tượng..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-3 rounded-lg text-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Xuất Excel
          </button>
        </div>

        {/* Import Log Table */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Số phiếu','Ngày / Giờ','Nhà cung cấp','Kho nhận','Số SP','Giá trị',''].map((h,i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {importFiltered.map(log => {
                  const sub = log.items.reduce((s,r) => s + r.qty*r.unitPrice, 0)
                  const total = sub + Math.round(sub*0.1)
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-teal-700">{log.id}</td>
                      <td className="px-4 py-3.5"><p className="text-xs font-medium text-gray-800">{log.date}</p><p className="text-[11px] text-gray-400">{log.time}</p></td>
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-700">{log.supplier}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{log.warehouse}</td>
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Số phiếu','Ngày / Giờ','Loại xuất','Người nhận / Đích đến','Số SP',''].map((h,i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exportFiltered.map(log => {
                  const tc = EXPORT_TYPE_CFG[log.type]
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-600">{log.id}</td>
                      <td className="px-4 py-3.5"><p className="text-xs font-medium text-gray-800">{log.date}</p><p className="text-[11px] text-gray-400">{log.time}</p></td>
                      <td className="px-4 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>{tc.label}</span></td>
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-700">{log.recipient}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-gray-700">{log.items.length}</td>
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

      {viewLog?.type === 'import' && <ViewImportModal log={viewLog.log} onClose={() => setViewLog(null)} />}
      {viewLog?.type === 'export' && <ViewExportModal log={viewLog.log} onClose={() => setViewLog(null)} />}
    </div>
  )
}
