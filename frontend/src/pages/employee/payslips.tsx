import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getSalaryRecords, downloadSlip } from '../../services/api';
import { DollarSign, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function EmployeePayslipsPage() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    getSalaryRecords().then(r => setRecords(r.data)).catch(() => {});
  }, []);

  const handleDownload = async (id: number, month: number, year: number) => {
    try {
      const res = await downloadSlip(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `PaySlip_${MONTHS[month-1]}_${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloading...');
    } catch { toast.error('Download failed'); }
  };

  return (
    <>
      <Head><title>Pay Slips — CloudHub HR</title></Head>
      <Layout>
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-800">My Pay Slips</h1>
          <p className="text-slate-500 text-sm">{records.length} salary records</p>
        </div>

        {records.length === 0 ? (
          <div className="card text-center py-16">
            <DollarSign size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No salary slips available yet</p>
            <p className="text-slate-400 text-sm mt-1">Your HR team will generate them at the end of the month</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map(r => (
              <div key={r.id} className="card hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display font-bold text-lg text-slate-800">{MONTHS[r.month-1]} {r.year}</p>
                    <p className="text-xs text-slate-400">{r.worked_days} / {r.total_days} days worked</p>
                  </div>
                  <button
                    onClick={() => handleDownload(r.id, r.month, r.year)}
                    className="w-10 h-10 bg-[#1a3a5c] rounded-lg flex items-center justify-center text-white hover:bg-[#162f4a] transition-all"
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Gross Earnings</span>
                    <span className="font-medium">₹{r.gross_salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Deductions</span>
                    <span className="font-medium text-red-600">- ₹{r.total_deductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100">
                    <span className="text-slate-700">Net Pay</span>
                    <span className="text-green-700 text-base">₹{r.net_salary.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
