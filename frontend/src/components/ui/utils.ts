import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // Merge Tailwind utility classes in a type-safe way
  return twMerge(clsx(inputs));
}
