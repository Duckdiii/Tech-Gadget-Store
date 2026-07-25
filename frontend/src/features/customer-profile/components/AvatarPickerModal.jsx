import { useRef } from 'react'

const PREDEFINED_AVATARS = [
  {
    id: 'robot',
    name: 'Robot Hi-Tech',
    bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="8" width="14" height="12" rx="2" />
        <path d="M9 16h6" />
        <path d="M10 12h.01M14 12h.01" />
        <path d="M12 8V5m0 0l-2-2m2 2l2-2" />
        <path d="M4 12h1m14 0h1" />
      </svg>
    )
  },
  {
    id: 'coder',
    name: 'Developer',
    bg: 'linear-gradient(135deg, #10b981, #047857)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    )
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    bg: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a9.969 9.969 0 006.404-2.328C17.22 17.514 14.818 16 12 16c-2.818 0-5.22 1.514-6.404 3.672A9.969 9.969 0 0012 22z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12a7 7 0 11-14 0" />
      </svg>
    )
  },
  {
    id: 'gamer',
    name: 'Gamer',
    bg: 'linear-gradient(135deg, #ec4899, #be185d)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <path d="M6 12h4m-2-2v4M15 11h.01M18 13h.01" />
      </svg>
    )
  },
  {
    id: 'cat',
    name: 'Neko Cat',
    bg: 'linear-gradient(135deg, #f59e0b, #b45309)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5c-1.657 0-3 1.343-3 3v3h6V8c0-1.657-1.343-3-3-3z" />
        <path d="M9 11v7a3 3 0 003 3 3 3 0 003-3v-7" />
        <path d="M5 8v10a7 7 0 007 7 7 7 0 007-7V8l-3 4-4-4-4 4-3-4z" />
      </svg>
    )
  },
  {
    id: 'ninja',
    name: 'Ninja Shadow',
    bg: 'linear-gradient(135deg, #374151, #111827)',
    svg: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14h8" />
      </svg>
    )
  }
]

// Convert SVG to dataURL so we can store it as image source string
function getPredefinedDataUrl(avatar) {
  // Generate simple SVG string in Base64
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128">
    <rect width="24" height="24" rx="12" fill="${avatar.id === 'ninja' ? '#111827' : 'url(#grad)'}"/>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${avatar.bg.match(/#[0-9a-fA-F]+/g)[0]}" />
        <stop offset="100%" stop-color="${avatar.bg.match(/#[0-9a-fA-F]+/g)[1]}" />
      </linearGradient>
    </defs>
    <g transform="translate(3, 3) scale(0.75)">
      ${avatar.id === 'robot' ? '<rect x="5" y="8" width="14" height="12" rx="2" fill="none" stroke="white" stroke-width="2"/><path d="M9 16h6" stroke="white" stroke-width="2"/><path d="M10 12h.01M14 12h.01" stroke="white" stroke-width="2"/><path d="M12 8V5m0 0l-2-2m2 2l2-2" stroke="white" stroke-width="2"/><path d="M4 12h1m14 0h1" stroke="white" stroke-width="2"/>' : ''}
      ${avatar.id === 'coder' ? '<path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
      ${avatar.id === 'astronaut' ? '<path d="M12 22a9.969 9.969 0 006.404-2.328C17.22 17.514 14.818 16 12 16c-2.818 0-5.22 1.514-6.404 3.672A9.969 9.969 0 0012 22z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 12a7 7 0 11-14 0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
      ${avatar.id === 'gamer' ? '<rect x="2" y="6" width="20" height="12" rx="3" fill="none" stroke="white" stroke-width="2"/><path d="M6 12h4m-2-2v4M15 11h.01M18 13h.01" fill="none" stroke="white" stroke-width="2"/>' : ''}
      ${avatar.id === 'cat' ? '<path d="M12 5c-1.657 0-3 1.343-3 3v3h6V8c0-1.657-1.343-3-3-3z" fill="none" stroke="white" stroke-width="2"/><path d="M9 11v7a3 3 0 003 3 3 3 0 003-3v-7" fill="none" stroke="white" stroke-width="2"/><path d="M5 8v10a7 7 0 007 7 7 7 0 007-7V8l-3 4-4-4-4 4-3-4z" fill="none" stroke="white" stroke-width="2"/>' : ''}
      ${avatar.id === 'ninja' ? '<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 10h.01M15 10h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14h8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
    </g>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`
}

export default function AvatarPickerModal({ isOpen, onClose, onSelect, currentAvatar }) {
  const fileInputRef = useRef(null)

  if (!isOpen) return null



  const handleSelectPredefined = (avatar) => {
    const dataUrl = getPredefinedDataUrl(avatar)
    onSelect(dataUrl)
    onClose()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert file to Base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      onSelect(base64)
      onClose()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">Thay đổi ảnh đại diện</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chọn ảnh minh họa hoặc tải lên ảnh của bạn</p>
          </div>
          <button aria-label="Đóng" type="button" onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Predefined */}
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Hình minh họa ngộ nghĩnh</span>
            <div className="grid grid-cols-3 gap-4">
              {PREDEFINED_AVATARS.map((avatar) => (
                <button aria-label="Thao tác" type="button"
                  key={avatar.id}
                  onClick={() => handleSelectPredefined(avatar)}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-gray-200 hover:border-[var(--accent)] hover:bg-orange-50/20 transition-colors cursor-pointer bg-white group animate-none"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                    style={{ background: avatar.bg }}
                  >
                    {avatar.svg}
                  </div>
                  <span className="text-[11px] font-bold text-gray-600 group-hover:text-[var(--accent)] text-center truncate w-full">{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Custom upload */}
          <div className="border-t border-gray-100 pt-5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Tự tải ảnh cá nhân</span>
            <div className="flex items-center gap-4">
              <button aria-label="Thao tác" type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 border border-dashed border-gray-300 hover:border-[var(--accent)] text-gray-700 hover:text-[var(--accent)] rounded-xl text-sm font-semibold transition-colors cursor-pointer bg-white"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Tải ảnh lên (.png, .jpg...)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              {currentAvatar && !currentAvatar.startsWith('data:image/svg+xml') && (
                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden shrink-0">
                  <img src={currentAvatar} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
