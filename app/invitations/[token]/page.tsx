'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

type Invitation = {
  id: number; status: string; expired: boolean;
  inviter_name: string; inviter_email: string;
  invitee_name: string; invitee_email: string; invitee_id: number;
  team_name: string | null; team_id: number;
};

type Me = { id: number; email: string; display_name: string };

export default function InvitationPage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch(`/api/invitations/${token}`), fetch('/api/auth/me')])
      .then(async ([invRes, meRes]) => {
        if (invRes.ok) setInv(await invRes.json());
        if (meRes.ok) setMe(await meRes.json());
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function respond(action: 'accept' | 'decline') {
    setActing(true);
    setError('');
    const res = await fetch(`/api/invitations/${token}/${action}`, { method: 'POST' });
    const data = await res.json();
    setActing(false);
    if (!res.ok) { setError(data.error); return; }
    setDone(action === 'accept' ? 'accepted' : 'declined');
    if (action === 'accept') setTimeout(() => router.push('/teams'), 2000);
  }

  const Logo = () => (
    <Link href="/" className="flex items-center gap-1 font-bold text-lg">
      <span style={{ color: 'var(--pink)' }}>Chill</span>
      <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
      <span style={{ color: 'var(--purple)' }}>Build</span>
    </Link>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--purple) transparent var(--purple) var(--purple)' }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--bg)', color: 'var(--tx-hi)' }}>
      <div className="mb-8"><Logo /></div>

      <div className="w-full max-w-md p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
        {!inv ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Invitation not found</p>
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>This link may be invalid or expired.</p>
            <Link href="/" className="inline-block mt-6 text-sm" style={{ color: 'var(--purple)' }}>← Back to home</Link>
          </div>
        ) : done === 'accepted' ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg font-semibold mb-2">You're on the team!</p>
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>Redirecting to Teams page…</p>
          </div>
        ) : done === 'declined' ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Invitation declined</p>
            <p className="text-sm mb-6" style={{ color: 'var(--tx-lo)' }}>No worries — you can still create your own team.</p>
            <Link href="/teams" className="text-sm" style={{ color: 'var(--purple)' }}>Go to Teams →</Link>
          </div>
        ) : inv.status !== 'pending' || inv.expired ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">{inv.status === 'accepted' ? 'Already accepted' : inv.status === 'declined' ? 'Already declined' : 'Invitation expired'}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--tx-lo)' }}>This invitation is no longer active.</p>
            <Link href="/teams" className="text-sm" style={{ color: 'var(--purple)' }}>Go to Teams →</Link>
          </div>
        ) : !me ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Log in to respond</p>
            <p className="text-sm mb-6" style={{ color: 'var(--tx-lo)' }}>
              This invitation is for <strong>{inv.invitee_email}</strong>. Log in to accept or decline.
            </p>
            <Link href={`/login?redirect=/invitations/${token}`}
              className="inline-block px-6 py-2.5 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
              Log in
            </Link>
          </div>
        ) : me.id !== inv.invitee_id ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Wrong account</p>
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>
              This invitation is for <strong>{inv.invitee_email}</strong>, but you're logged in as <strong>{me.email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl mb-4">📩</div>
              <h1 className="text-xl font-bold mb-2">Team Invitation</h1>
              <p style={{ color: 'var(--tx-mid)' }}>
                <strong style={{ color: 'var(--tx-hi)' }}>{inv.inviter_name || inv.inviter_email}</strong> invited you to join their team
                {inv.team_name ? <> <strong style={{ color: 'var(--purple)' }}>&ldquo;{inv.team_name}&rdquo;</strong></> : ''} for Chill &amp; Build on June 12.
              </p>
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg mb-4" style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => respond('decline')} disabled={acting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--tx-mid)' }}>
                Decline
              </button>
              <button onClick={() => respond('accept')} disabled={acting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
                {acting ? '…' : 'Accept invitation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
