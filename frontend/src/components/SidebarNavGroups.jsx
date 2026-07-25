// Nav nhóm theo section dùng chung cho sidebar staff/manager (StaffSidebar, TechStoreAdminSidebar).
// isActive được truyền vào vì mỗi sidebar so khớp route khác nhau (khớp tuyệt đối vs khớp cả path con).
export default function SidebarNavGroups({
  groups, onNavigate, isActive,
  activeClasses, iconActiveClass,
  iconIdleClass = 'text-gray-400',
}) {
  return (
    <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4">
      {groups.map((group, gi) => (
        <div key={group?.id ?? group?.code ?? group?.name ?? group?.key ?? group?.val ?? (typeof group === 'object' ? `item-${gi}` : group)}>
          {group.label && (
            <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item)
              return (
                <button aria-label="Thao tác" key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    active ? activeClasses : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                  }`}
                >
                  <span className={active ? iconActiveClass : iconIdleClass}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
