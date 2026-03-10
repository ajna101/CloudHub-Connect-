import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getTimesheets, approveTimesheet } from '../../services/api';
import { Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function AdminTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [comment, setComment] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await getTimesheets({ status: statusFilter || undefined });
      setTimesheets(res.data);
    } catch { toast.error('Failed to load timesheets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTimesheets(); }, [statusFilter]);

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await approveTimesheet(id, { status, hr_comment: comment });
      toast.success(`Timesheet ${status}`);
      setActionId(null);
      setComment('');
      fetchTimesheets();
    } catch { toast.error('Action failed'); }
  };

  return (
    <>
      <Head><title>Timesheets — CloudHub HR</title></Head>
      <Layout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Timesheet Management</h1>
            <p className="text-slate-500 text-sm">{timesheets.length} timesheets</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-auto text-sm">
              <option value="">All Status</option>
              <option value="submitted">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Date', 'Project', 'Task', 'Category', 'Hours', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map(ts => (
                    <>
                      <tr key={ts.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 text-slate-600">{new Date(ts.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-2 font-medium text-slate-800">{ts.project_name}</td>
                        <td className="py-3 px-2 text-slate-600 max-w-[200px] truncate">{ts.task_description}</td>
                        <td className="py-3 px-2">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{ts.category}</span>
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-700">{ts.hours_worked}h</td>
                        <td className="py-3 px-2"><span className={`badge-${ts.status}`}>{ts.status}</span></td>
                        <td className="py-3 px-2">
                          {ts.status === 'submitted' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setActionId(actionId === ts.id ? null : ts.id)}
                                className="p-1.5 rounded hover:bg-green-50 text-green-600"
                                title="Approve/Reject"
                              >
                                <CheckCircle size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {actionId === ts.id && (
                        <tr key={`action-${ts.id}`} className="bg-blue-50">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <input
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Optional comment..."
                                className="input flex-1 text-sm"
                              />
                              <button onClick={() => handleAction(ts.id, 'approved')} className="btn-primary text-xs py-1.5">
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button onClick={() => handleAction(ts.id, 'rejected')} className="btn-danger text-xs py-1.5">
                                <XCircle size={13} /> Reject
                              </button>
                              <button onClick={() => setActionId(null)} className="btn-secondary text-xs py-1.5">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {timesheets.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-slate-400 py-10">No timesheets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
