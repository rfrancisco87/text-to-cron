"use client";

import { motion } from "framer-motion";

interface TextToCronInputProps {
  value: string;
  onChange: (value: string) => void;
  onExampleClick: (example: string) => void;
}

const EXAMPLES = [
  "every 5 minutes",
  "daily at 9am",
  "every Monday at 3pm",
  "weekdays at 8:30am",
  "1st of every month",
  "every hour",
];

export function TextToCronInput({
  value,
  onChange,
  onExampleClick,
}: TextToCronInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="natural-language"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Describe your schedule
        </label>
        <motion.textarea
          id="natural-language"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., every Monday at 3:30 PM"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg
            text-white placeholder-zinc-500 focus:outline-none focus:ring-2
            focus:ring-blue-500 focus:border-transparent resize-none text-lg"
          rows={2}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 mr-2 self-center">Examples:</span>
        {EXAMPLES.map((example) => (
          <motion.button
            key={example}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExampleClick(example)}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400
              hover:text-zinc-300 rounded-full transition-colors border border-zinc-700"
          >
            {example}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
