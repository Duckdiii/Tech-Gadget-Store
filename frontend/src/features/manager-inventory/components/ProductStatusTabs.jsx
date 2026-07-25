const TABS = [
  { id: 'active', label: 'Đang kinh doanh' },
  { id: 'discontinued', label: 'Đã ngừng kinh doanh' },
]

export default function ProductStatusTabs({ activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200 flex items-center justify-between">
      <div className="flex gap-6">
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button aria-label="Thao tác" key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer border-none bg-transparent ${
                active ? 'text-[#E8420A]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E8420A] rounded-t" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
