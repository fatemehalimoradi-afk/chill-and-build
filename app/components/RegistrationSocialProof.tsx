'use client';
import { useEffect, useState } from 'react';

type Stats = { registeredCount: number; teamsCount: number; names: string[] };

const AVATAR_COLORS = ['var(--purple)', 'var(--pink)', 'var(--blue)', 'var(--cyan)'];

function socialProofText(names: string[], count: number): string | null {
  if (count === 0) return null;
  const first = names[0] ?? 'Someone';
  if (count === 1) return `${first} is in.`;
  const second = names[1] ?? 'another builder';
  if (count === 2) return `${first} & ${second} are in.`;
  return `${first}, ${second} & ${count - 2} others are in.`;
}

export default function RegistrationSocialProof() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const text = stats ? socialProofText(stats.names, stats.registeredCount) : null;

  return (
    <div>
      <p className="text-2xl font-bold leading-snug mb-4">One day.<br />One working AI solution.</p>
      <p style={{ color: 'var(--tx-mid)' }}>Join Rooberah builders on June 12. Coffee, lunch and GPU credits on us.</p>
      {stats && stats.registeredCount > 0 && (
        <>
          <div className="mt-6 flex -space-x-2">
            {stats.names.slice(0, 4).map((name, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  borderColor: 'var(--bg)',
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  color: '#fff',
                }}
              >
                {name[0]?.toUpperCase() ?? '?'}
              </div>
            ))}
          </div>
          {text && (
            <p className="text-sm mt-2" style={{ color: 'var(--tx-lo)' }}>{text}</p>
          )}
        </>
      )}
    </div>
  );
}
