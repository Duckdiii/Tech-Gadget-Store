export default function SidebarLogoutButton({ onNavigate }) {
  return (
    <div className="px-3 border-t border-gray-100 pt-3 pb-5">
      <button aria-label="Thao tác" type="button"
        onClick={() => onNavigate('login')}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors border-l-4 border-transparent"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Đăng xuất
      </button>
    </div>
  )
}
