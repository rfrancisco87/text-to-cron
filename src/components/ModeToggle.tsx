"use client";

import { motion } from "framer-motion";

export type Mode = "text-to-cron" | "cron-to-text";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
      <TabButton
        active={mode === "text-to-cron"}
        onClick={() => onChange("text-to-cron")}
      >
        Text to Cron
      </TabButton>
      <TabButton
        active={mode === "cron-to-text"}
        onClick={() => onChange("cron-to-text")}
      >
        Cron to Text
      </TabButton>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active ? "text-white" : "text-zinc-400 hover:text-zinc-300"
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-zinc-700 rounded-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
