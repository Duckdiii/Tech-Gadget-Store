// Suspense fallback shown in the content area while a lazy-loaded route chunk downloads —
// see CustomerLayout/ManagerLayout/StaffLayout, which wrap <Outlet /> with <Suspense>.
export default function RouteFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }} />
    </div>
  )
}
