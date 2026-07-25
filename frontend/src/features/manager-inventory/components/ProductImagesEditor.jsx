const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

export default function ProductImagesEditor({ images, imageForm, setImageForm, subSaving, onAdd, onRemove }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Hình ảnh</h3>
      <div className="space-y-1.5 mb-2">
        {images.map(img => (
          <div key={img.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs gap-2">
            <img src={img.imageUrl} alt={img.name || ''} className="w-8 h-8 rounded object-cover border border-gray-100 shrink-0" />
            <span className="text-gray-700 truncate flex-1">{img.name || img.imageUrl}</span>
            <button aria-label="Thao tác" type="button" onClick={() => onRemove(img.id)} className="text-red-500 hover:text-red-700 cursor-pointer font-medium shrink-0">Xóa</button>
          </div>
        ))}
        {images.length === 0 && <p className="text-xs text-gray-400">Chưa có hình ảnh nào</p>}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <label htmlFor="product-image-name" className="sr-only">Tên ảnh (tùy chọn)</label>
        <input id="product-image-name" placeholder="Tên ảnh (tùy chọn)" aria-label="Tên ảnh (tùy chọn)" value={imageForm.name} onChange={e => setImageForm(f => ({ ...f, name: e.target.value }))} className={`${inp} text-xs px-2 py-1.5 col-span-1`} />
        <label htmlFor="product-image-url" className="sr-only">URL ảnh</label>
        <input id="product-image-url" placeholder="URL ảnh" aria-label="URL ảnh" value={imageForm.imageUrl} onChange={e => setImageForm(f => ({ ...f, imageUrl: e.target.value }))} className={`${inp} text-xs px-2 py-1.5 col-span-2`} />
      </div>
      {/* Live URL preview */}
      {imageForm.imageUrl.trim() && (
        <div className="mt-2 flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
          <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden shrink-0 bg-white flex items-center justify-center">
            <img
              src={imageForm.imageUrl.trim()}
              alt="preview"
              className="w-full h-full object-contain"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              onLoad={e => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none' }}
            />
            <div className="hidden w-full h-full items-center justify-center text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Preview URL</p>
            <p className="text-[10px] text-gray-400 mt-0.5 break-all leading-relaxed">{imageForm.imageUrl.trim()}</p>
            {imageForm.name.trim() && (
              <p className="text-[10px] text-gray-600 font-medium mt-1">🏷️ {imageForm.name.trim()}</p>
            )}
          </div>
        </div>
      )}
      <button aria-label="Thao tác" type="button" onClick={onAdd} disabled={subSaving} className="mt-2 w-full py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:border-[#E8420A] hover:text-[#E8420A] cursor-pointer disabled:opacity-60">
        + Thêm ảnh
      </button>
    </div>
  )
}
