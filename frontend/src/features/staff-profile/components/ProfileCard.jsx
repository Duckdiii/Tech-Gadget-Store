function InfoRow({ label, value }) {
  return (
    <div className="flex items-center py-3 border-b border-gray-50 last:border-0">
      <span className="w-36 text-xs font-medium text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}

export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="bg-teal-700 px-8 py-8 flex items-center gap-5" style={{ backgroundColor: '#0f766e' }}>
        <div className={`w-20 h-20 ${profile.bg} rounded flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0`}>
          {profile.initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          <p className="text-teal-200 mt-0.5">@{profile.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">{profile.role}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Thông tin chi tiết</h3>
        <InfoRow label="Email"            value={profile.email}      />
        <InfoRow label="Chức vụ"          value={profile.role}       />
        <InfoRow label="Mã nhân viên"     value={profile.staffCode}  />
        <InfoRow label="Ngày vào làm"     value={profile.joinDate}   />
        <InfoRow label="Đăng nhập gần đây" value={profile.lastLogin} />
      </div>
    </div>
  )
}
