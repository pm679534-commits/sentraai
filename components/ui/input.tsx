import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "focus-ring h-11 w-full rounded-lg border border-line bg-ink/60 px-3.5 text-sm text-white placeholder:text-muted/60",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
