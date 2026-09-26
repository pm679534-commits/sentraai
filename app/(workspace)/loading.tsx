export default function Loading() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="h-8 w-64 rounded-lg bg-surface" />
      <div className="h-4 w-96 max-w-full rounded bg-surface" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-panel" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-panel" />
    </div>
  );
}
