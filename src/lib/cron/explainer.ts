import cronstrue from "cronstrue";

export function cronToHumanReadable(expression: string): string {
  try {
    return cronstrue.toString(expression, {
      throwExceptionOnParseError: true,
      use24HourTimeFormat: false,
    });
  } catch {
    return "Invalid cron expression";
  }
}

export function getCronFieldExplanation(expression: string): {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
} | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return {
    minute: explainField(minute, "minute"),
    hour: explainField(hour, "hour"),
    dayOfMonth: explainField(dayOfMonth, "day of month"),
    month: explainField(month, "month"),
    dayOfWeek: explainField(dayOfWeek, "day of week"),
  };
}

function explainField(
  value: string,
  fieldName: string
): string {
  if (value === "*") {
    return `every ${fieldName}`;
  }

  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `every ${step} ${fieldName}(s)`;
  }

  if (value.includes(",")) {
    return `at ${fieldName}(s) ${value}`;
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${fieldName}s ${start} through ${end}`;
  }

  return `at ${fieldName} ${value}`;
}
