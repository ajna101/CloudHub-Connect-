import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Clock, DollarSign, Calendar, FileText,
  LogOut, Menu, X, ChevronRight, Building2, Bell, Settings
} from 'lucide-react';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/onboarding', label: 'Onboarding', icon: Building2 },
  { href: '/admin/timesheets', label: 'Timesheets', icon: Clock },
  { href: '/admin/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/admin/holidays', label: 'Holidays', icon: Calendar },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
];

const employeeNav = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/timesheets', label: 'My Timesheets', icon: Clock },
  { href: '/employee/payslips', label: 'Pay Slips', icon: DollarSign },
  { href: '/employee/holidays', label: 'Holidays', icon: Calendar },
  { href: '/employee/documents', label: 'HR Documents', icon: FileText },
  { href: '/employee/profile', label: 'My Profile', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isManager } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = (isAdmin || isManager) ? adminNav : employeeNav;
  const portalName = (isAdmin || isManager) ? 'HR Admin' : 'Employee Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a3a5c] text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-[#0ea5e9] rounded-lg flex items-center justify-center font-bold text-white text-sm font-display">
            CH
          </div>
          <div>
            <p className="font-bold font-display text-sm">CloudHub</p>
            <p className="text-xs text-blue-300">{portalName}</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href || router.pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-900/30 transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
            </button>
            <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
              {user?.employeeId || user?.role}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
