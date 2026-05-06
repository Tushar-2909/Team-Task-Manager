import { cn } from "../../lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-background hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export function Button({ className, variant = "default", size = "md", ...props }) {
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
