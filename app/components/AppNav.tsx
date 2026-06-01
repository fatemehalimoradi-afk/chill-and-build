'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Teams', href: '/teams' },
  { label: 'Schedule', href: '#' },
  { label: 'Mentor Help', href: '#' },
];

export default function AppNav({
  userInitials,
  userName,
  onLogout,
}: {
  userInitials: string;
  userName: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      style={{ borderBottom: '1px solid var(--line)', background: 'rgba(6,6,14,0.8)' }}
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 font-bold">
          <span style={{ color: 'var(--pink)' }}>Chill</span>
          <span className="mx-1" style={{ color: 'var(--tx-lo)' }}>&</span>
          <span style={{ color: 'var(--purple)' }}>Build</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {NAV_ITEMS.map(({ label, href }) => {
            const active = href !== '#' && pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-white"
                style={{
                  color: active ? 'var(--tx-hi)' : 'var(--tx-mid)',
                  fontWeight: active ? 600 : undefined,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <button onClick={onLogout} className="flex items-center gap-2 text-sm">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--purple)', color: '#fff' }}
          >
            {userInitials}
          </div>
          <span className="hidden md:inline" style={{ color: 'var(--tx-mid)' }}>
            {userName}
          </span>
        </button>
      </div>
    </nav>
  );
}
