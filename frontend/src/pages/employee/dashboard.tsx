import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../components/common/AuthContext';
import { getEmployeeDashboard } from '../../services/api';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && (user.role === 'admin' || user.role === 'manager')) router.push('/admin/dashboard');
  }, [user, loading]);

  useEffect(() => {
    if (user) getEmployeeDashboard().then(r => setData(r.data)).catch(() => {});
  }, [user]);

  if (!data) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <>
      <Head><title>Dashboard — CloudHub HR</title></Head>
      <Layout>
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0f2544] rounded-2xl p-6 mb-6 text-white">
          <p className="text-blue-300 text-sm mb-1">Welcome back 👋</p>
          <h1 className="font-display font-bold text-2xl mb-1">{data.employee?.full_name}</h1>
          <p className="text-blue-200 text-sm">{data.employee?.designation} · {data.employee?.department}</p>
          <div className="flex gap-4 mt-3 text-xs text-blue-300">
            <span>ID: <strong className="text-white font-mono">{data.employee?.employee_id}</strong></span>
            {data.employee?.date_of_joining && (
              <span>Joined: <strong className="text-white">{new Date(data.employee.date_of_joining).toLocaleDateString('en-IN')}</strong></span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hours This Month</p>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-slate-800">{data.this_month_hours}h</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Timesheets</p>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={15} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-slate-800">{data.pending_timesheets}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Holiday</p>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar size={15} className="text-green-600" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {data.upcoming_holidays?.[0]?.name || 'None upcoming'}
            </p>
            {data.upcoming_holidays?.[0] && (
              <p className="text-xs text-slate-400">
                {new Date(data.upcoming_holidays[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Salary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign size={16} className="text-[#1a3a5c]" /> Recent Pay Slips
              </h3>
              <Link href="/employee/payslips" className="text-xs text-[#1a3a5c] font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {data.recent_salary?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{MONTHS[s.month - 1]} {s.year}</span>
                  <span className="font-semibold text-green-700">₹{s.net_salary.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {(!data.recent_salary || data.recent_salary.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">No salary records</p>
              )}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Calendar size={16} className="text-[#1a3a5c]" /> Upcoming Holidays
              </h3>
              <Link href="/employee/holidays" className="text-xs text-[#1a3a5c] font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {data.upcoming_holidays?.map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {new Date(h.date).getDate()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{h.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              {(!data.upcoming_holidays || data.upcoming_holidays.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">No upcoming holidays</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/employee/timesheets', label: 'Submit Timesheet', icon: Clock, color: 'bg-blue-600' },
            { href: '/employee/payslips', label: 'Download Pay Slip', icon: DollarSign, color: 'bg-green-600' },
            { href: '/employee/holidays', label: 'View Holidays', icon: Calendar, color: 'bg-purple-600' },
            { href: '/employee/documents', label: 'HR Policies', icon: TrendingUp, color: 'bg-orange-600' },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#1a3a5c]/30 hover:shadow-sm transition-all text-center"
            >
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </Layout>
    </>
  );
}
