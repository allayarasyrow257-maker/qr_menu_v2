import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
<<<<<<< HEAD
  if (amount % 1 === 0) {
    return `${amount} TMT`;
  }
  return `${amount.toFixed(2)} TMT`;
=======
  // If the amount is a whole number, don't show decimals
  if (amount % 1 === 0) {
    return `${amount} TMT`;
  }

  // Otherwise, use standard currency formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TMT",
  }).format(amount);
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
}

export function getLocalizedName(
  name: Record<string, string>,
  lang: string,
): string {
  return name[lang] || name["en"] || Object.values(name)[0] || "";
}
