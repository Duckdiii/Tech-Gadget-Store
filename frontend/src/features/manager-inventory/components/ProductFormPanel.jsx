import Field from './Field'
import ProductVariantsEditor from './ProductVariantsEditor'
import ProductImagesEditor from './ProductImagesEditor'

const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]'

export default function ProductFormPanel({
  panel, form, setForm, formErrors, brands, categories,
  showSpecs, setShowSpecs, saving, onClose, onSubmit,
  variants, images, variantForm, setVariantForm, imageForm, setImageForm,
  subError, subSaving, onAddVariant, onRemoveVariant, onAddImage, onRemoveImage,
}) {
  return (
    <>
      <button type="button" aria-label="Đóng bảng sản phẩm" onClick={onClose} className="fixed inset-0 bg-black/30 z-40 cursor-pointer border-none" />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col text-left">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{panel === 'add' ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="p-2 hover:bg-gray-100 rounded cursor-pointer border-none bg-transparent"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-4">
            <Field label="Tên sản phẩm *" error={formErrors.name}>
              <label htmlFor="product-name-input" className="sr-only">Tên sản phẩm</label>
              <input id="product-name-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="iPhone 15 Pro Max" aria-label="Tên sản phẩm" className={inp} />
            </Field>
            <Field label="Mô tả">
              <label htmlFor="product-description-textarea" className="sr-only">Mô tả sản phẩm</label>
              <textarea id="product-description-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Mô tả sản phẩm..." aria-label="Mô tả sản phẩm" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Thương hiệu *" error={formErrors.brandId}>
                <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} aria-label="Chọn thương hiệu" className={inp}>
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Danh mục *" error={formErrors.categoryId}>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} aria-label="Chọn danh mục" className={inp}>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button aria-label="Ẩn hiện thông số kỹ thuật" type="button" onClick={() => setShowSpecs(s => !s)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 cursor-pointer border-none bg-transparent p-0">
              Thông số kỹ thuật
              <svg className={`w-4 h-4 transition-transform ${showSpecs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showSpecs && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field label="Kích thước màn hình (inch)">
                  <input type="number" step="0.1" value={form.screenSize} onChange={e => setForm(f => ({ ...f, screenSize: e.target.value }))} aria-label="Kích thước màn hình (inch)" className={inp} />
                </Field>
                <Field label="Độ phân giải màn hình">
                  <input value={form.screenResolution} onChange={e => setForm(f => ({ ...f, screenResolution: e.target.value }))} aria-label="Độ phân giải màn hình" className={inp} />
                </Field>
                <Field label="Camera sau">
                  <input value={form.rearCamera} onChange={e => setForm(f => ({ ...f, rearCamera: e.target.value }))} aria-label="Camera sau" className={inp} />
                </Field>
                <Field label="Camera trước">
                  <input value={form.frontCamera} onChange={e => setForm(f => ({ ...f, frontCamera: e.target.value }))} aria-label="Camera trước" className={inp} />
                </Field>
                <Field label="Chipset">
                  <input value={form.chipset} onChange={e => setForm(f => ({ ...f, chipset: e.target.value }))} aria-label="Chipset" className={inp} />
                </Field>
                <Field label="Dung lượng pin (mAh)">
                  <input type="number" value={form.batteryCapacity} onChange={e => setForm(f => ({ ...f, batteryCapacity: e.target.value }))} aria-label="Dung lượng pin (mAh)" className={inp} />
                </Field>
                <Field label="Loại SIM">
                  <input value={form.simType} onChange={e => setForm(f => ({ ...f, simType: e.target.value }))} aria-label="Loại SIM" className={inp} />
                </Field>
                <Field label="Hệ điều hành">
                  <input value={form.operatingSystem} onChange={e => setForm(f => ({ ...f, operatingSystem: e.target.value }))} aria-label="Hệ điều hành" className={inp} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2">
                  <input type="checkbox" checked={form.nfcSupported} onChange={e => setForm(f => ({ ...f, nfcSupported: e.target.checked }))} className="w-4 h-4" />
                  Hỗ trợ NFC
                </label>
              </div>
            )}
          </div>

          {panel === 'edit' && (
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <ProductVariantsEditor
                variants={variants}
                variantForm={variantForm}
                setVariantForm={setVariantForm}
                subError={subError}
                subSaving={subSaving}
                onAdd={onAddVariant}
                onRemove={onRemoveVariant}
              />
              <ProductImagesEditor
                images={images}
                imageForm={imageForm}
                setImageForm={setImageForm}
                subSaving={subSaving}
                onAdd={onAddImage}
                onRemove={onRemoveImage}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button aria-label="Đóng" type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Đóng</button>
          <button aria-label="Lưu sản phẩm" type="button" onClick={onSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </>
  )
}
