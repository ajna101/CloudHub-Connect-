import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getMyProfile, updateEmployee } from '../../services/api';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', bank_account: '', bank_name: '', ifsc: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyProfile().then(r => {
      setProfile(r.data);
      setForm({
        phone: r.data.phone || '',
        address: r.data.address || '',
        bank_account: r.data.bank_account || '',
        bank_name: r.data.bank_name || '',
        ifsc: r.data.ifsc || '',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateEmployee(profile.id, form);
      toast.success('Profile updated');
      setEditing(false);
      getMyProfile().then(r => setProfile(r.data));
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  if (!profile) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );

  return (
    <>
      <Head><title>My Profile — CloudHub HR</title></Head>
      <Layout>
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-800">My Profile</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="card text-center">
            <div className="w-20 h-20 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
              {profile.full_name.charAt(0)}
            </div>
            <h2 className="font-display font-bold text-lg text-slate-800">{profile.full_name}</h2>
            <p className="text-slate-500 text-sm">{profile.designation}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.department}</p>
            <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2">
              <p className="font-mono text-sm font-bold text-[#1a3a5c]">{profile.employee_id}</p>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-3">Employment Details</h3>
              <InfoRow label="Employee ID" value={profile.employee_id} />
              <InfoRow label="Employment Type" value={profile.employment_type} />
              <InfoRow label="Department" value={profile.department} />
              <InfoRow label="Designation" value={profile.designation} />
              <InfoRow label="Location" value={profile.location} />
              <InfoRow label="Date of Joining" value={profile.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString('en-IN') : null} />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700">Personal & Bank Details</h3>
                <button onClick={() => setEditing(!editing)} className="text-xs text-[#1a3a5c] font-semibold hover:underline">
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-3">
                  {[
                    { key: 'phone', label: 'Phone', type: 'text' },
                    { key: 'address', label: 'Address', type: 'text' },
                    { key: 'bank_name', label: 'Bank Name', type: 'text' },
                    { key: 'bank_account', label: 'Account Number', type: 'text' },
                    { key: 'ifsc', label: 'IFSC Code', type: 'text' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                        className="input"
                      />
                    </div>
                  ))}
                  <button onClick={handleSave} disabled={loading} className="btn-primary">
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <InfoRow label="Email" value={profile.email} />
                  <InfoRow label="Phone" value={profile.phone} />
                  <InfoRow label="Address" value={profile.address} />
                  <InfoRow label="Bank Name" value={profile.bank_name} />
                  <InfoRow label="Account Number" value={profile.bank_account} />
                  <InfoRow label="IFSC" value={profile.ifsc} />
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
