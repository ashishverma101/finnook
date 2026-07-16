import {
  LayoutDashboard,
  Wallet,
  BarChart2,
  TrendingUp,
  Target,
  Bot,
  LogOut,
  Settings,
} from 'lucide-react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Wallet },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/chat', label: 'AI Coach', icon: Bot },
  { path: '/profile', label: 'Profile', icon: Settings },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#DAE2B6] flex">
      {/* Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col">
        <div className="p-5 border-b border-[#6EACDA]/30 flex items-center gap-3">
          <img src="/finnook-logo.png" alt="Finnook" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-[#021526]">Finnook</h1>
            <p className="text-[#021526]/50 text-xs mt-0.5">{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-[#03346E] text-white'
                  : 'text-[#021526]/60 hover:bg-[#DAE2B6] hover:text-[#03346E]'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#6EACDA]/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#021526]/60 hover:bg-[#DAE2B6] hover:text-[#03346E] transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#DAE2B6]">
        <Outlet />
      </main>
    </div>
  )
}