export function AdSlot({ label = 'AdSense Slot Placeholder' }: { label?: string }) {
  return (
    <aside className="rounded-lg border border-dashed border-white/30 bg-card p-4 text-sm text-white/70" aria-label={label}>
      {label}
    </aside>
  );
}
