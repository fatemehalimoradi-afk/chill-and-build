'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--tx-hi)' };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--tx-hi)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg mb-10">
          <span style={{ color: 'var(--pink)' }}>Chill</span>
          <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </Link>

        {done ? (
          <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(54,211,154,0.06)', border: '1px solid rgba(54,211,154,0.2)' }}>
            <div className="text-3xl mb-3">✅</div>
            <h1 className="text-lg font-bold mb-2">Password updated!</h1>
            <p className="text-sm" style={{ color: 'var(--tx-mid)' }}>Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--tx-mid)' }}>Choose something strong — at least 8 characters.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  required placeholder="Repeat password"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
                {loading ? 'Saving…' : 'Update password'}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: 'var(--tx-lo)' }}>
              <Link href="/login" style={{ color: 'var(--pink)' }}>← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
