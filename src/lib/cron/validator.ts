import { parseExpression } from "cron-parser";
import type { CronFormat } from "@/lib/nlp/types";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  detectedFormat?: CronFormat | null;
}

export function detectCronFormat(expression: string): CronFormat | null {
  if (!expression || !expression.trim()) return null;
  const parts = expression.trim().split(/\s+/);
  if (parts.length === 5) return "5-field";
  if (parts.length === 6) return "6-field";
  return null;
}

export function validateCron(
  expression: string,
  format?: CronFormat
): ValidationResult {
  if (!expression || !expression.trim()) {
    return { isValid: false, error: "Cron expression is empty" };
  }

  const parts = expression.trim().split(/\s+/);

  // Auto-detect format if not provided
  const detectedFormat = detectCronFormat(expression);
  const effectiveFormat = format || detectedFormat;

  if (!effectiveFormat) {
    return {
      isValid: false,
      error: `Expected 5 or 6 fields, got ${parts.length}`,
    };
  }

  const expectedFields = effectiveFormat === "6-field" ? 6 : 5;

  if (parts.length !== expectedFields) {
    const fieldNames = effectiveFormat === "6-field"
      ? "second minute hour day month weekday"
      : "minute hour day month weekday";
    return {
      isValid: false,
      error: `Expected ${expectedFields} fields (${fieldNames}), got ${parts.length}`,
      detectedFormat,
    };
  }

  try {
    // For 6-field, strip the seconds for cron-parser (it only supports 5-field)
    const cronFor5Field = effectiveFormat === "6-field" ? parts.slice(1).join(" ") : expression;
    parseExpression(cronFor5Field);

    // Validate seconds field separately for 6-field
    if (effectiveFormat === "6-field") {
      const seconds = parts[0];
      if (!isValidCronField(seconds, 0, 59)) {
        return { isValid: false, error: "Invalid seconds field (0-59)", detectedFormat };
      }
    }

    return { isValid: true, detectedFormat };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid cron expression";
    return { isValid: false, error: message, detectedFormat };
  }
}

function isValidCronField(value: string, min: number, max: number): boolean {
  if (value === "*") return true;
  if (value.startsWith("*/")) {
    const step = parseInt(value.slice(2), 10);
    return !isNaN(step) && step >= 1 && step <= max;
  }
  if (value.includes(",")) {
    return value.split(",").every((v) => isValidCronField(v, min, max));
  }
  if (value.includes("-")) {
    const [start, end] = value.split("-").map((v) => parseInt(v, 10));
    return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
  }
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
}

export function getNextExecutions(
  expression: string,
  count: number = 5,
  format: CronFormat = "5-field"
): Date[] {
  try {
    // For 6-field, strip seconds for cron-parser
    const parts = expression.trim().split(/\s+/);
    const cronFor5Field = format === "6-field" ? parts.slice(1).join(" ") : expression;

    const interval = parseExpression(cronFor5Field);
    const dates: Date[] = [];

    for (let i = 0; i < count; i++) {
      const next = interval.next();
      dates.push(next.toDate());
    }

    return dates;
  } catch {
    return [];
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "in less than a minute";
  if (diffMins < 60) return `in ${diffMins} minute${diffMins === 1 ? "" : "s"}`;
  if (diffHours < 24) return `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  if (diffDays < 7) return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;

  return formatDate(date);
}
