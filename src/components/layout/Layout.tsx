import { Outlet, useLocation } from 'react-router-dom'

// Routes that should NOT show navbar/sidebar (auth pages)
const AUTH_ROUTES = ['/login', '/register']

export default function Layout() {
  const location = useLocation()

  // Check if current route is an auth page
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)

  // For auth pages, just render the outlet without layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    )
  }

  // For authenticated pages, Layout just renders the child route.
  // Dashboard handles its own Navbar, Sidebar, and ProtectedRoute wrapper.
  return <Outlet />
}