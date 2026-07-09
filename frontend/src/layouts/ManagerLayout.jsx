import React from 'react'
import { Outlet } from 'react-router-dom'
import TechStoreAdminSidebar from '../components/TechStoreAdminSidebar'
import { ROLE_PAGES } from '../context/AuthContext'

export default function ManagerLayout() {
  const allowedPages = ROLE_PAGES.manager

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TechStoreAdminSidebar allowedPages={allowedPages} />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
