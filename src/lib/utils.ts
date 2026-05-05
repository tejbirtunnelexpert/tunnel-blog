import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length = 160) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "");
}
