import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

/* ── Countdown ─────────────────────────────────────────────── */
function Countdown() {
  const [total, setTotal] = useState(12 * 3600 + 45 * 60 + 30)
  useEffect(() => {
    const t = setInterval(() => setTotal(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return (
    <div className="flex items-end gap-1.5">
      {[['Hours', h], ['Mins', m], ['Secs', s]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-gray-900 text-white font-bold text-xl w-11 h-10 flex items-center justify-center rounded tabular-nums">
            {String(val).padStart(2, '0')}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stars ─────────────────────────────────────────────────── */
function Stars() {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/* ── Flash Sale Card ────────────────────────────────────────── */
function FlashCard({ badge, stock = false, name, reviews, price, originalPrice, bg = 'bg-gray-100', icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-w-0">
      <div className={`relative ${bg} h-40 flex items-center justify-center`}>
        {badge && (
          <span className={`absolute top-2.5 left-2.5 text-xs font-bold px-2 py-0.5 rounded text-white ${stock ? 'bg-gray-700' : 'bg-red-500'}`}>
            {badge}
          </span>
        )}
        <div className="text-gray-300">{icon}</div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Stars />
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <p className="text-sm text-gray-800 font-medium leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">{name}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900">${price}</span>
            {originalPrice && <span className="text-sm text-gray-400 line-through">${originalPrice}</span>}
          </div>
          <button className="w-8 h-8 rounded-full border border-gray-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors text-gray-500 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── HomePage ───────────────────────────────────────────────── */
export default function HomePage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAV ───────────────────────────────────────────────── */}
      <StoreNavbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-[#edf0f8]">
        <div className="max-w-screen-2xl mx-auto px-12 py-20 flex items-center gap-16">
          {/* Left */}
          <div className="flex-1 py-4">
            <div className="inline-flex items-center border border-blue-200 text-blue-600 text-xs font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-6">
              New Release
            </div>
            <h1 className="text-[3.5rem] font-bold text-gray-900 leading-tight">Experience the Future.</h1>
            <h1 className="text-[3.5rem] font-bold text-blue-600 leading-tight mb-6">Pro Series Alpha.</h1>
            <p className="text-gray-500 text-base leading-8 mb-10 max-w-[460px]">
              Unleash unparalleled performance with our latest flagship. Features advanced AI processing, a pro-grade triple camera system, and all-day battery life in a sleek titanium frame.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('list')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-3 rounded-lg transition-colors shadow-sm"
              >
                Shop Now <span className="text-lg leading-none">→</span>
              </button>
              <button className="text-base font-medium text-gray-700 border border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg transition-colors bg-white">
                Learn More
              </button>
            </div>
          </div>

          {/* Right: Phone */}
          <div className="shrink-0 w-[400px] h-[580px] flex items-center justify-center relative">
            {/* Aurora glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-orange-300 via-pink-200 to-purple-300 blur-3xl opacity-60" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center translate-x-10 translate-y-10 pointer-events-none">
              <div className="w-60 h-60 rounded-full bg-blue-300 blur-3xl opacity-35" />
            </div>
            {/* Phone body */}
            <div className="relative z-10">
              <div className="relative w-[220px] h-[440px] bg-gray-950 rounded-[3.2rem] shadow-[0_40px_90px_rgba(0,0,0,0.55)] ring-1 ring-gray-700">
                {/* Screen */}
                <div className="absolute inset-[3px] rounded-[2.9rem] overflow-hidden bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-gray-900" />
                  {/* Color streaks */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-8 top-[28%] w-[170%] h-[22px] bg-gradient-to-r from-orange-500/85 via-orange-400/40 to-transparent rotate-[18deg]" />
                    <div className="absolute -left-8 top-[31%] w-[170%] h-[9px] bg-gradient-to-r from-yellow-400/50 to-transparent rotate-[18deg]" />
                    <div className="absolute -left-8 top-[42%] w-[170%] h-[16px] bg-gradient-to-r from-blue-500/75 via-blue-400/35 to-transparent rotate-[18deg]" />
                    <div className="absolute -left-8 top-[53%] w-[170%] h-[18px] bg-gradient-to-r from-green-500/65 via-teal-400/30 to-transparent rotate-[18deg]" />
                  </div>
                </div>
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[5rem] h-[1.5rem] bg-gray-950 rounded-full z-20" />
                {/* Power button */}
                <div className="absolute right-0 top-28 w-[3px] h-16 bg-gray-700 rounded-full translate-x-[1px]" />
                {/* Volume buttons */}
                <div className="absolute left-0 top-24 w-[3px] h-9 bg-gray-700 rounded-full -translate-x-[1px]" />
                <div className="absolute left-0 top-36 w-[3px] h-9 bg-gray-700 rounded-full -translate-x-[1px]" />
              </div>
              {/* Shadow/reflection */}
              <div className="h-8 mx-10 bg-gradient-to-b from-gray-900/25 to-transparent blur-md rounded-b-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY BRAND ─────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Brand</h2>
            <p className="text-sm text-gray-400 mt-2">Khám phá điện thoại từ các thương hiệu hàng đầu thế giới</p>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {/* Apple */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">Apple</p>
                  <p className="text-xs text-gray-500 mt-0.5">iPhone Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* Samsung */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1428A0] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl font-black tracking-tighter">S</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">Samsung</p>
                  <p className="text-xs text-gray-500 mt-0.5">Galaxy Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-blue-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* Xiaomi */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6900] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl font-black">MI</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">Xiaomi</p>
                  <p className="text-xs text-gray-500 mt-0.5">Redmi · Mi Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-orange-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* OPPO */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1D5C4A] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm font-black tracking-wide">OPPO</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">OPPO</p>
                  <p className="text-xs text-gray-500 mt-0.5">Reno · Find Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-teal-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* vivo */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#415FFF] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-lg font-black italic">vivo</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">vivo</p>
                  <p className="text-xs text-gray-500 mt-0.5">V · Y · X Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-indigo-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* realme */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#F5A623] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xs font-black tracking-wide">real<br/>me</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">realme</p>
                  <p className="text-xs text-gray-500 mt-0.5">C · Note · GT Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-yellow-600 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* OnePlus */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EB0029] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl font-black">1+</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">OnePlus</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nord · Pro Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-red-500 font-medium">Xem thêm →</span>
              </div>
            </div>

            {/* Nokia */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-44 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#005AFF] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm font-black tracking-wide">NOK</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">Nokia</p>
                  <p className="text-xs text-gray-500 mt-0.5">G · X · C Series</p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-sky-500 font-medium">Xem thêm →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLASH SALES ───────────────────────────────────────── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Limited Time Offers</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Flash Sales</h2>
            </div>
            <Countdown />
          </div>

          <div className="flex gap-4">
            <FlashCard
              badge="-20%"
              name="Sony WH-1000XM5 Wireless Noise Cancelling Headphones"
              reviews={128}
              price="298.00"
              originalPrice="348.00"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19H7a2 2 0 01-2-2v-4a2 2 0 012-2h2m6 0h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0h6M12 3a7 7 0 00-7 7v1m14-1V10a7 7 0 00-7-7" />
                </svg>
              }
            />
            <FlashCard
              badge="-15%"
              name="AirPods Pro (2nd Generation)"
              reviews={452}
              price="199.00"
              originalPrice="240.00"
              bg="bg-gray-50 border border-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              }
            />
            <FlashCard
              name="Logitech MX Master 3S & Keys Combo"
              reviews={89}
              price="169.00"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              }
            />
            <FlashCard
              badge="Low Stock"
              stock
              name="Echo Studio High-Fidelity Smart Speaker"
              reviews={210}
              price="149.99"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15.536 8.464a5 5 0 010 7.072M12 10a2 2 0 110 4 2 2 0 010-4zm6.364-3.536a9 9 0 010 12.728M2.1 4.929A15 15 0 0021.9 4.93" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="border-y border-gray-100 py-10 bg-white">
        <div className="max-w-screen-2xl mx-auto px-8 grid grid-cols-4 divide-x divide-gray-100">
          {[
            {
              title: 'Free Shipping',
              sub: 'On all orders over $50',
              icon: (
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              ),
            },
            {
              title: '24/7 Support',
              sub: 'Dedicated technical help',
              icon: (
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
            },
            {
              title: 'Genuine Products',
              sub: '100% authentic brands',
              icon: (
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              title: 'Easy Returns',
              sub: '30-day money-back guarantee',
              icon: (
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              ),
            },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center text-center py-4 px-6 gap-3">
              <div className="text-gray-400">{f.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the Loop</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center">
        <p className="text-sm text-gray-400">© 2024 TechStore Professional. All rights reserved.</p>
      </footer>

    </div>
  )
}
