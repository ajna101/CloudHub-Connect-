import { useState } from 'react';
import Layout from '../../components/common/Layout';
import { createEmployee } from '../../services/api';
import { UserPlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support'];
const EMP_TYPES = [
  { value: 'permanent', label: 'Permanent Employee' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'consultant', label: 'Consultant' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', pan: '', aadhaar: '',
    bank_account: '', bank_name: '', ifsc: '', pf_number: '', uan: '',
    date_of_joining: '', department: '', designation: '', location: 'Hyderabad',
    employment_type: 'permanent', password: 'Welcome@123', manager_id: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (payload.manager_id) payload.manager_id = parseInt(payload.manager_id);
      else delete payload.manager_id;
      if (!payload.date_of_joining) delete payload.date_of_joining;
      
      await createEmployee(payload);
      toast.success('Employee onboarded successfully!');
      router.push('/admin/employees');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }: any) => (
    <div className="card mb-4">
      <h3 className="font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, name, type = 'text', required = false, options, placeholder }: any) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {options ? (
        <select value={form[name as keyof typeof form]} onChange={set(name)} className="input" required={required}>
          <option value="">Select {label}</option>
          {options.map((o: any) => (
            <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={form[name as keyof typeof form]}
          onChange={set(name)}
          placeholder={placeholder || label}
          className="input"
          required={required}
        />
      )}
    </div>
  );

  return (
    <>
      <Head><title>Onboarding — CloudHub HR</title></Head>
      <Layout>
        <div className="flex items-center gap-3 mb-6">
          <UserPlus size={22} className="text-[#1a3a5c]" />
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Employee Onboarding</h1>
            <p className="text-slate-500 text-sm">Add a new employee to CloudHub</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Section title="Personal Information">
            <Field label="Full Name" name="full_name" required />
            <Field label="Email Address" name="email" type="email" required />
            <Field label="Phone Number" name="phone" placeholder="+91-XXXXXXXXXX" />
            <Field label="Employment Type" name="employment_type" options={EMP_TYPES} required />
            <Field label="Date of Joining" name="date_of_joining" type="date" />
            <Field label="Login Password" name="password" type="text" required />
          </Section>

          <Section title="Work Details">
            <Field label="Department" name="department" options={DEPARTMENTS} />
            <Field label="Designation" name="designation" placeholder="e.g. Software Engineer" />
            <Field label="Location" name="location" placeholder="e.g. Hyderabad" />
            <div className="md:col-span-2 lg:col-span-3">
              <label className="label">Address</label>
              <textarea
                value={form.address}
                onChange={set('address')}
                className="input"
                rows={2}
                placeholder="Full address"
              />
            </div>
          </Section>

          <Section title="Identification">
            <Field label="PAN Number" name="pan" placeholder="ABCDE1234F" />
            <Field label="Aadhaar Number" name="aadhaar" placeholder="XXXX XXXX XXXX" />
          </Section>

          <Section title="Bank & PF Details">
            <Field label="Bank Name" name="bank_name" placeholder="e.g. HDFC Bank" />
            <Field label="Account Number" name="bank_account" />
            <Field label="IFSC Code" name="ifsc" placeholder="HDFC0001234" />
            <Field label="PF Number" name="pf_number" placeholder="AP/HYD/12345/001" />
            <Field label="UAN Number" name="uan" placeholder="100123456789" />
          </Section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.push('/admin/employees')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <><Save size={16} /> Create Employee</>
              )}
            </button>
          </div>
        </form>
      </Layout>
    </>
  );
}
