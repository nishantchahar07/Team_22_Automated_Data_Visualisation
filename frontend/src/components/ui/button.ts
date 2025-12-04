import { cn } from "./utils";

type Variant = "default" | "outline" | "destructive" | "ghost" | "link";

type ButtonOptions = {
  variant?: Variant;
  className?: string;
};

export function buttonVariants(options: ButtonOptions = {}) {
  const { variant = "default", className } = options;
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const map: Record<Variant, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-slate-100",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  return cn(base, map[variant], className);
}
