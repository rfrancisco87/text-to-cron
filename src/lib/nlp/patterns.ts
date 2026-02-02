import { PatternMatch, ParseResult, WEEKDAYS } from "./types";

function getDayNumber(day: string): number {
  return WEEKDAYS[day.toLowerCase()] ?? 0;
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

function success(cron: string, interpretation?: string): ParseResult {
  return {
    cron,
    confidence: "high",
    isApproximate: false,
    interpretation,
  };
}

function approximate(
  cron: string,
  warning: string,
  interpretation?: string
): ParseResult {
  return {
    cron,
    confidence: "low",
    isApproximate: true,
    warning,
    interpretation,
  };
}

// Pattern definitions - order matters (more specific patterns first)
export const PATTERNS: PatternMatch[] = [
  // === EVERY MINUTE/HOUR/DAY PATTERNS ===
  {
    pattern: /^every\s*minute$/i,
    handler: () => success("* * * * *", "Every minute"),
  },
  {
    pattern: /^every\s*hour$/i,
    handler: () => success("0 * * * *", "Every hour at minute 0"),
  },
  {
    pattern: /^every\s*day$/i,
    handler: () => success("0 0 * * *", "Every day at midnight"),
  },
  {
    pattern: /^daily$/i,
    handler: () => success("0 0 * * *", "Every day at midnight"),
  },
  {
    pattern: /^hourly$/i,
    handler: () => success("0 * * * *", "Every hour at minute 0"),
  },

  // === EVERY N MINUTES/HOURS ===
  {
    pattern: /^every\s*(\d+)\s*minutes?$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      if (n < 1 || n > 59)
        return { cron: null, confidence: "low", isApproximate: false, error: "Minutes must be between 1 and 59" };
      return success(`*/${n} * * * *`, `Every ${n} minute(s)`);
    },
  },
  {
    pattern: /^every\s*(\d+)\s*hours?$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      if (n < 1 || n > 23)
        return { cron: null, confidence: "low", isApproximate: false, error: "Hours must be between 1 and 23" };
      return success(`0 */${n} * * *`, `Every ${n} hour(s)`);
    },
  },
  // Every N days at specific time (must come before plain "every N days")
  {
    pattern: /^every\s*(\d+)\s*days?\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      if (n < 1 || n > 31)
        return { cron: null, confidence: "low", isApproximate: false, error: "Days must be between 1 and 31" };
      const hour = parseHour(match[2], match[4]);
      const minute = parseInt(match[3], 10);
      return {
        cron: `${minute} ${hour} */${n} * *`,
        confidence: "medium",
        isApproximate: true,
        interpretation: `Every ${n} day(s) at ${match[2]}:${match[3]} ${match[4] || ""}`,
        warning:
          "Note: This runs on days 1, " +
          (n + 1) +
          ", " +
          (2 * n + 1) +
          ", etc. of each month",
      };
    },
  },
  {
    pattern: /^every\s*(\d+)\s*days?\s*at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      if (n < 1 || n > 31)
        return { cron: null, confidence: "low", isApproximate: false, error: "Days must be between 1 and 31" };
      const hour = parseHour(match[2], match[3]);
      return {
        cron: `0 ${hour} */${n} * *`,
        confidence: "medium",
        isApproximate: true,
        interpretation: `Every ${n} day(s) at ${match[2]} ${match[3]}`,
        warning:
          "Note: This runs on days 1, " +
          (n + 1) +
          ", " +
          (2 * n + 1) +
          ", etc. of each month",
      };
    },
  },
  {
    pattern: /^every\s*(\d+)\s*days?$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      if (n < 1 || n > 31)
        return { cron: null, confidence: "low", isApproximate: false, error: "Days must be between 1 and 31" };
      return {
        cron: `0 0 */${n} * *`,
        confidence: "medium",
        isApproximate: true,
        interpretation: `Every ${n} day(s) starting from day 1`,
        warning:
          "Note: This runs on days 1, " +
          (n + 1) +
          ", " +
          (2 * n + 1) +
          ", etc. of each month",
      };
    },
  },

  // === AT SPECIFIC TIME (with day patterns) ===
  {
    pattern:
      /^(?:every\s*day\s*)?at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[3]);
      const minute = parseInt(match[2], 10);
      return success(`${minute} ${hour} * * *`, `Daily at ${match[1]}:${match[2]} ${match[3] || ""}`);
    },
  },
  {
    pattern: /^(?:every\s*day\s*)?at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[2]);
      return success(`0 ${hour} * * *`, `Daily at ${match[1]} ${match[2]}`);
    },
  },
  {
    pattern: /^(?:every\s*day\s*)?at\s*noon$/i,
    handler: () => success("0 12 * * *", "Daily at noon"),
  },
  {
    pattern: /^(?:every\s*day\s*)?at\s*midnight$/i,
    handler: () => success("0 0 * * *", "Daily at midnight"),
  },

  // === DAILY AT TIME ===
  {
    pattern: /^daily\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[3]);
      const minute = parseInt(match[2], 10);
      return success(`${minute} ${hour} * * *`, `Daily at ${match[1]}:${match[2]} ${match[3] || ""}`);
    },
  },
  {
    pattern: /^daily\s*at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[2]);
      return success(`0 ${hour} * * *`, `Daily at ${match[1]} ${match[2]}`);
    },
  },

  // === EVERY [WEEKDAY] patterns ===
  {
    pattern:
      /^every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)$/i,
    handler: (match) => {
      const day = getDayNumber(match[1]);
      return success(`0 0 * * ${day}`, `Every ${match[1]} at midnight`);
    },
  },
  {
    pattern:
      /^every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const day = getDayNumber(match[1]);
      const hour = parseHour(match[2], match[4]);
      const minute = parseInt(match[3], 10);
      return success(
        `${minute} ${hour} * * ${day}`,
        `Every ${match[1]} at ${match[2]}:${match[3]} ${match[4] || ""}`
      );
    },
  },
  {
    pattern:
      /^every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const day = getDayNumber(match[1]);
      const hour = parseHour(match[2], match[3]);
      return success(
        `0 ${hour} * * ${day}`,
        `Every ${match[1]} at ${match[2]} ${match[3]}`
      );
    },
  },

  // === WEEKDAYS/WEEKENDS ===
  {
    pattern: /^(?:on\s*)?weekdays$/i,
    handler: () => success("0 0 * * 1-5", "Every weekday at midnight"),
  },
  {
    pattern: /^(?:on\s*)?weekdays\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[3]);
      const minute = parseInt(match[2], 10);
      return success(`${minute} ${hour} * * 1-5`, `Every weekday at ${match[1]}:${match[2]} ${match[3] || ""}`);
    },
  },
  {
    pattern: /^(?:on\s*)?weekdays\s*at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[2]);
      return success(`0 ${hour} * * 1-5`, `Every weekday at ${match[1]} ${match[2]}`);
    },
  },
  {
    pattern: /^(?:on\s*)?weekends?$/i,
    handler: () => success("0 0 * * 0,6", "Every weekend at midnight"),
  },
  {
    pattern: /^(?:on\s*)?weekends?\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[3]);
      const minute = parseInt(match[2], 10);
      return success(`${minute} ${hour} * * 0,6`, `Every weekend at ${match[1]}:${match[2]} ${match[3] || ""}`);
    },
  },
  {
    pattern: /^(?:on\s*)?weekends?\s*at\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[2]);
      return success(`0 ${hour} * * 0,6`, `Every weekend at ${match[1]} ${match[2]}`);
    },
  },

  // === MULTIPLE DAYS ===
  {
    pattern:
      /^every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:and|,)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)$/i,
    handler: (match) => {
      const day1 = getDayNumber(match[1]);
      const day2 = getDayNumber(match[2]);
      const days = [day1, day2].sort((a, b) => a - b).join(",");
      return success(`0 0 * * ${days}`, `Every ${match[1]} and ${match[2]} at midnight`);
    },
  },
  {
    pattern:
      /^every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:and|,)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const day1 = getDayNumber(match[1]);
      const day2 = getDayNumber(match[2]);
      const days = [day1, day2].sort((a, b) => a - b).join(",");
      const hour = parseHour(match[3], match[5]);
      const minute = parseInt(match[4], 10);
      return success(
        `${minute} ${hour} * * ${days}`,
        `Every ${match[1]} and ${match[2]} at ${match[3]}:${match[4]} ${match[5] || ""}`
      );
    },
  },

  // === MONTHLY PATTERNS ===
  {
    pattern: /^(?:on\s*)?(?:the\s*)?1st\s*(?:day\s*)?(?:of\s*)?(?:every|each)?\s*month$/i,
    handler: () => success("0 0 1 * *", "First day of every month at midnight"),
  },
  {
    pattern:
      /^(?:on\s*)?(?:the\s*)?1st\s*(?:day\s*)?(?:of\s*)?(?:every|each)?\s*month\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const hour = parseHour(match[1], match[3]);
      const minute = parseInt(match[2], 10);
      return success(`${minute} ${hour} 1 * *`, `First day of every month at ${match[1]}:${match[2]} ${match[3] || ""}`);
    },
  },
  {
    pattern:
      /^(?:on\s*)?(?:the\s*)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:day\s*)?(?:of\s*)?(?:every|each)?\s*month$/i,
    handler: (match) => {
      const day = parseInt(match[1], 10);
      if (day < 1 || day > 31)
        return { cron: null, confidence: "low", isApproximate: false, error: "Day must be between 1 and 31" };
      return success(`0 0 ${day} * *`, `Day ${day} of every month at midnight`);
    },
  },
  {
    pattern:
      /^(?:on\s*)?(?:the\s*)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:day\s*)?(?:of\s*)?(?:every|each)?\s*month\s*at\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i,
    handler: (match) => {
      const day = parseInt(match[1], 10);
      if (day < 1 || day > 31)
        return { cron: null, confidence: "low", isApproximate: false, error: "Day must be between 1 and 31" };
      const hour = parseHour(match[2], match[4]);
      const minute = parseInt(match[3], 10);
      return success(
        `${minute} ${hour} ${day} * *`,
        `Day ${day} of every month at ${match[2]}:${match[3]} ${match[4] || ""}`
      );
    },
  },
  {
    pattern: /^(?:every|each)\s*month$/i,
    handler: () => success("0 0 1 * *", "First day of every month at midnight"),
  },
  {
    pattern: /^monthly$/i,
    handler: () => success("0 0 1 * *", "First day of every month at midnight"),
  },

  // === TWICE A DAY ===
  {
    pattern: /^twice\s*(?:a|per)\s*day$/i,
    handler: () => success("0 0,12 * * *", "Twice a day at midnight and noon"),
  },
  {
    pattern:
      /^twice\s*(?:a|per)\s*day\s*at\s*(\d{1,2})\s*(am|pm)\s*(?:and|,)\s*(\d{1,2})\s*(am|pm)$/i,
    handler: (match) => {
      const hour1 = parseHour(match[1], match[2]);
      const hour2 = parseHour(match[3], match[4]);
      const hours = [hour1, hour2].sort((a, b) => a - b).join(",");
      return success(
        `0 ${hours} * * *`,
        `Twice a day at ${match[1]} ${match[2]} and ${match[3]} ${match[4]}`
      );
    },
  },

  // === EVERY WEEK ===
  {
    pattern: /^(?:every|each)\s*week$/i,
    handler: () => success("0 0 * * 0", "Every week on Sunday at midnight"),
  },
  {
    pattern: /^weekly$/i,
    handler: () => success("0 0 * * 0", "Every week on Sunday at midnight"),
  },

  // === YEARLY/ANNUALLY ===
  {
    pattern: /^(?:every|each)\s*year$/i,
    handler: () => success("0 0 1 1 *", "Every year on January 1st at midnight"),
  },
  {
    pattern: /^yearly$/i,
    handler: () => success("0 0 1 1 *", "Every year on January 1st at midnight"),
  },
  {
    pattern: /^annually$/i,
    handler: () => success("0 0 1 1 *", "Every year on January 1st at midnight"),
  },

  // === ADVANCED PATTERNS (WARNINGS) ===
  {
    pattern:
      /^(?:(?:every|the)\s*)?last\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:of\s*(?:the\s*)?(?:every\s*)?month)?$/i,
    handler: (match) => {
      const day = getDayNumber(match[1]);
      return approximate(
        `0 0 * * ${day}`,
        `Standard cron cannot express "last ${match[1]} of month". This requires the 'L' operator (e.g., ${day}L) which is only available in extended cron formats like Quartz. The expression shown will run every ${match[1]}.`,
        `Attempted: Last ${match[1]} of the month`
      );
    },
  },
  {
    pattern:
      /^(?:every\s*)?(\d+)(?:st|nd|rd|th)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:of\s*(?:the\s*)?(?:every\s*)?month)?$/i,
    handler: (match) => {
      const nth = parseInt(match[1], 10);
      const day = match[2];
      const dayNum = getDayNumber(day);
      return approximate(
        `0 0 * * ${dayNum}`,
        `Standard cron cannot express "${nth}${match[1].slice(-2)} ${day}". This requires the '#' operator (e.g., ${dayNum}#${nth}) which is only available in extended cron formats. The expression shown will run every ${day}.`,
        `Attempted: ${nth}${match[1].slice(-2)} ${day} of the month`
      );
    },
  },
  {
    pattern: /^(?:(?:every|the)\s*)?last\s*day\s*(?:of\s*(?:the\s*)?(?:every\s*)?month)?$/i,
    handler: () =>
      approximate(
        "0 0 28-31 * *",
        "Standard cron cannot express \"last day of month\". This requires the 'L' operator which is only available in extended cron formats. The expression shown runs on days 28-31 as an approximation.",
        "Attempted: Last day of the month"
      ),
  },
  {
    pattern:
      /^(?:every\s*)?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*(?:of\s*(?:the\s*)?(?:every\s*)?month)?$/i,
    handler: (match) => {
      const ordinalMap: Record<string, number> = {
        first: 1, "1st": 1,
        second: 2, "2nd": 2,
        third: 3, "3rd": 3,
        fourth: 4, "4th": 4,
        fifth: 5, "5th": 5,
      };
      const nth = ordinalMap[match[1].toLowerCase()];
      const day = match[2];
      const dayNum = getDayNumber(day);
      return approximate(
        `0 0 * * ${dayNum}`,
        `Standard cron cannot express "${match[1]} ${day} of month". This requires the '#' operator (e.g., ${dayNum}#${nth}) which is only available in extended cron formats. The expression shown will run every ${day}.`,
        `Attempted: ${match[1]} ${day} of the month`
      );
    },
  },

  // === EVERY X WEEKS ===
  {
    pattern: /^every\s*(\d+)\s*weeks?$/i,
    handler: (match) => {
      const n = parseInt(match[1], 10);
      return approximate(
        "0 0 * * 0",
        `Standard cron cannot directly express "every ${n} weeks". Cron expressions reset monthly. Consider using a job scheduler that supports week intervals, or run weekly and track execution count in your script.`,
        `Attempted: Every ${n} weeks`
      );
    },
  },
];
