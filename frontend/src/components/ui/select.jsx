import { cn } from "../../lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
