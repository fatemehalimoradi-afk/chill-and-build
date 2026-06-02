'use client';
import { useEffect, useState } from 'react';

export type LunchOption = {
  id: string;
  name: string;
  ingredients: string;
};

const OTHER_OFFICE_ID = 'other-office';

export default function LunchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<LunchOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch('/api/lunch-options')
      .then(r => r.json())
      .then(data => setOptions(Array.isArray(data) ? data : []))
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, []);

  if (!mounted || loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-full rounded-2xl p-4 animate-pulse"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', height: 72 }}
          />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--tx-lo)' }}>
        Lunch options are unavailable right now. Please try again later.
      </p>
    );
  }

  const foodOptions = options.filter(o => o.id !== OTHER_OFFICE_ID);
  const otherOffice = options.find(o => o.id === OTHER_OFFICE_ID);

  function renderOption(option: LunchOption, variant: 'food' | 'other-office') {
    const selected = value === option.id;
    const isOther = variant === 'other-office';

    return (
      <button
        key={option.id}
        type="button"
        onClick={() => onChange(option.id)}
        className="w-full text-left rounded-2xl p-4 transition-all"
        style={{
          background: selected
            ? isOther
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(155,107,255,0.12)'
            : 'rgba(255,255,255,0.04)',
          border: `1px ${isOther ? 'dashed' : 'solid'} ${selected ? (isOther ? 'var(--tx-mid)' : 'var(--purple)') : 'var(--line)'}`,
        }}
      >
        <div className="font-semibold mb-1" style={{ color: 'var(--tx-hi)' }}>
          {option.name}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--tx-lo)' }}>
          {option.ingredients}
        </p>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {foodOptions.map(option => renderOption(option, 'food'))}

      {otherOffice && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            <span className="text-xs shrink-0" style={{ color: 'var(--tx-lo)' }}>
              Joining from another office?
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          </div>
          {renderOption(otherOffice, 'other-office')}
        </>
      )}
    </div>
  );
}
