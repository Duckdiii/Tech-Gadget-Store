import { useNav } from '../hooks/useNav'

const fmt = n => n.toLocaleString('vi-VN')

const LOW_STOCK = [
  { name:'MacBook Air M3 13"',  sku:'APL-MBA-M3-13',    stock:2, min:5, status:'critical' },
  { name:'AirPods Pro 2nd Gen', sku:'APL-APP2',          stock:3, min:5, status:'low'      },
  { name:'iPad Pro 11" M4',     sku:'APL-IPDPRO-M4-11', stock:4, min:5, status:'low'      },
]

const PENDING_ORDERS = [
  { id:'#ORD-240613-001', customer:'Nguyễn Văn A', items:2, total:35990000, status:'processing', since:'2 giờ trước'  },
  { id:'#ORD-240613-002', customer:'Trần Thị B',   items:1, total:29990000, status:'pending',    since:'3 giờ trước'  },
  { id:'#ORD-240612-008', customer:'Lê Văn C',     items:3, total:12990000, status:'overdue',    since:'1 ngày trước' },
  { id:'#ORD-240612-005', customer:'Phạm Thị D',   items:1, total:5990000,  status:'overdue',    since:'1 ngày trước' },
]

const RECENT = [
  { id:'PN-240613-004', type:'import', party:'Apple VN',         items:3, total:89970000,  time:'14:22' },
  { id:'PX-240613-007', type:'export', party:'KH Nguyễn Văn A', items:1, total:29990000,  time:'12:45' },
  { id:'PN-240613-003', type:'import', party:'Samsung VN',       items:5, total:139950000, time:'11:10' },
  { id:'PX-240613-006', type:'export', party:'KH Trần Thị B',   items:2, total:15980000,  time:'09:55' },
]

const ORDER_STATUS = {
  processing: { bg:'bg-blue-100',  text:'text-blue-600',  label:'Đang xử lý'   },
  pending:    { bg:'bg-amber-100', text:'text-amber-600', label:'Chờ xác nhận' },
  overdue:    { bg:'bg-red-100',   text:'text-red-600',   label:'Quá hạn'      },
}

export default function StaffDashboardPage() {
  const onNavigate = useNav()
  const today = new Date()
  const dateStr = today.toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  const KPI = [
    { label:'Phiếu nhập hôm nay', value:4, sub:'+2 so với hôm qua', color:'teal',  action:'staffImport',
      icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label:'Phiếu xuất hôm nay', value:7, sub:'+3 so với hôm qua', color:'blue',  action:'staffExport',
      icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
    { label:'Tồn kho sắp hết',    value:3, sub:'Cần nhập bổ sung',  color:'red',   action:null,
      icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { label:'Đơn cần xử lý',      value:5, sub:'2 đơn quá hạn',    color:'amber', action:'staffOrders',
      icon:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chào buổi sáng, Dũng! 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">LD</div>
        </div>
      </header>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {KPI.map((c, i) => {
            const cls = {
              teal:  ['bg-teal-500',  'text-teal-600'  ],
              blue:  ['bg-blue-500',  'text-blue-600'  ],
              red:   ['bg-red-500',   'text-red-600'   ],
              amber: ['bg-amber-400', 'text-amber-600' ],
            }[c.color]
            return (
              <div
                key={i}
                onClick={() => c.action && onNavigate(c.action)}
                className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 ${c.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              >
                <span className={`w-12 h-12 ${cls[0]} rounded-xl flex items-center justify-center text-white shrink-0`}>{c.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                  <p className={`text-3xl font-bold ${cls[1]}`}>{c.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-5 gap-5">
          {/* Low stock */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-gray-800">Cảnh báo tồn kho</h3>
              </div>
              <button onClick={() => onNavigate('staffImport')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer">
                Nhập bổ sung →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {LOW_STOCK.map((p, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${p.status==='critical' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <svg className={`w-4 h-4 ${p.status==='critical' ? 'text-red-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${p.status==='critical' ? 'text-red-600' : 'text-amber-600'}`}>Còn {p.stock}</p>
                    <p className="text-[11px] text-gray-400">Min: {p.min}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-50">
              <button onClick={() => onNavigate('staffImport')} className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                + Tạo phiếu nhập kho
              </button>
            </div>
          </div>

          {/* Pending orders */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800">Đơn hàng cần xử lý</h3>
              <button onClick={() => onNavigate('staffOrders')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer">
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {PENDING_ORDERS.map((o, i) => {
                const sc = ORDER_STATUS[o.status]
                return (
                  <div
                    key={i}
                    onClick={() => onNavigate('staffOrders')}
                    className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800 font-mono">{o.id}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{o.customer} · {o.items} sản phẩm</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">{fmt(o.total)}đ</p>
                      <p className="text-[11px] text-gray-400">{o.since}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent receipts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Phiếu gần đây</h3>
            <button onClick={() => onNavigate('staffHistory')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer">
              Xem lịch sử →
            </button>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-50">
            {RECENT.map((r, i) => (
              <div
                key={i}
                onClick={() => onNavigate('staffHistory')}
                className="p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${r.type==='import' ? 'bg-teal-500' : 'bg-blue-500'}`}>
                    {r.type==='import' ? 'NH' : 'XH'}
                  </span>
                  <span className="font-mono text-[11px] text-gray-500 font-semibold">{r.id}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">{r.party}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{r.items} SP · {r.time}</p>
                <p className="text-sm font-bold text-gray-800 mt-1.5">{fmt(r.total)}đ</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
