'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--tx-hi)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg mb-10">
          <span style={{ color: 'var(--pink)' }}>Chill</span>
          <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </Link>

        {sent ? (
          <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(54,211,154,0.06)', border: '1px solid rgba(54,211,154,0.2)' }}>
            <div className="text-3xl mb-3">📬</div>
            <h1 className="text-lg font-bold mb-2">Check your inbox</h1>
            <p className="text-sm" style={{ color: 'var(--tx-mid)' }}>
              If <strong style={{ color: 'var(--tx-hi)' }}>{email}</strong> is registered, you'll get a reset link in the next minute. Check your spam folder too.
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--tx-lo)' }}>The link expires in 1 hour.</p>
            <Link href="/login" className="inline-block mt-6 text-sm" style={{ color: 'var(--purple)' }}>← Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Forgot your password?</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--tx-mid)' }}>
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@fastbundle.co"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--tx-hi)' }}
                />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: 'var(--tx-lo)' }}>
              Remember it?{' '}
              <Link href="/login" style={{ color: 'var(--pink)' }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
