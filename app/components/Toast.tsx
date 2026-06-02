'use client';

export default function Toast({
  message,
  ok = true,
}: {
  message: string;
  ok?: boolean;
}) {
  return (
    <div
      role="status"
      className="fixed bottom-6 right-4 z-[100] max-w-sm px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
      style={{
        background: ok ? '#0f2e24' : '#2a1218',
        color: ok ? 'var(--ok)' : 'var(--danger)',
        border: `1px solid ${ok ? 'rgba(54,211,154,0.45)' : 'rgba(255,93,114,0.45)'}`,
      }}
    >
      {message}
    </div>
  );
}
