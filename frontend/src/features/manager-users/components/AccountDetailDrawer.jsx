import { useState } from 'react'
import Avatar from './Avatar'
import InfoRow from './InfoRow'

const STATUS_CFG = {
  active:   { label:'Hoạt động',  bg:'bg-green-100',  text:'text-green-700',  dot:'bg-green-500'  },
  blocked:  { label:'Bị khoá',    bg:'bg-red-100',    text:'text-red-600',    dot:'bg-red-500'    },
  pending:  { label:'Chờ duyệt',  bg:'bg-amber-100',  text:'text-amber-700',  dot:'bg-amber-400'  },
}

export default function AccountDetailDrawer({ account, onClose, onBlock, onUnblock, onDelete, onResetPwd }) {
  const [blockConfirm,  setBlockConfirm]  = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [resetConfirm,  setResetConfirm]  = useState(false)
  const [resetDone,     setResetDone]     = useState(false)
  
  const st = STATUS_CFG[account.status] || STATUS_CFG.active

  function handleReset() {
    setResetConfirm(false)
    setResetDone(true)
    onResetPwd(account.id)
  }

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 pt-5 pb-6 relative text-left">
          <button aria-label="Đóng" type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/10 cursor-pointer border-none bg-transparent">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <Avatar initials={account.initials} bg={account.bg} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{account.email}</h2>
              <p className="text-sm text-white/60 mt-0.5">@{account.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>● {st.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <InfoRow label="Email"              value={account.email} />
          <InfoRow label="Trạng thái"          value={st.label} />
          <InfoRow label="Ngày tạo"            value={account.createdAt} />
          <InfoRow label="Đăng nhập gần đây"   value={account.lastLogin} />
          <InfoRow label="Tổng lần đăng nhập"  value={`${account.loginCount} lần`} />

          {resetDone && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded px-4 py-3 text-left">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-sm font-semibold text-green-700">Đã gửi email đặt lại mật khẩu</p>
                <p className="text-xs text-green-600 mt-0.5">{account.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <button aria-label="Thao tác" type="button" onClick={() => setResetConfirm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Đặt lại mật khẩu
          </button>
          <div className="flex gap-2">
            {account.status === 'blocked'
              ? <button aria-label="Thao tác" type="button" onClick={() => { onUnblock(account.id); onClose() }} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-green-200 rounded text-sm font-medium text-green-700 hover:bg-green-50 cursor-pointer transition-colors bg-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                  Mở khoá
                </button>
              : <button aria-label="Thao tác" type="button" onClick={() => setBlockConfirm(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-orange-200 rounded text-sm font-medium text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors bg-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg>
                  Khoá tài khoản
                </button>
            }
            <button aria-label="Thao tác" type="button" onClick={() => setDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors bg-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Xoá tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* Block confirm */}
      {blockConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6 text-center text-gray-800">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Khoá tài khoản?</h3>
              <p className="text-sm text-gray-500 mt-2">Tài khoản <span className="font-semibold text-gray-800">{account.email}</span> sẽ không thể đăng nhập.<br />Bạn có thể mở khoá sau.</p>
              <div className="flex gap-3 mt-6">
                <button  type="button" onClick={() => setBlockConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Huỷ</button>
                <button aria-label="Thao tác" type="button" onClick={() => { onBlock(account.id); setBlockConfirm(false); onClose() }} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">Khoá tài khoản</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6 text-center text-gray-800">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xoá tài khoản?</h3>
              <p className="text-sm text-gray-500 mt-2">Tài khoản <span className="font-semibold text-gray-800">{account.email}</span> sẽ bị xoá vĩnh viễn.<br />Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3 mt-6">
                <button  type="button" onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Huỷ bỏ</button>
                <button aria-label="Thao tác" type="button" onClick={() => { onDelete(account.id); setDeleteConfirm(false); onClose() }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">Xác nhận xoá</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reset confirm */}
      {resetConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white rounded shadow-2xl w-[380px] p-6 text-center text-gray-800">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Đặt lại mật khẩu?</h3>
              <p className="text-sm text-gray-500 mt-2">Link đặt lại mật khẩu sẽ được gửi đến<br /><span className="font-semibold text-gray-800">{account.email}</span></p>
              <div className="flex gap-3 mt-6">
                <button  type="button" onClick={() => setResetConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Huỷ</button>
                <button aria-label="Thao tác" type="button" onClick={handleReset} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">Gửi email</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
