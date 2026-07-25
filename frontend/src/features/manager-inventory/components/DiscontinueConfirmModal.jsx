export default function DiscontinueConfirmModal({ product, discontinuing, onCancel, onConfirm }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" />
      <div className="fixed inset-0 flex items-center justify-center z-[60]">
        <div className="bg-white rounded shadow-2xl w-full max-w-[380px] mx-4 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
          <h3 className="text-lg font-bold text-gray-900 text-center">Ngừng kinh doanh sản phẩm?</h3>
          <p className="text-sm text-gray-500 text-center mt-2">
            Sản phẩm{product ? ` "${product.name}"` : ''} sẽ bị ẩn khỏi cửa hàng. Lịch sử đơn hàng liên quan vẫn được giữ nguyên
          </p>
          <div className="flex gap-3 mt-6">
            <button aria-label="Đóng" type="button" onClick={onCancel} disabled={discontinuing} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Hủy</button>
            <button aria-label="Thao tác" type="button" onClick={onConfirm} disabled={discontinuing} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              {discontinuing ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
