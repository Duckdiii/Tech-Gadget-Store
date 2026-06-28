import { useState, useEffect } from 'react'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

function StatCard({ icon, label, value, sub, color }) {
  const clr = {
    blue:   ['bg-orange-50',  'bg-[#E8420A]',   'text-[#C4350A]'],
    green:  ['bg-green-50', 'bg-green-500',  'text-green-700'],
    purple: ['bg-purple-50','bg-purple-500', 'text-purple-700'],
    amber:  ['bg-amber-50', 'bg-amber-500',  'text-amber-700'],
  }[color]
  return (
    <div className={`${clr[0]} rounded p-5 flex items-center gap-4 text-gray-800`}>
      <div className={`w-11 h-11 ${clr[1]} rounded flex items-center justify-center text-white shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-xl font-bold ${clr[2]}`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function RecoverRestorePage() {
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [restoring, setRestoring]         = useState(false)
  const [restoredId, setRestoredId]       = useState(null)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [backups, setBackups]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [settings, setSettings]           = useState({
    autoEnabled: true,
    frequency: 'daily',
    time: '08:00',
    retention: '30',
    includeMedia: true,
  })
  const [toast, setToast]                 = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/manager/backup-restore/recovery-points')
      const mapped = (data || []).map((b, idx) => {
        const sizeGB = b.sizeBytes ? (b.sizeBytes / (1024 * 1024 * 1024)).toFixed(3) + ' GB' : '—'
        const isManual = (b.backupName || '').toLowerCase().includes('manual')
        return {
          id: idx + 1,
          name: b.backupName,
          type: isManual ? 'manual' : 'auto',
          size: sizeGB,
          records: { products: 1840, orders: 18720, customers: 5240, staff: 8 },
          createdAt: b.timestamp ? new Date(b.timestamp).toLocaleString('vi-VN') : '—',
          status: 'success',
          checksum: b.checksum,
          appVersion: b.appVersion,
        }
      })
      setBackups(mapped)
    } catch (e) {
      console.error("Lỗi tải danh sách sao lưu:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  function handleRestore(backup) {
    setRestoreTarget(backup)
  }

  const confirmRestore = async () => {
    if (!restoreTarget) return
    setRestoring(true)
    try {
      await apiFetch('/api/manager/backup-restore/restores', {
        method: 'POST',
        body: JSON.stringify({
          backupName: restoreTarget.name,
          scope: 'FULL',
          modules: []
        })
      })
      setRestoredId(restoreTarget.id)
      showToast(`Đã khôi phục thành công từ ${restoreTarget.name}`)
    } catch (e) {
      console.error("Lỗi phục hồi dữ liệu:", e)
      alert("Phục hồi thất bại: " + e.message)
    } finally {
      setRestoring(false)
      setRestoreTarget(null)
    }
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    try {
      await apiFetch('/api/manager/backup-restore/backups?reason=Manual Backup', {
        method: 'POST'
      })
      await fetchBackups()
      showToast('Đã tạo backup thủ công thành công')
    } catch (e) {
      console.error("Lỗi tạo backup:", e)
      alert("Tạo backup thất bại: " + e.message)
    } finally {
      setCreatingBackup(false)
    }
  }

  const latestSuccess = backups.find(b => b.status === 'success')
  const successCount  = backups.filter(b => b.status === 'success').length
  const totalSize     = backups.reduce((acc, b) => {
    const num = parseFloat(b.size)
    return isNaN(num) ? acc : acc + num
  }, 0).toFixed(2)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <StoreNavbar />

      <div className="flex-1 px-8 py-7 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-sans">Phục hồi & Khôi phục dữ liệu</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý bản sao lưu và khôi phục hệ thống</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creatingBackup || loading}
            className="flex items-center gap-2 bg-[#E8420A] hover:bg-[#C4350A] disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer border-none"
          >
            {creatingBackup ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đang tạo backup...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Tạo backup ngay
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            color="green"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Backup gần nhất"
            value={latestSuccess ? latestSuccess.createdAt.split(' ')[0] : '—'}
            sub={latestSuccess ? `lúc ${latestSuccess.createdAt.split(' ')[1]}` : ''}
          />
          <StatCard
            color="blue"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
            label="Tổng bản backup"
            value={`${backups.length} bản`}
            sub={`${successCount} thành công`}
          />
          <StatCard
            color="purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
            label="Dung lượng sử dụng"
            value={`${totalSize} GB`}
            sub="trong tổng 50 GB"
          />
          <StatCard
            color="amber"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Tự động backup"
            value={settings.autoEnabled ? 'Đang bật' : 'Tắt'}
            sub={settings.autoEnabled ? `Mỗi ngày lúc ${settings.time}` : 'Chưa lên lịch'}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_300px] gap-5">
          {/* Backup list */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Lịch sử backup</h2>
              <span className="text-xs text-gray-400">{backups.length} bản lưu</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {backups.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 text-sm">Không tìm thấy bản sao lưu nào</p>
                ) : (
                  backups.map((b) => (
                    <div key={b.id} className={`px-6 py-4 hover:bg-gray-50/70 transition-colors ${restoredId === b.id ? 'bg-green-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`mt-0.5 w-9 h-9 rounded flex items-center justify-center shrink-0 ${b.status === 'success' ? b.type === 'manual' ? 'bg-purple-100' : 'bg-orange-50' : 'bg-red-100'}`}>
                          {b.status === 'success' ? (
                            b.type === 'manual' ? (
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )
                          ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-800 font-mono truncate max-w-[200px]">{b.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${b.type === 'manual' ? 'bg-purple-100 text-purple-600' : 'bg-orange-50 text-[#E8420A]'}`}>{b.type === 'manual' ? 'Thủ công' : 'Tự động'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${b.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{b.status === 'success' ? '✓ Thành công' : '✕ Lỗi'}</span>
                            {restoredId === b.id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-600">Đã khôi phục</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{b.createdAt}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 font-medium">{b.size}</span>
                          </div>
                          {b.records && (
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {Object.entries(b.records).map(([k, v]) => (
                                <span key={k} className="text-[11px] text-gray-400">
                                  <span className="text-gray-600 font-medium">{v.toLocaleString()}</span> {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {b.status === 'success' && (
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <button
                              onClick={() => handleRestore(b)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#E8420A] border border-orange-200 hover:bg-orange-50 rounded cursor-pointer transition-colors bg-white"
                            >
                              Khôi phục
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4 text-left">
            {/* Auto backup settings */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Cài đặt tự động</h2>
              <div className="space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Backup tự động</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lên lịch sao lưu định kỳ</p>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, autoEnabled: !s.autoEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 border-none ${settings.autoEnabled ? 'bg-[#E8420A]' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {settings.autoEnabled && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tần suất</label>
                      <select
                        value={settings.frequency}
                        onChange={e => setSettings(s => ({ ...s, frequency: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
                      >
                        <option value="hourly">Mỗi giờ</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Thời điểm</label>
                      <input
                        type="time"
                        value={settings.time}
                        onChange={e => setSettings(s => ({ ...s, time: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lưu trữ (ngày)</label>
                      <select
                        value={settings.retention}
                        onChange={e => setSettings(s => ({ ...s, retention: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
                      >
                        <option value="7">7 ngày</option>
                        <option value="14">14 ngày</option>
                        <option value="30">30 ngày</option>
                        <option value="90">90 ngày</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bao gồm media</p>
                        <p className="text-xs text-gray-400">Ảnh sản phẩm, tài liệu</p>
                      </div>
                      <button
                        onClick={() => setSettings(s => ({ ...s, includeMedia: !s.includeMedia }))}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 border-none ${settings.includeMedia ? 'bg-[#E8420A]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.includeMedia ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </>
                )}

                <button
                  onClick={() => showToast('Đã lưu cài đặt backup tự động')}
                  className="w-full py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>

            {/* Storage gauge */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Dung lượng lưu trữ</h2>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Đã dùng: <span className="font-semibold text-gray-800">{totalSize} GB</span></span>
                <span>Tổng: <span className="font-semibold text-gray-800">50 GB</span></span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E8420A] to-[#C4350A]"
                  style={{ width: `${Math.min(100, (parseFloat(totalSize) / 50) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-right">{((parseFloat(totalSize) / 50) * 100).toFixed(1)}% đã sử dụng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restore confirm modal */}
      {restoreTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-2xl w-[440px] p-6 text-gray-800">
              {restoring ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#E8420A] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Đang khôi phục dữ liệu...</h3>
                  <p className="text-sm text-gray-400 mt-1">Vui lòng không đóng trình duyệt</p>
                  <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E8420A] rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">Xác nhận khôi phục?</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Hệ thống sẽ được khôi phục về trạng thái của bản backup:
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-center">
                    <p className="text-sm font-semibold text-gray-800 font-mono">{restoreTarget.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{restoreTarget.createdAt} · {restoreTarget.size}</p>
                  </div>
                  <p className="text-xs text-red-500 text-center mt-3 font-semibold">
                    ⚠ Mọi thay đổi sau thời điểm backup này sẽ bị mất.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setRestoreTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Huỷ bỏ</button>
                    <button onClick={confirmRestore} className="flex-1 py-2.5 bg-[#E8420A] hover:bg-[#C4350A] text-white rounded text-sm font-semibold cursor-pointer transition-colors border-none">Xác nhận khôi phục</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">
          {toast}
        </div>
      )}
    </div>
  )
}
