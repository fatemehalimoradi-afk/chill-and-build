'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNav from '@/app/components/AppNav';

type User = {
  id: number; email: string; display_name: string; role: string;
  lunch: string | null;
  lunch_label: string | null;
};

function Countdown() {
  const target = new Date('2026-06-12T09:00:00+03:30').getTime();
  const [diff, setDiff] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return (
    <span className="font-mono font-bold" style={{ color: 'var(--pink)' }}>
      {String(d).padStart(2, '0')}d {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setUser)
      .catch(() => router.push('/login'));
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--purple) transparent var(--purple) var(--purple)' }} />
    </div>
  );

  const initials = user.display_name
    ? user.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--tx-hi)', minHeight: '100vh' }}>
      <AppNav userInitials={initials} userName={user.display_name || user.email} onLogout={logout} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: 'var(--purple)', color: '#fff' }}>
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.display_name || user.email}</h1>
              <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--tx-mid)' }}>
            BUILD STARTS IN <Countdown />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
            <h2 className="font-semibold mb-4">Your registration</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--tx-lo)' }}>Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--tx-lo)' }}>Team</span>
                <span>{user.role}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
            <h2 className="font-semibold mb-4">Lunch</h2>
            <div className="space-y-3 text-sm">
              {user.lunch ? (
                <div className="flex justify-between items-start gap-4">
                  <span style={{ color: 'var(--tx-lo)' }}>Your choice</span>
                  <div className="text-right">
                    <span className="font-medium">{user.lunch_label ?? user.lunch}</span>
                    <span className="block text-xs mt-1 px-2 py-0.5 rounded-full ml-auto w-fit"
                      style={{ background: 'rgba(54,211,154,0.1)', color: 'var(--ok)' }}>
                      Saved
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--tx-mid)' }}>You haven&apos;t chosen lunch yet.</p>
              )}
              <Link href="/t-shirt-lunch" className="inline-block text-sm" style={{ color: 'var(--pink)' }}>
                {user.lunch ? 'Change lunch →' : 'Choose lunch →'}
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl md:col-span-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
            <h2 className="font-semibold mb-4">Day schedule</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                { time: '8:45', event: 'Arrival & Breakfast' },
                { time: '9:00', event: 'Opening Remarks' },
                { time: '9:10', event: 'Tool Setup' },
                { time: '9:30', event: 'Guided Build Session' },
                { time: '12:00', event: 'Lunch & Chill' },
                { time: '13:00', event: 'Main Build Time' },
                { time: '17:30', event: 'Lightning Demos' },
                { time: '18:30', event: 'Awards + Celebration' },
              ].map(s => (
                <div key={s.time} className="flex gap-4">
                  <span className="w-12 shrink-0 font-mono" style={{ color: 'var(--pink)' }}>{s.time}</span>
                  <span style={{ color: 'var(--tx-mid)' }}>{s.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={logout} className="text-sm hover:text-white transition-colors" style={{ color: 'var(--tx-lo)' }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
