// Danh sách nav phẳng dùng chung cho các sidebar khu vực khách hàng
// (InvoiceSidebar, OrderHistorySidebar, PaymentSidebar, UserProfileSidebar).
// item.active là cờ tĩnh do từng sidebar tự đánh dấu mục đang active.
export default function SidebarNavList({
  items, navTargets, onNavigate,
  navClassName = 'flex-1 px-3 space-y-0.5',
  rounded = true,
  activeBorderClass = 'border-blue-600',
  hoverBgClass = 'hover:bg-gray-100',
}) {
  return (
    <nav className={navClassName}>
      {items.map((item) => (
        <button aria-label="Thao tác" key={item.id}
          type="button"
          onClick={() => navTargets[item.id] && onNavigate(navTargets[item.id])}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${rounded ? 'rounded-xl' : ''} ${
            item.active
              ? `bg-blue-50 text-blue-700 border-l-4 ${activeBorderClass}`
              : `text-gray-600 ${hoverBgClass} border-l-4 border-transparent`
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
