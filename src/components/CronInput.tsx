"use client";

import { motion } from "framer-motion";
import type { CronFormat } from "@/lib/nlp/types";

interface CronInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
  format?: CronFormat;
}

const CRON_EXAMPLES_5 = [
  { cron: "*/5 * * * *", label: "Every 5 min" },
  { cron: "0 9 * * *", label: "Daily 9am" },
  { cron: "0 9 * * 1-5", label: "Weekdays 9am" },
  { cron: "0 0 1 * *", label: "Monthly" },
];

const CRON_EXAMPLES_6 = [
  { cron: "0 */5 * * * *", label: "Every 5 min" },
  { cron: "0 0 9 * * *", label: "Daily 9am" },
  { cron: "0 0 9 * * 1-5", label: "Weekdays 9am" },
  { cron: "0 0 0 1 * *", label: "Monthly" },
];

export function CronInput({ value, onChange, isValid, error, format = "5-field" }: CronInputProps) {
  // Auto-detect format from current value for display
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const detectedFormat: CronFormat = parts.length === 6 ? "6-field" : "5-field";
  const displayFormat = value.trim() ? detectedFormat : format;

  const examples = [...CRON_EXAMPLES_5, ...CRON_EXAMPLES_6];
  const placeholder = "* * * * * or 0 * * * * *";
  const formatHint = displayFormat === "6-field"
    ? "second minute hour day month weekday"
    : "minute hour day month weekday";
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="cron-expression"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Enter cron expression
        </label>
        <div className="relative">
          <motion.input
            id="cron-expression"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white
              placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent
              font-mono text-lg ${
                value && !isValid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-700 focus:ring-blue-500"
              }`}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          {value && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isValid ? "text-green-500" : "text-red-500"
              }`}
            >
              {isValid ? <CheckCircle /> : <XCircle />}
            </motion.div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>Format:</span>
        <code className="bg-zinc-800 px-2 py-1 rounded font-mono">
          {formatHint}
        </code>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 mr-2 self-center">Examples:</span>
        {examples.map(({ cron, label }) => (
          <motion.button
            key={cron}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(cron)}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400
              hover:text-zinc-300 rounded-full transition-colors border border-zinc-700"
          >
            <span className="font-mono">{cron}</span>
            <span className="text-zinc-500 ml-1">({label})</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
