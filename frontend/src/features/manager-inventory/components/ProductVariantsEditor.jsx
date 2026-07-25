import { formatCurrency } from '../../../utils/formatters'

const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

export default function ProductVariantsEditor({ variants, variantForm, setVariantForm, subError, subSaving, onAdd, onRemove }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Phiên bản (RAM / Bộ nhớ / Màu)</h3>
      {subError && <p className="text-xs text-red-500 mb-2">{subError}</p>}
      <div className="space-y-1.5 mb-2">
        {variants.map(v => (
          <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs">
            <span className="text-gray-700">{v.ramGb}GB / {v.storageGb}GB / {v.color} — {formatCurrency(v.price)}</span>
            <button aria-label="Thao tác" type="button" onClick={() => onRemove(v.id)} className="text-red-500 hover:text-red-700 cursor-pointer font-medium">Xóa</button>
          </div>
        ))}
        {variants.length === 0 && <p className="text-xs text-gray-400">Chưa có phiên bản nào</p>}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <label htmlFor="variant-ram" className="sr-only">RAM (GB)</label>
        <input id="variant-ram" type="number" placeholder="RAM (GB)" aria-label="RAM (GB)" value={variantForm.ramGb} onChange={e => setVariantForm(f => ({ ...f, ramGb: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
        <label htmlFor="variant-storage" className="sr-only">Bộ nhớ (GB)</label>
        <input id="variant-storage" type="number" placeholder="Bộ nhớ (GB)" aria-label="Bộ nhớ (GB)" value={variantForm.storageGb} onChange={e => setVariantForm(f => ({ ...f, storageGb: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
        <label htmlFor="variant-color" className="sr-only">Màu sắc</label>
        <input id="variant-color" placeholder="Màu sắc" aria-label="Màu sắc" value={variantForm.color} onChange={e => setVariantForm(f => ({ ...f, color: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
        <label htmlFor="variant-price" className="sr-only">Giá bán</label>
        <input id="variant-price" type="number" placeholder="Giá" aria-label="Giá" value={variantForm.price} onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))} className={`${inp} text-xs px-2 py-1.5`} />
      </div>
      <button aria-label="Thao tác" type="button" onClick={onAdd} disabled={subSaving} className="mt-2 w-full py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:border-[#E8420A] hover:text-[#E8420A] cursor-pointer disabled:opacity-60">
        + Thêm phiên bản
      </button>
    </div>
  )
}
