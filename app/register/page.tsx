'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TEAMS = ['Support', 'Tech Support', 'Upsell', 'Insights', 'Management', 'HR', 'Product'];
const TSHIRT_SIZES = ['S', 'L', 'XL', '2XL'];
const STEPS = ['Account', 'Profile', 'Logistics'];

type FormData = {
  email: string; password: string; confirmPassword: string;
  displayName: string; role: string;
  tshirt: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData>({
    email: '', password: '', confirmPassword: '',
    displayName: '', role: '',
    tshirt: '',
  });

  function set(field: keyof FormData, value: string) {
    setData(d => ({ ...d, [field]: value }));
    setError('');
  }

  function validateStep() {
    if (step === 0) {
      if (!data.email || !data.password || !data.confirmPassword) return 'All fields are required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Enter a valid email address.';
      const domain = data.email.split('@')[1]?.toLowerCase();
      if (!['fastbundle.co', 'rooberah.co'].includes(domain)) return 'Only @fastbundle.co and @rooberah.co emails are allowed.';
      if (data.password.length < 8) return 'Password must be at least 8 characters.';
      if (data.password !== data.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1) {
      if (!data.displayName.trim()) return 'Display name is required.';
      if (!data.role) return 'Please select your role.';
    }
    if (step === 2) {
      if (!data.tshirt) return 'Please select your T-shirt size.';
    }
    return null;
  }

  async function handleNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (step < 2) { setStep(s => s + 1); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
          role: data.role,
          tshirt: data.tshirt,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
          <div className="lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-1 font-bold text-lg">
              <span style={{ color: 'var(--pink)' }}>Chill</span>
              <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
              <span style={{ color: 'var(--purple)' }}>Build</span>
            </Link>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i < step ? 'var(--ok)' : i === step ? 'var(--purple)' : 'rgba(255,255,255,0.06)',
                      color: i <= step ? '#fff' : 'var(--tx-lo)',
                    }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm" style={{ color: i === step ? 'var(--tx-hi)' : 'var(--tx-lo)' }}>{s}</span>
                </div>
                {i < 2 && <div className="w-8 h-px" style={{ background: i < step ? 'var(--ok)' : 'var(--line)' }} />}
              </div>
            ))}
          </div>

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--tx-mid)' }}>You&apos;ll use this to log in on event day.</p>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Email</label>
                <input type="email" value={data.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@ruberah.com" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Password</label>
                <input type="password" value={data.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 characters" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Confirm password</label>
                <input type="password" value={data.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repeat password" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tell us about you</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--tx-mid)' }}>This helps us organise the day.</p>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Display name</label>
                <input type="text" value={data.displayName} onChange={e => set('displayName', e.target.value)}
                  placeholder="Your name" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--tx-mid)' }}>Your team</label>
                <div className="flex flex-wrap gap-2">
                  {TEAMS.map(t => (
                    <button key={t} onClick={() => set('role', t)} type="button"
                      className="px-3 py-1.5 rounded-lg text-sm transition-all"
                      style={{
                        background: data.role === t ? 'var(--purple)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${data.role === t ? 'var(--purple)' : 'var(--line)'}`,
                        color: data.role === t ? '#fff' : 'var(--tx-mid)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Logistics */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Event-day logistics</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--tx-mid)' }}>Lock these in so we order enough.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--tx-hi)' }}>T-shirt size</label>
                <p className="text-xs mb-3" style={{ color: 'var(--tx-lo)' }}>Limited-edition Chill &amp; Build tee. Unisex fit.</p>
                <div className="flex gap-2 flex-wrap">
                  {TSHIRT_SIZES.map(sz => (
                    <button key={sz} onClick={() => set('tshirt', sz)} type="button"
                      className="w-12 h-10 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: data.tshirt === sz ? 'var(--purple)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${data.tshirt === sz ? 'var(--purple)' : 'var(--line)'}`,
                        color: data.tshirt === sz ? '#fff' : 'var(--tx-mid)',
                      }}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg mt-4"
              style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError(''); }} type="button"
                className="px-4 py-2.5 rounded-xl text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--tx-mid)' }}>
                Back
              </button>
            )}
            <button onClick={handleNext} disabled={loading} type="button"
              className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
              {loading ? 'Registering…' : step < 2 ? 'Continue →' : 'Complete registration'}
            </button>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--tx-lo)' }}>
            Step {step + 1} of 3 · takes about a minute
          </p>
          <p className="text-sm text-center mt-4" style={{ color: 'var(--tx-lo)' }}>
            Already registered?{' '}
            <Link href="/login" style={{ color: 'var(--pink)' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
