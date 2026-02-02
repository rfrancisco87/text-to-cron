import * as chrono from "chrono-node";
import { ParseResult, WEEKDAYS, CronFormat } from "./types";
import { PATTERNS } from "./patterns";

function normalizeInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(\d)(am|pm)/gi, "$1 $2")
    .replace(/o'clock/gi, "")
    .replace(/every single/gi, "every")
    .replace(/each and every/gi, "every");
}

function parseHour(hourStr: string, ampm?: string): number {
  let hour = parseInt(hourStr, 10);
  if (ampm) {
    const isPM = ampm.toLowerCase() === "pm";
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
  }
  return hour;
}

function extractTimeFromChrono(input: string): { hour: number; minute: number } | null {
  const parsed = chrono.parse(input, new Date(), { forwardDate: true });

  if (parsed.length > 0 && parsed[0].start) {
    const components = parsed[0].start;
    if (components.isCertain("hour")) {
      return {
        hour: components.get("hour") ?? 0,
        minute: components.get("minute") ?? 0,
      };
    }
  }
  return null;
}

function getDayNumber(day: string): number {
  return WEEKDAYS[day.toLowerCase()] ?? -1;
}

function tryChronoFallback(input: string): ParseResult | null {
  const normalized = normalizeInput(input);

  // Check for day of week mentions
  const dayMatches = Object.keys(WEEKDAYS).filter((day) =>
    normalized.includes(day)
  );

  // Extract time using chrono
  const time = extractTimeFromChrono(input);

  // Pattern: "[on] [day] at [time]" or "[day] [time]"
  if (dayMatches.length > 0 && time) {
    const uniqueDays = [...new Set(dayMatches.map((d) => getDayNumber(d)))];
    const dayStr = uniqueDays.sort((a, b) => a - b).join(",");

    return {
      cron: `${time.minute} ${time.hour} * * ${dayStr}`,
      confidence: "medium",
      isApproximate: false,
      interpretation: `On ${dayMatches[0]} at ${time.hour}:${time.minute.toString().padStart(2, "0")}`,
    };
  }

  // Pattern: just a time (assumes daily)
  if (time && !dayMatches.length) {
    // Check if "every" or "daily" is mentioned
    if (/every|daily|each day/i.test(normalized)) {
      return {
        cron: `${time.minute} ${time.hour} * * *`,
        confidence: "medium",
        isApproximate: false,
        interpretation: `Daily at ${time.hour}:${time.minute.toString().padStart(2, "0")}`,
      };
    }
  }

  // Check for interval patterns with time
  const intervalMatch = normalized.match(
    /every\s*(\d+)\s*(minute|hour|day|week|month)s?\s*(?:at\s*)?/i
  );
  if (intervalMatch) {
    const n = parseInt(intervalMatch[1], 10);
    const unit = intervalMatch[2].toLowerCase();

    if (time && (unit === "day" || unit === "week")) {
      if (unit === "day") {
        return {
          cron: `${time.minute} ${time.hour} */${n} * *`,
          confidence: "medium",
          isApproximate: true,
          interpretation: `Every ${n} days at ${time.hour}:${time.minute.toString().padStart(2, "0")}`,
          warning: `Note: This runs on days 1, ${n + 1}, ${2 * n + 1}, etc. of each month`,
        };
      }
    }
  }

  return null;
}

function convertTo6Field(cron5: string): string {
  // Prepend "0" for seconds to convert 5-field to 6-field
  return `0 ${cron5}`;
}

export function parseNaturalLanguage(
  input: string,
  format: CronFormat = "5-field"
): ParseResult {
  if (!input || !input.trim()) {
    return {
      cron: null,
      confidence: "low",
      isApproximate: false,
      error: "Please enter a schedule description",
    };
  }

  const normalized = normalizeInput(input);

  // Try pattern matching first (most reliable)
  for (const { pattern, handler } of PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      const result = handler(match, normalized);
      if (result.cron && format === "6-field") {
        result.cron = convertTo6Field(result.cron);
      }
      return result;
    }
  }

  // Try chrono-node fallback for more complex expressions
  const chronoResult = tryChronoFallback(input);
  if (chronoResult) {
    if (chronoResult.cron && format === "6-field") {
      chronoResult.cron = convertTo6Field(chronoResult.cron);
    }
    return chronoResult;
  }

  // No match found
  return {
    cron: null,
    confidence: "low",
    isApproximate: false,
    error: `Could not parse "${input}". Try phrases like "every 5 minutes", "daily at 9am", or "every Monday at 3pm".`,
  };
}
