export default function PromotionDeleteModal({ isOpen, promotion, onClose, onConfirm, loading }) {
  if (!isOpen || !promotion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">Xóa khuyến mãi</h3>
            <p className="text-xs text-gray-500 mt-0.5">Thao tác này không thể hoàn tác</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-6">
          Bạn có chắc muốn xóa chiến dịch{' '}
          <span className="font-semibold text-gray-900">"{promotion.name}"</span>?
          Toàn bộ liên kết sản phẩm sẽ bị gỡ bỏ.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}
