export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-surface" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-panel" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-panel" />
    </div>
  );
}
