"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-line bg-panel p-10 text-center">
      <AlertTriangle className="mx-auto mb-4 text-amber" size={30} />
      <h2 className="text-xl font-semibold text-white">
        This view could not load
      </h2>
      <p className="mt-2 text-sm text-muted">
        Please try again. If the problem continues, contact your workspace
        administrator.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
