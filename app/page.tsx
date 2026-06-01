'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-6 justify-center">
      {[{ v: d, l: 'days' }, { v: h, l: 'hrs' }, { v: m, l: 'min' }, { v: s, l: 'sec' }].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums" style={{ color: 'var(--pink)' }}>
            {String(Math.max(0, v)).padStart(2, '0')}
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--tx-lo)' }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

const TRACKS = [
  { name: 'AI Agents', desc: 'Autonomous tools that plan, call APIs and get real work done.', color: 'var(--pink)' },
  { name: 'Dev Experience', desc: 'Copilots, codegen and tooling that make builders 10× faster.', color: 'var(--blue)' },
  { name: 'Creative AI', desc: 'Generative image, audio & video for product and marketing.', color: 'var(--cyan)' },
  { name: 'Applied ML', desc: "Models that turn Ruberah's data into a sharper product edge.", color: 'var(--purple)' },
];

const SCHEDULE = [
  { time: '8:45', title: 'Arrival & Breakfast', desc: 'Settle in, grab coffee, find your people.' },
  { time: '9:00', title: 'Opening Remarks', desc: '10 minutes to kick things off.' },
  { time: '9:10', title: 'Tool Setup', desc: 'Get your environment ready.' },
  { time: '9:30', title: 'Guided Build Session', desc: 'Structured building with support.' },
  { time: '12:00', title: 'Lunch & Chill', desc: 'Break, recharge, connect.' },
  { time: '13:00', title: 'Main Build Time', desc: 'Heads down. Build something real.' },
  { time: '17:30', title: 'Lightning Demos', desc: 'Show what you built.' },
  { time: '18:30', title: 'Dinner + Awards + Celebration', desc: 'Winners announced. Celebrate together.' },
];

type Stats = { registeredCount: number; teamsCount: number; names: string[] };

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--tx-hi)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--line)', background: 'rgba(6,6,14,0.8)' }} className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1 font-bold text-lg">
            <span style={{ color: 'var(--pink)' }}>Chill</span>
            <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
            <span style={{ color: 'var(--purple)' }}>Build</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--tx-mid)' }}>
            <a href="#tracks" className="hover:text-white transition-colors">Tracks</a>
            <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-4 py-1.5 rounded-lg transition-colors hover:text-white" style={{ color: 'var(--tx-mid)' }}>
              Log in
            </Link>
            <Link href="/register" className="text-sm px-4 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80" style={{ background: 'var(--pink)', color: '#fff' }}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-8" style={{ background: 'rgba(54,211,154,0.1)', border: '1px solid rgba(54,211,154,0.2)', color: 'var(--ok)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Registration open · Presented by Ruberah
        </div>
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-none">
          <span style={{ color: 'var(--pink)' }}>Chill</span>{' '}
          <span style={{ color: 'var(--tx-lo)' }}>&</span>{' '}
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </h1>
        <p className="text-xl max-w-xl mx-auto mb-4" style={{ color: 'var(--tx-mid)' }}>
          One day. One idea. One working AI solution. Join Ruberah&apos;s internal AI hackathon and build something useful, creative, and real.
        </p>
        {stats && stats.registeredCount > 0 && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {stats.names.slice(0, 4).map((n, i) => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{ borderColor: 'var(--bg)', background: ['var(--purple)','var(--pink)','var(--blue)','var(--cyan)'][i % 4], color: '#fff' }}>
                  {n[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>
              {stats.names.slice(0, 2).join(', ')}
              {stats.registeredCount > 2 ? ` & ${stats.registeredCount - 2} others are in.` : ' are in.'}
            </p>
          </div>
        )}
        <div className="flex items-center justify-center gap-4 text-sm mb-10" style={{ color: 'var(--tx-lo)' }}>
          <span>Fri · June 12, 2026</span>
          <span>·</span>
          <span>Ruberah HQ · Tehran Office</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-16">
          <Link href="/register" className="px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
            Claim your spot
          </Link>
          <a href="#schedule" className="px-6 py-3 rounded-xl font-semibold transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--tx-mid)' }}>
            See the schedule
          </a>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--tx-lo)' }}>until doors open</p>
        <Countdown />
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {[
            { v: stats ? String(stats.registeredCount) : '…', l: 'builders registered' },
            { v: '12hrs', l: 'to build & ship' },
            { v: stats ? String(stats.teamsCount) : '…', l: 'teams' },
            { v: '6', l: 'mentors on-site' },
            { v: '+100M', l: 'prize pool' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--tx-lo)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-2">Build in any direction</h2>
        <p className="mb-10" style={{ color: 'var(--tx-mid)' }}>Four tracks. Pick your battlefield.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {TRACKS.map(t => (
            <div key={t.name} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
              <div className="text-sm font-semibold mb-2" style={{ color: t.color }}>{t.name}</div>
              <p style={{ color: 'var(--tx-mid)' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-2">One intense day</h2>
        <p className="mb-10" style={{ color: 'var(--tx-mid)' }}>From first coffee to final demo. Doors at 9, winners by 8.</p>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)' }}>
          {SCHEDULE.map((s, i) => (
            <div key={s.time} className="flex gap-6 px-6 py-4 items-start" style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
              <span className="text-sm font-mono w-12 shrink-0 mt-0.5" style={{ color: 'var(--pink)' }}>{s.time}</span>
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm" style={{ color: 'var(--tx-lo)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to build?</h2>
        <p className="mb-8" style={{ color: 'var(--tx-mid)' }}>Spots are limited. Register before June 8.</p>
        <Link href="/register" className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
          Register now →
        </Link>
      </section>

      <footer className="text-center py-8 text-sm" style={{ color: 'var(--tx-lo)', borderTop: '1px solid var(--line)' }}>
        Chill &amp; Build · Ruberah · June 12, 2026
      </footer>
    </div>
  );
}
