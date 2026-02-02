"use client";

import { motion } from "framer-motion";
import type { CronFormat } from "@/lib/nlp/types";

interface FormatToggleProps {
  format: CronFormat;
  onChange: (format: CronFormat) => void;
}

export function FormatToggle({ format, onChange }: FormatToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-500">Format:</span>
      <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
        <FormatButton
          active={format === "5-field"}
          onClick={() => onChange("5-field")}
          tooltip="minute hour day month weekday"
        >
          5-field
        </FormatButton>
        <FormatButton
          active={format === "6-field"}
          onClick={() => onChange("6-field")}
          tooltip="second minute hour day month weekday"
        >
          6-field
        </FormatButton>
      </div>
    </div>
  );
}

interface FormatButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
}

function FormatButton({ active, onClick, children, tooltip }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active ? "text-white" : "text-zinc-400 hover:text-zinc-300"
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeFormat"
          className="absolute inset-0 bg-zinc-700 rounded-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
