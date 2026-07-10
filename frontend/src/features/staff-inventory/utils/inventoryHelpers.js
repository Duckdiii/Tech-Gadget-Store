export const USER_EMAIL_TO_ID = {
  'nguyenducduy@gmail.com': 'user-mgr-01',
  'bich.tran@techstore.vn': 'user-stf-01',
  'cuong.le@techstore.vn': 'user-stf-02',
}

export const STAFF_NAMES = {
  'user-mgr-01': 'Nguyễn Văn An',
  'user-stf-01': 'Trần Thị Bích',
  'user-stf-02': 'Lê Hoàng Cường',
}

export const WAREHOUSES = ['Kho trung tâm', 'Kho chi nhánh Q1', 'Kho chi nhánh Q7', 'Kho phụ B']

export const EXPORT_TYPES = [
  { id: 'sale',     label: 'Xuất bán',             recipientLabel: 'Khách hàng',    color: 'blue'   },
  { id: 'transfer', label: 'Xuất chuyển kho',      recipientLabel: 'Kho nhận',      color: 'purple' },
  { id: 'damage',   label: 'Xuất hỏng / thanh lý', recipientLabel: 'Lý do',         color: 'red'    },
  { id: 'return',   label: 'Xuất trả NCC',         recipientLabel: 'Nhà cung cấp',  color: 'amber'  },
]

export const EXPORT_TYPE_BADGE = {
  sale:     'bg-orange-50 text-[#C4350A]',
  transfer: 'bg-purple-100 text-purple-700',
  damage:   'bg-red-100 text-red-600',
  return:   'bg-amber-100 text-amber-700',
}

export const fmt = (n) => (Number(n) || 0).toLocaleString('vi-VN')

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseDetails(detailsStr) {
  if (!detailsStr) return { ram: '', storage: '', color: '' }
  const parts = detailsStr.split('/').map(s => s.trim())
  let ram = ''
  let storage = ''
  let color = ''
  parts.forEach(p => {
    if (p.toLowerCase().includes('ram')) {
      ram = p.replace(/gb\s*ram/i, '').trim()
    } else if (p.toLowerCase().includes('storage')) {
      storage = p.replace(/gb\s*storage/i, '').trim()
    } else {
      color = p
    }
  })
  return { ram, storage, color }
}

export function resolveExportType(note) {
  if (!note) return 'sale'
  return note.includes('transfer') ? 'transfer' : note.includes('damage') ? 'damage' : note.includes('return') ? 'return' : 'sale'
}
