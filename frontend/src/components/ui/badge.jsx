import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
    warning: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
