"use client";

import { motion } from "framer-motion";
import { formatDate, getRelativeTime } from "@/lib/cron/validator";

interface NextExecutionsProps {
  dates: Date[];
}

export function NextExecutions({ dates }: NextExecutionsProps) {
  if (dates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-medium text-zinc-400">Next 5 executions</h3>
      <ul className="space-y-2">
        {dates.map((date, index) => (
          <motion.li
            key={date.toISOString()}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-2"
          >
            <span className="text-zinc-300">{formatDate(date)}</span>
            <span className="text-sm text-zinc-500">{getRelativeTime(date)}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
