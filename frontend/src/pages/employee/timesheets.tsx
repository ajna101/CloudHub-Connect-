import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getTimesheets, submitTimesheet, deleteTimesheet } from '../../services/api';
import { Clock, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

const CATEGORIES = ['development', 'research', 'admin', 'meeting', 'support'];

export default function EmployeeTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    project_name: '', task_description: '', hours_worked: 8, category: 'development'
  });

  const fetch = async () => {
    try { const r = await getTimesheets(); setTimesheets(r.data); } catch {}
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitTimesheet(form);
      toast.success('Timesheet submitted');
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], project_name: '', task_description: '', hours_worked: 8, category: 'development' });
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this timesheet?')) return;
    try { await deleteTimesheet(id); toast.success('Deleted'); fetch(); } catch { toast.error('Cannot delete'); }
  };

  return (
    <>
      <Head><title>Timesheets — CloudHub HR</title></Head>
      <Layout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">My Timesheets</h1>
            <p className="text-slate-500 text-sm">{timesheets.length} entries</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> Log Time
          </button>
        </div>

        {showForm && (
          <div className="card mb-6 max-w-xl relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <h3 className="font-semibold text-slate-700 mb-4">Log Timesheet Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="input" required />
                </div>
                <div>
                  <label className="label">Hours Worked *</label>
                  <input type="number" min="0.5" max="24" step="0.5" value={form.hours_worked}
                    onChange={e => setForm(p => ({...p, hours_worked: parseFloat(e.target.value)}))} className="input" required />
                </div>
              </div>
              <div>
                <label className="label">Project Name *</label>
                <input value={form.project_name} onChange={e => setForm(p => ({...p, project_name: e.target.value}))} className="input" required />
              </div>
              <div>
                <label className="label">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Task Description *</label>
                <textarea
                  value={form.task_description}
                  onChange={e => setForm(p => ({...p, task_description: e.target.value}))}
                  className="input"
                  rows={3}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Clock size={15} /> Submit</>}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Date', 'Project', 'Task', 'Category', 'Hours', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timesheets.map(ts => (
                  <tr key={ts.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-600">{new Date(ts.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-2 font-medium text-slate-800">{ts.project_name}</td>
                    <td className="py-3 px-2 text-slate-500 max-w-[200px] truncate">{ts.task_description}</td>
                    <td className="py-3 px-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{ts.category}</span>
                    </td>
                    <td className="py-3 px-2 font-semibold">{ts.hours_worked}h</td>
                    <td className="py-3 px-2"><span className={`badge-${ts.status}`}>{ts.status}</span></td>
                    <td className="py-3 px-2">
                      {ts.status === 'submitted' && (
                        <button onClick={() => handleDelete(ts.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {timesheets.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-10">No timesheet entries yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  );
}
