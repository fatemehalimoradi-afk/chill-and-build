'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNav from '@/app/components/AppNav';
import Toast from '@/app/components/Toast';

type User = { id: number; display_name: string; email: string; role: string; team_id: number | null };
type Team = { id: number; name: string | null; created_by: number; members: { id: number; display_name: string; email: string; role: string }[] };
type Me = { id: number; email: string; display_name: string; role: string };

function Avatar({ name, email, size = 8 }: { name: string; email: string; size?: number }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : email[0].toUpperCase();
  const colors = ['var(--purple)', 'var(--pink)', 'var(--blue)', 'var(--cyan)', '#36d39a'];
  const color = colors[(name || email).charCodeAt(0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold shrink-0`}
      style={{ background: color, color: '#fff', width: `${size * 4}px`, height: `${size * 4}px` }}>
      {initials}
    </div>
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  const loadData = useCallback(async () => {
    const [meRes, usersRes, teamsRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/users'),
      fetch('/api/teams'),
    ]);
    if (!meRes.ok) { router.push('/login'); return; }
    const meData = await meRes.json();
    const usersData: User[] = await usersRes.json();
    const teamsData: Team[] = await teamsRes.json();
    setMe(meData);
    setUsers(usersData);
    setTeams(teamsData);
    const found = teamsData.find(t => t.members.some(m => m.id === meData.id)) ?? null;
    setMyTeam(found);
    if (found) setTeamName(found.name ?? '');
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function createSoloTeam() {
    setInviting(-1);
    const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const data = await res.json();
    setInviting(null);
    if (!res.ok) { showToast(data.error, false); return; }
    showToast('Solo team created!');
    await loadData();
  }

  // Both "no team yet" and "solo team" cases go through /api/teams/invite
  async function inviteUser(userId: number) {
    setInviting(userId);
    const res = await fetch('/api/teams/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteeId: userId }),
    });
    const data = await res.json();
    setInviting(null);
    if (!res.ok) { showToast(data.error, false); return; }
    showToast('Invitation sent! They\'ll get an email shortly.');
    await loadData();
  }

  async function saveName() {
    if (!myTeam || !teamName.trim()) return;
    setSavingName(true);
    const res = await fetch(`/api/teams/${myTeam.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName }),
    });
    const data = await res.json();
    setSavingName(false);
    if (!res.ok) { showToast(data.error || 'Failed to save name.', false); return; }
    showToast('Team name saved!');
    setEditingName(false);
    await loadData();
  }

  async function leaveTeam() {
    if (!myTeam || leaving) return;
    if (!confirm('Leave this team? You can create a new one or join another later.')) return;

    setLeaving(true);
    const res = await fetch('/api/teams/leave', { method: 'POST' });
    const data = await res.json();
    setLeaving(false);
    if (!res.ok) { showToast(data.error, false); return; }
    showToast(data.teamDeleted ? 'You left the team. The empty team was removed.' : 'You left the team.');
    setEditingName(false);
    await loadData();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--purple) transparent var(--purple) var(--purple)' }} />
    </div>
  );

  const availableUsers = users.filter(u => u.id !== me!.id && !u.team_id);
  const canInvite = myTeam && myTeam.members.length < 2;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--tx-hi)', minHeight: '100vh' }}>
      {/* Toast */}
      {toast && <Toast message={toast.msg} ok={toast.ok} />}

      <AppNav
        userInitials={me ? (me.display_name ? me.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : me.email[0].toUpperCase()) : '?'}
        userName={me ? (me.display_name || me.email) : ''}
        onLogout={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── MY TEAM ── */}
        <section>
          <h1 className="text-2xl font-bold mb-6">My Team</h1>

          {myTeam ? (
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
              {/* Team name */}
              <div className="flex items-center gap-3 mb-5">
                {editingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input value={teamName} onChange={e => setTeamName(e.target.value)}
                      placeholder="Enter team name…"
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--purple)', color: 'var(--tx-hi)' }}
                      onKeyDown={e => e.key === 'Enter' && saveName()} autoFocus />
                    <button onClick={saveName} disabled={savingName}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ background: 'var(--purple)', color: '#fff' }}>
                      {savingName ? '…' : 'Save'}
                    </button>
                    <button onClick={() => setEditingName(false)} className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ color: 'var(--tx-lo)' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-lg">{myTeam.name || <span style={{ color: 'var(--tx-lo)' }}>Unnamed team</span>}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--tx-lo)' }}>{myTeam.members.length} / 2 members</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => setEditingName(true)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--tx-mid)', border: '1px solid var(--line)' }}>
                        {myTeam.name ? 'Rename' : 'Set name'}
                      </button>
                      <button onClick={leaveTeam} disabled={leaving}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: 'rgba(255,93,114,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,93,114,0.2)' }}>
                        {leaving ? 'Leaving…' : 'Leave team'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Members */}
              <div className="space-y-3">
                {myTeam.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar name={m.display_name} email={m.email} size={9} />
                    <div>
                      <p className="text-sm font-medium">{m.display_name || m.email}</p>
                      <p className="text-xs" style={{ color: 'var(--tx-lo)' }}>{m.role} · {m.email}</p>
                    </div>
                    {m.id === myTeam.created_by && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,107,255,0.15)', color: 'var(--purple)' }}>creator</span>
                    )}
                  </div>
                ))}

                {/* Empty slot */}
                {myTeam.members.length < 2 && (
                  <div className="flex items-center gap-3 rounded-xl p-3" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--line)' }}>
                      <span style={{ color: 'var(--tx-lo)' }}>+</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>Invite a teammate from the list below</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
              <p className="text-sm mb-4" style={{ color: 'var(--tx-mid)' }}>You haven't created a team yet. Go solo or invite someone below.</p>
              <button onClick={createSoloTeam} disabled={inviting === -1}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
                {inviting === -1 ? 'Creating…' : 'Create solo team'}
              </button>
            </div>
          )}
        </section>

        {/* ── ALL PARTICIPANTS ── */}
        <section>
          <h2 className="text-xl font-bold mb-2">All Participants</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--tx-mid)' }}>
            {availableUsers.length} builder{availableUsers.length !== 1 ? 's' : ''} without a team yet.
          </p>

          {users.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>No other participants registered yet.</p>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
              {users.filter(u => u.id !== me!.id).map((u, i) => {
                const inTeam = !!u.team_id;
                const pendingInvite = false; // could track this from API
                return (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-4"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <Avatar name={u.display_name} email={u.email} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || u.email}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--tx-lo)' }}>{u.role} · {u.email}</p>
                    </div>
                    {inTeam ? (
                      <span className="text-xs px-2.5 py-1 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--tx-lo)' }}>
                        In a team
                      </span>
                    ) : myTeam && !canInvite ? (
                      <span className="text-xs shrink-0" style={{ color: 'var(--tx-lo)' }}>Team full</span>
                    ) : (
                      <button
                        onClick={() => inviteUser(u.id)}
                        disabled={inviting === u.id}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-50 shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))', color: '#fff' }}>
                        {inviting === u.id ? 'Sending…' : 'Invite'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── ALL TEAMS ── */}
        <section>
          <h2 className="text-xl font-bold mb-5">All Teams ({teams.length})</h2>
          {teams.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>No teams formed yet. Be the first!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {teams.map(team => (
                <div key={team.id} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${team.members.some(m => m.id === me!.id) ? 'var(--purple)' : 'var(--line)'}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">{team.name || <span style={{ color: 'var(--tx-lo)' }}>Unnamed team</span>}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--tx-lo)' }}>{team.members.length} / 2 members</p>
                    </div>
                    {team.members.some(m => m.id === me!.id) && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,107,255,0.15)', color: 'var(--purple)' }}>yours</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {team.members.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Avatar name={m.display_name} email={m.email} size={7} />
                        <div>
                          <p className="text-sm">{m.display_name || m.email}</p>
                          <p className="text-xs" style={{ color: 'var(--tx-lo)' }}>{m.role}</p>
                        </div>
                      </div>
                    ))}
                    {team.members.length < 2 && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px dashed var(--line)' }}>
                          <span className="text-xs" style={{ color: 'var(--tx-lo)' }}>?</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--tx-lo)' }}>Waiting for teammate…</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
