'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNav from '@/app/components/AppNav';
import LunchPicker from '@/app/components/LunchPicker';

type User = {
  id: number; email: string; display_name: string; role: string;
  lunch: string | null;
  lunch_label: string | null;
};

export default function LunchPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lunch, setLunch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(u => {
        setUser(u);
        setLunch(u.lunch ?? '');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function handleSave() {
    if (!lunch) {
      setError('Please select your lunch option.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/auth/lunch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lunch }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      setSaved(true);
      setUser(u => u ? { ...u, lunch, lunch_label: json.lunch_label ?? u.lunch_label } : u);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--purple) transparent var(--purple) var(--purple)' }} />
    </div>
  );

  const initials = user.display_name
    ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--tx-hi)', minHeight: '100vh' }}>
      <AppNav userInitials={initials} userName={user.display_name || user.email} onLogout={logout} />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm mb-6 inline-block" style={{ color: 'var(--purple)' }}>
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-2">Lunch selection</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--tx-mid)' }}>
          {user.lunch
            ? <>Current choice: <strong style={{ color: 'var(--tx-hi)' }}>{user.lunch_label ?? user.lunch}</strong></>
            : 'Choose your lunch for event day.'}
        </p>

        <LunchPicker value={lunch} onChange={id => { setLunch(id); setSaved(false); setError(''); }} />

        {error && (
          <p className="text-sm px-3 py-2 rounded-lg mt-4"
            style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
            {error}
          </p>
        )}

        {saved && (
          <p className="text-sm px-3 py-2 rounded-lg mt-4"
            style={{ background: 'rgba(54,211,154,0.1)', color: 'var(--ok)', border: '1px solid rgba(54,211,154,0.2)' }}>
            Lunch choice saved.
          </p>
        )}

        <button onClick={handleSave} disabled={saving} type="button"
          className="w-full mt-6 py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
          {saving ? 'Saving…' : 'Save lunch choice'}
        </button>
      </div>
    </div>
  );
}
