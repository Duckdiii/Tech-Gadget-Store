import React from 'react'

const DEMO_ACCOUNTS = [
  { role: 'customer', label: 'Khách hàng', desc: 'Mua sắm & đơn hàng' },
  { role: 'manager',  label: 'Quản lý',    desc: 'Dashboard & báo cáo' },
  { role: 'staff',    label: 'Nhân viên',  desc: 'Kho & vận hành' },
]

export default function DemoAccountSelector({ selectedRole, onSelectRole }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-gray-400">
        Loại tài khoản demo
      </p>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map(acc => (
          <button
            key={acc.role}
            type="button"
            onClick={() => onSelectRole(acc.role)}
            className="flex flex-col items-start p-3 transition-all cursor-pointer text-left"
            style={{
              borderRadius: '8px',
              border: selectedRole === acc.role ? '1.5px solid var(--accent)' : '1.5px solid var(--cb)',
              backgroundColor: selectedRole === acc.role ? 'var(--accent-dim)' : 'var(--page)',
            }}
          >
            <span
              className="text-[12px] font-bold mb-0.5"
              style={{ color: selectedRole === acc.role ? 'var(--accent)' : 'var(--ct1)' }}
            >
              {acc.label}
            </span>
            <span className="text-[10px] text-gray-400">{acc.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
