import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getDocuments, downloadDocument } from '../../services/api';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

const CATEGORY_COLORS: Record<string, string> = {
  'HR Policy': 'bg-blue-50 text-blue-600',
  'Employee Handbook': 'bg-purple-50 text-purple-600',
  'Leave Policy': 'bg-green-50 text-green-600',
  'Code of Conduct': 'bg-orange-50 text-orange-600',
  'Other': 'bg-slate-50 text-slate-600',
};

export default function EmployeeDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    getDocuments().then(r => setDocuments(r.data)).catch(() => {});
  }, []);

  const handleDownload = async (id: number, filename: string) => {
    try {
      const res = await downloadDocument(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  return (
    <>
      <Head><title>HR Documents — CloudHub HR</title></Head>
      <Layout>
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-800">HR Documents</h1>
          <p className="text-slate-500 text-sm">Company policies and employee resources</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="card hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleDownload(doc.id, doc.filename)}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a3a5c] transition-all">
                  <FileText size={20} className="text-[#1a3a5c] group-hover:text-white transition-all" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm mb-1">{doc.title}</p>
                  {doc.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{doc.description}</p>}
                  {doc.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[doc.category] || 'bg-slate-50 text-slate-600'}`}>
                      {doc.category}
                    </span>
                  )}
                </div>
                <Download size={15} className="text-slate-300 group-hover:text-[#1a3a5c] transition-all flex-shrink-0 mt-1" />
              </div>
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-3 card text-center py-16">
              <FileText size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400">No documents available yet</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
