import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { api } from '../api/client';
import { isAdmin } from '../auth/jwt';

export default function AdminPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="font-bold text-slate-900">Driving School Management</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <RulesSection />
      </main>
    </div>
  );
}

/* ====================== Training Rules ====================== */
function RulesSection() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/rules');
      setRules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? 'Nemate dozvolu za pregled pravila.'
          : err?.response?.data?.message || 'Greška pri učitavanju pravila.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <SectionHeader
        icon={<BookOpen className="text-blue-500" size={22} />}
        title="B Category Training Rules"
        subtitle="Define the minimum requirements and pricing for B category training"
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            <Plus size={16} /> New Rule
          </button>
        }
      />

      {loading && <Empty text="Učitavam pravila…" />}
      {!loading && error && <ErrorBox message={error} />}
      {!loading && !error && rules.length === 0 && (
        <Empty
          icon={<BookOpen className="text-slate-400" size={24} />}
          title="No rules defined yet"
          subtitle="Create the first B category training rule"
        />
      )}

      {!loading && !error && rules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {rules.map((r) => <RuleCard key={r.ruleId} rule={r} />)}
        </div>
      )}

      {showAdd && (
        <AddRuleModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}
    </Card>
  );
}

function RuleCard({ rule }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase">Rule #{rule.ruleId}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">B Category</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Theory" value={`${rule.minTheoryLessons} lessons`} />
        <Stat label="Practical" value={`${rule.minPracticalLessons} lessons`} />
        <Stat label="Duration" value={`${rule.lessonDuration} min`} />
        <Stat label="Price" value={`${rule.coursePrice} BAM`} highlight />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function AddRuleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    minTheoryLessons: 30,
    minPracticalLessons: 35,
    lessonDuration: 45,
    coursePrice: 1500,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/rules', form);
      onCreated();
    } catch (err) {
      const body = err?.response?.data;
      let msg = 'Greška pri kreiranju pravila.';
      if (typeof body === 'string') msg = body;
      else if (body?.message) msg = body.message;
      else if (body && typeof body === 'object') msg = Object.values(body).join(' ');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Training Rule" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minimum Theoretical Lessons" type="number" min={5}
            value={form.minTheoryLessons} onChange={update('minTheoryLessons')} />
          <Field label="Minimum Practical Lessons" type="number" min={10}
            value={form.minPracticalLessons} onChange={update('minPracticalLessons')} />
          <Field label="Lesson Duration (minutes)" type="number" min={30}
            value={form.lessonDuration} onChange={update('lessonDuration')} />
          <Field label="Course Price (BAM)" type="number" min={1} step="0.01"
            value={form.coursePrice} onChange={update('coursePrice')} />
        </div>
        {error && <ErrorBox message={error} />}
        <FormActions onClose={onClose} submitting={submitting}
          submitLabel="Save Rule" submitIcon={<Save size={16} />} />
      </form>
    </Modal>
  );
}

/* ====================== Shared UI ====================== */
function Card({ children }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">{children}</div>;
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-1">
      <div>
        <div className="flex items-center gap-2 mb-1">{icon}<h2 className="text-xl font-bold text-slate-900">{title}</h2></div>
        <p className="text-slate-500 text-sm">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Empty({ icon, title, subtitle, text }) {
  if (text) return <div className="py-10 text-center text-slate-500 text-sm">{text}</div>;
  return (
    <div className="py-10 text-center">
      {icon && <div className="inline-flex w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">{icon}</div>}
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function ErrorBox({ message }) {
  return <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100 mt-4">{message}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>
      <input {...inputProps}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
    </div>
  );
}

function FormActions({ onClose, submitting, submitLabel, submitIcon }) {
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onClose}
        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
        Cancel
      </button>
      <button type="submit" disabled={submitting}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-semibold">
        {submitIcon}
        {submitting ? 'Spašavam…' : submitLabel}
      </button>
    </div>
  );
}