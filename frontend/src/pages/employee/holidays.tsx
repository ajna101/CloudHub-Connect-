import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getHolidays } from '../../services/api';
import { Calendar } from 'lucide-react';
import Head from 'next/head';

export default function EmployeeHolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    getHolidays({ year: new Date().getFullYear() }).then(r => setHolidays(r.data)).catch(() => {});
  }, []);

  const grouped = holidays.reduce((acc: any, h: any) => {
    const month = new Date(h.date).toLocaleDateString('en-IN', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  const today = new Date();

  return (
    <>
      <Head><title>Holidays — CloudHub HR</title></Head>
      <Layout>
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-800">Holiday Calendar {new Date().getFullYear()}</h1>
          <p className="text-slate-500 text-sm">{holidays.length} holidays this year</p>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped).map(([month, hs]: [string, any]) => (
            <div key={month} className="card">
              <h3 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wide">{month}</h3>
              <div className="space-y-2">
                {hs.map((h: any) => {
                  const hDate = new Date(h.date);
                  const isPast = hDate < today;
                  const isToday = hDate.toDateString() === today.toDateString();
                  return (
                    <div key={h.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-lg ${
                      isToday ? 'bg-[#1a3a5c] text-white' : isPast ? 'bg-slate-50 opacity-60' : 'bg-blue-50/50'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isToday ? 'bg-white text-[#1a3a5c]' : 'bg-[#1a3a5c] text-white'
                      }`}>
                        <span>{hDate.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isToday ? 'text-white' : 'text-slate-800'}`}>{h.name}</p>
                        <p className={`text-xs ${isToday ? 'text-blue-200' : 'text-slate-500'}`}>
                          {hDate.toLocaleDateString('en-IN', { weekday: 'long' })}
                          {h.is_optional && <span className="ml-2 text-amber-400">(Optional)</span>}
                        </p>
                      </div>
                      {isToday && <span className="text-xs bg-white text-[#1a3a5c] px-2 py-0.5 rounded font-semibold">Today!</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {holidays.length === 0 && (
            <div className="card text-center py-16">
              <Calendar size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400">No holidays defined</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
