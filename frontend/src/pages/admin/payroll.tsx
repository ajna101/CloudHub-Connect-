import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getEmployees, getSalaryComponents, setSalaryComponents, generatePayroll, getSalaryRecords, downloadSlip } from '../../services/api';
import { DollarSign, Plus, Download, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function AdminPayrollPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [components, setComponents] = useState<any>(null);
  const [tab, setTab] = useState<'generate' | 'components' | 'records'>('records');
  const [loading, setLoading] = useState(false);

  const [compForm, setCompForm] = useState({
    basic: '', hra: '', allowances: '', bonus: '', pf: '1800', professional_tax: '200', income_tax: '0', effective_from: ''
  });
  const [genForm, setGenForm] = useState({
    employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    worked_days: 26, total_days: 26, lop_days: 0
  });

  useEffect(() => {
    getEmployees().then(r => setEmployees(r.data)).catch(() => {});
    getSalaryRecords().then(r => setRecords(r.data)).catch(() => {});
  }, []);

  const loadComponents = async (empId: string) => {
    if (!empId) return;
    try {
      const res = await getSalaryComponents(parseInt(empId));
      if (res.data) {
        setComponents(res.data);
        setCompForm({
          basic: res.data.basic, hra: res.data.hra, allowances: res.data.allowances,
          bonus: res.data.bonus, pf: res.data.pf, professional_tax: res.data.professional_tax,
          income_tax: res.data.income_tax, effective_from: res.data.effective_from
        });
      }
    } catch { setComponents(null); }
  };

  const handleSaveComponents = async () => {
    if (!selectedEmp) return toast.error('Select an employee');
    setLoading(true);
    try {
      await setSalaryComponents({
        employee_id: parseInt(selectedEmp),
        ...Object.fromEntries(Object.entries(compForm).map(([k, v]) => [k, k === 'effective_from' ? v : parseFloat(v as string) || 0]))
      });
      toast.success('Salary components saved');
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!genForm.employee_id) return toast.error('Select employee');
    setLoading(true);
    try {
      await generatePayroll({ ...genForm, employee_id: parseInt(genForm.employee_id) });
      toast.success('Salary slip generated');
      getSalaryRecords().then(r => setRecords(r.data));
      setTab('records');
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDownload = async (id: number, empId: string, month: number, year: number) => {
    try {
      const res = await downloadSlip(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalarySlip_${empId}_${month}_${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <>
      <Head><title>Payroll — CloudHub HR</title></Head>
      <Layout>
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-800">Payroll Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage salary components and generate payslips</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'records', label: 'Salary Records' },
            { key: 'generate', label: 'Generate Payroll' },
            { key: 'components', label: 'Salary Components' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-[#1a3a5c] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'records' && (
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Employee', 'Period', 'Gross', 'Deductions', 'Net Pay', 'Download'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const emp = employees.find(e => e.id === r.employee_id);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium">{emp?.full_name || `Employee #${r.employee_id}`}</td>
                      <td className="py-3 px-2 text-slate-600">{MONTHS[r.month - 1]} {r.year}</td>
                      <td className="py-3 px-2 text-slate-700">₹{r.gross_salary.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2 text-red-600">₹{r.total_deductions.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2 font-bold text-green-700">₹{r.net_salary.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2">
                        <button onClick={() => handleDownload(r.id, emp?.employee_id, r.month, r.year)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                          <Download size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-10">No salary records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'generate' && (
          <div className="card max-w-xl">
            <h3 className="font-semibold text-slate-700 mb-4">Generate Salary Slip</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Employee</label>
                <select value={genForm.employee_id} onChange={e => setGenForm(p => ({...p, employee_id: e.target.value}))} className="input">
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Month</label>
                  <select value={genForm.month} onChange={e => setGenForm(p => ({...p, month: parseInt(e.target.value)}))} className="input">
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input type="number" value={genForm.year} onChange={e => setGenForm(p => ({...p, year: parseInt(e.target.value)}))} className="input" />
                </div>
                <div>
                  <label className="label">Worked Days</label>
                  <input type="number" value={genForm.worked_days} onChange={e => setGenForm(p => ({...p, worked_days: parseInt(e.target.value)}))} className="input" />
                </div>
                <div>
                  <label className="label">Total Days</label>
                  <input type="number" value={genForm.total_days} onChange={e => setGenForm(p => ({...p, total_days: parseInt(e.target.value)}))} className="input" />
                </div>
                <div>
                  <label className="label">LOP Days</label>
                  <input type="number" value={genForm.lop_days} onChange={e => setGenForm(p => ({...p, lop_days: parseInt(e.target.value)}))} className="input" />
                </div>
              </div>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={15} /> Generate Payslip</>}
              </button>
            </div>
          </div>
        )}

        {tab === 'components' && (
          <div className="card max-w-2xl">
            <h3 className="font-semibold text-slate-700 mb-4">Define Salary Components</h3>
            <div className="mb-4">
              <label className="label">Select Employee</label>
              <select value={selectedEmp} onChange={e => { setSelectedEmp(e.target.value); loadComponents(e.target.value); }} className="input">
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'basic', label: 'Basic Salary (₹)' },
                { key: 'hra', label: 'HRA (₹)' },
                { key: 'allowances', label: 'Allowances (₹)' },
                { key: 'bonus', label: 'Bonus (₹)' },
                { key: 'pf', label: 'PF Deduction (₹)' },
                { key: 'professional_tax', label: 'Professional Tax (₹)' },
                { key: 'income_tax', label: 'Income Tax TDS (₹)' },
                { key: 'effective_from', label: 'Effective From', type: 'date' },
              ].map(({ key, label, type = 'number' }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    type={type}
                    value={compForm[key as keyof typeof compForm]}
                    onChange={e => setCompForm(p => ({...p, [key]: e.target.value}))}
                    className="input"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveComponents} disabled={loading} className="btn-primary mt-4">
              <Settings size={15} /> Save Components
            </button>
          </div>
        )}
      </Layout>
    </>
  );
}
