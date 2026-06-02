'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LunchPicker from '@/app/components/LunchPicker';
import RegistrationSocialProof from '@/app/components/RegistrationSocialProof';

const TEAMS = ['Support', 'Tech Support', 'Upsell', 'Insights', 'Management', 'HR', 'Product', 'Marketing', 'Executive'];
const STEPS = ['Account', 'Profile', 'Lunch'];

type FormData = {
  email: string; password: string; confirmPassword: string;
  displayName: string; role: string;
  lunch: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData>({
    email: '', password: '', confirmPassword: '',
    displayName: '', role: '',
    lunch: '',
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
      if (!data.lunch) return 'Please select your lunch option.';
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
          lunch: data.lunch,
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
      <div className="hidden lg:flex flex-col justify-between w-96 shrink-0 p-10" style={{ borderRight: '1px solid var(--line)' }}>
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <span style={{ color: 'var(--pink)' }}>Chill</span>
          <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </Link>
        <RegistrationSocialProof />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className={`w-full ${step === 2 ? 'max-w-lg' : 'max-w-sm'}`}>
          <div className="lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-1 font-bold text-lg">
              <span style={{ color: 'var(--pink)' }}>Chill</span>
              <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
              <span style={{ color: 'var(--purple)' }}>Build</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-8 flex-wrap">
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
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px" style={{ background: i < step ? 'var(--ok)' : 'var(--line)' }} />
                )}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--tx-mid)' }}>You&apos;ll use this to log in on event day.</p>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--tx-mid)' }}>Email</label>
                <input type="email" value={data.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@rooberah.co" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
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

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold mb-1">Choose your lunch</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--tx-mid)' }}>
                  Pick one option for event day. Joining from another office? Use the button at the bottom — no lunch order needed.
                </p>
              </div>
              <LunchPicker value={data.lunch} onChange={id => set('lunch', id)} />
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
