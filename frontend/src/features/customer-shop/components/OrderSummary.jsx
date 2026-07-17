
function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

export default function OrderSummary({ items }) {
  const checkedItems = items.filter(i => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const originalTotal = checkedItems.reduce((s, i) => s + (i.originalPrice ?? i.price) * i.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee = checkedItems.reduce((s, i) => s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const total = subtotal + serviceFee

  return (
    <div className="sticky top-6 overflow-hidden" style={{ backgroundColor: 'var(--ink)', borderRadius: '16px', border: '1px solid var(--b1)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div className="px-6 py-4.5" style={{ borderBottom: '1px solid var(--b1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-5" style={{ backgroundColor: 'var(--accent)' }} />
          <h2 className="text-[15px] font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Be Vietnam Pro, sans-serif', color: 'var(--t1)' }}>Tổng quan đơn hàng</h2>
        </div>
        <p className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>{totalQty} sản phẩm được chọn</p>
      </div>

      <div className="p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Giá sản phẩm</span>
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--t1)' }}>{fmt(subtotal)}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12.5px]" style={{ color: 'var(--ok)' }}>Tiết kiệm từ giảm giá</span>
            <span className="text-[12.5px] font-extrabold" style={{ color: 'var(--ok)' }}>−{fmt(productSavings)}</span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Dịch vụ kèm theo</span>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>+{fmt(serviceFee)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Phí vận chuyển</span>
          <span className="text-[12.5px] font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
        </div>

        <div style={{ borderTop: '1px dashed var(--b2)', margin: '6px 0' }} />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Tổng tạm tính</span>
            <span className="text-[11px]" style={{ color: 'var(--t3)' }}>(Chưa áp mã KM)</span>
          </div>
          <p className="text-right text-[26px] font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(total)}</p>
          {productSavings > 0 && (
            <p className="text-right text-[11px] font-bold mt-0.5" style={{ color: 'var(--ok)' }}>Đã tiết kiệm {fmt(productSavings)}</p>
          )}
        </div>
        <p className="text-[11px] text-center pt-2" style={{ color: 'var(--t3)' }}>Mã khuyến mãi sẽ được nhập ở bước tiếp theo</p>
      </div>
    </div>
  )
}
