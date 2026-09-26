"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-10 text-center">
      <h2 className="text-xl font-semibold">Admin view unavailable</h2>
      <p className="mt-2 text-sm text-muted">The data could not be loaded.</p>
      <Button className="mt-5" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
