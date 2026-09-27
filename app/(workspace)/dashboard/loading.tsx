export default function Loading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-surface" />
        <div className="h-9 w-64 max-w-full rounded bg-surface" />
        <div className="h-4 w-96 max-w-full rounded bg-surface" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-panel" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="h-96 rounded-2xl bg-panel" />
        <div className="h-96 rounded-2xl bg-panel" />
      </div>
      <div className="h-80 rounded-2xl bg-panel" />
    </div>
  );
}
