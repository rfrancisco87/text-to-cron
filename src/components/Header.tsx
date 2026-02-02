"use client";

import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl font-bold text-white mb-2">
        Text to Cron
      </h1>
      <p className="text-zinc-400 max-w-md mx-auto">
        Convert natural language schedules to cron expressions and vice versa.
        Simple, fast, and free.
      </p>
    </motion.header>
  );
}
