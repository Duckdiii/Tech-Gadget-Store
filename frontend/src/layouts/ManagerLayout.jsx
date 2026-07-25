import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import TechStoreAdminSidebar from '../components/TechStoreAdminSidebar'
import RouteFallback from '../components/RouteFallback'
import { ROLE_PAGES } from '../config/constants'

export default function ManagerLayout() {
  const allowedPages = ROLE_PAGES.manager

  return (
    <div className="flex min-h-dvh bg-gray-50">
      <TechStoreAdminSidebar allowedPages={allowedPages} />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
