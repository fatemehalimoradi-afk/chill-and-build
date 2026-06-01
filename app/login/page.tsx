'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--tx-hi)' };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 shrink-0 p-10" style={{ borderRight: '1px solid var(--line)' }}>
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <span style={{ color: 'var(--pink)' }}>Chill</span>
          <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </Link>
        <div>
          <p className="text-2xl font-bold leading-snug mb-4">One day.<br />One working AI solution.</p>
          <p style={{ color: 'var(--tx-mid)' }}>Join Ruberah builders on June 12. Coffee, lunch and GPU credits on us.</p>
          <div className="mt-6 flex -space-x-2">
            {['AB', 'CD', 'EF', 'GH'].map(i => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{ borderColor: 'var(--bg)', background: 'var(--purple)', color: '#fff' }}>{i}</div>
            ))}
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--tx-lo)' }}>Sara, Ali, Nima &amp; 139 others are in.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-1 font-bold text-lg">
              <span style={{ color: 'var(--pink)' }}>Chill</span>
              <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
              <span style={{ color: 'var(--purple)' }}>Build</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back, builder</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--tx-mid)' }}>Log in to manage your team &amp; event-day logistics.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@ruberah.com" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm" style={{ color: 'var(--tx-mid)' }}>Password</label>
                <Link href="/forgot-password" className="text-sm" style={{ color: 'var(--purple)' }}>Forgot?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" className={inputCls} style={inputStyle} />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--tx-lo)' }}>
            New here?{' '}
            <Link href="/register" style={{ color: 'var(--pink)' }}>Register for Chill &amp; Build →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
