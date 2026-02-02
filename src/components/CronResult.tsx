"use client";

import { motion } from "framer-motion";
import { CopyButton } from "./ui/CopyButton";

interface CronResultProps {
  cron: string;
  humanReadable: string;
  confidence?: "high" | "medium" | "low";
  warning?: string;
  interpretation?: string;
}

export function CronResult({
  cron,
  humanReadable,
  confidence,
  warning,
  interpretation,
}: CronResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Result</h3>
        {confidence && <ConfidenceBadge confidence={confidence} />}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
          <code className="text-2xl font-mono text-white">{cron}</code>
        </div>
        <CopyButton text={cron} />
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3">
        <p className="text-zinc-300">{humanReadable}</p>
      </div>

      {interpretation && (
        <p className="text-sm text-zinc-500">
          Interpreted as: {interpretation}
        </p>
      )}

      {warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <WarningIcon />
            <p className="text-sm text-yellow-200">{warning}</p>
          </div>
        </motion.div>
      )}

      <CronBreakdown cron={cron} />
    </motion.div>
  );
}

function CronBreakdown({ cron }: { cron: string }) {
  const parts = cron.split(" ");

  const fields5 = [
    { label: "Minute", range: "0-59" },
    { label: "Hour", range: "0-23" },
    { label: "Day", range: "1-31" },
    { label: "Month", range: "1-12" },
    { label: "Weekday", range: "0-6" },
  ];

  const fields6 = [
    { label: "Second", range: "0-59" },
    { label: "Minute", range: "0-59" },
    { label: "Hour", range: "0-23" },
    { label: "Day", range: "1-31" },
    { label: "Month", range: "1-12" },
    { label: "Weekday", range: "0-6" },
  ];

  const fields = parts.length === 6 ? fields6 : parts.length === 5 ? fields5 : null;
  if (!fields) return null;

  return (
    <div className={`grid gap-2 mt-4 ${parts.length === 6 ? "grid-cols-6" : "grid-cols-5"}`}>
      {fields.map((field, index) => (
        <div
          key={field.label}
          className="text-center bg-zinc-800/50 rounded-lg py-2 px-1"
        >
          <div className="font-mono text-lg text-white">{parts[index]}</div>
          <div className="text-xs text-zinc-500">{field.label}</div>
          <div className="text-xs text-zinc-600">{field.range}</div>
        </div>
      ))}
    </div>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: "high" | "medium" | "low";
}) {
  const colors = {
    high: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[confidence]}`}
    >
      {confidence} confidence
    </span>
  );
}

function WarningIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-yellow-400 flex-shrink-0 mt-0.5"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
