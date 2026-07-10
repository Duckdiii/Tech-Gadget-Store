import { useAuth } from '../../../context/AuthContext'
import { useStaffProfile } from '../hooks/useStaffProfile'
import ProfileCard from '../components/ProfileCard'
import ChangePasswordCard from '../components/ChangePasswordCard'

export default function StaffProfilePage() {
  const { user } = useAuth()
  const {
    profile,
    pwdForm, setPwdForm,
    pwdErrors,
    pwdSuccess,
    pwdSubmitting,
    showPwd,
    handleChangePwd,
    toggleShow,
  } = useStaffProfile(user)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h1>
          <p className="text-xs text-gray-400 mt-0.5">Xem và cập nhật thông tin tài khoản của bạn</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{profile.initials}</div>
        </div>
      </header>

      <div className="flex-1 px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <ProfileCard profile={profile} />
          <ChangePasswordCard
            pwdForm={pwdForm}
            setPwdForm={setPwdForm}
            pwdErrors={pwdErrors}
            pwdSuccess={pwdSuccess}
            pwdSubmitting={pwdSubmitting}
            showPwd={showPwd}
            toggleShow={toggleShow}
            onSubmit={handleChangePwd}
          />
        </div>
      </div>
    </div>
  )
}
