import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfWeek, endOfWeek, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatGhanaDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-GH", {
    timeZone: "Africa/Accra",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGhanaDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GH", {
    timeZone: "Africa/Accra",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function generateCSV(rows: Record<string, unknown>[], filename: string): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
