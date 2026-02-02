"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ModeToggle, Mode } from "@/components/ModeToggle";
import { FormatToggle } from "@/components/FormatToggle";
import { TextToCronInput } from "@/components/TextToCronInput";
import { CronInput } from "@/components/CronInput";
import { CronResult } from "@/components/CronResult";
import { NextExecutions } from "@/components/NextExecutions";
import { Card } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";
import { parseNaturalLanguage } from "@/lib/nlp/parser";
import { validateCron, getNextExecutions } from "@/lib/cron/validator";
import { cronToHumanReadable } from "@/lib/cron/explainer";
import type { CronFormat } from "@/lib/nlp/types";

interface Result {
  cron: string;
  humanReadable: string;
  nextExecutions: Date[];
  confidence?: "high" | "medium" | "low";
  warning?: string;
  interpretation?: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("text-to-cron");
  const [format, setFormat] = useState<CronFormat>("5-field");
  const [textInput, setTextInput] = useState("");
  const [cronInput, setCronInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedTextInput = useDebounce(textInput, 300);
  const debouncedCronInput = useDebounce(cronInput, 300);

  // Text to Cron processing
  useEffect(() => {
    if (mode !== "text-to-cron") return;

    if (!debouncedTextInput.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    const parsed = parseNaturalLanguage(debouncedTextInput, format);

    if (parsed.cron) {
      const nextDates = getNextExecutions(parsed.cron, 5, format);
      // For human readable, use 5-field version
      const cronFor5Field = format === "6-field"
        ? parsed.cron.split(" ").slice(1).join(" ")
        : parsed.cron;
      setResult({
        cron: parsed.cron,
        humanReadable: cronToHumanReadable(cronFor5Field),
        nextExecutions: nextDates,
        confidence: parsed.confidence,
        warning: parsed.warning,
        interpretation: parsed.interpretation,
      });
      setError(null);
    } else {
      setResult(null);
      setError(parsed.error || "Could not parse input");
    }
  }, [debouncedTextInput, mode, format]);

  // Cron to Text processing
  useEffect(() => {
    if (mode !== "cron-to-text") return;

    if (!debouncedCronInput.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    const validation = validateCron(debouncedCronInput, format);

    if (validation.isValid) {
      const nextDates = getNextExecutions(debouncedCronInput, 5, format);
      // For human readable, use 5-field version
      const cronFor5Field = format === "6-field"
        ? debouncedCronInput.split(" ").slice(1).join(" ")
        : debouncedCronInput;
      setResult({
        cron: debouncedCronInput,
        humanReadable: cronToHumanReadable(cronFor5Field),
        nextExecutions: nextDates,
      });
      setError(null);
    } else {
      setResult(null);
      setError(validation.error || "Invalid cron expression");
    }
  }, [debouncedCronInput, mode, format]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
  };

  const handleExampleClick = (example: string) => {
    setTextInput(example);
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Header />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <FormatToggle format={format} onChange={setFormat} />
        </div>

        <Card className="mb-6">
          <AnimatePresence mode="wait">
            {mode === "text-to-cron" ? (
              <motion.div
                key="text-to-cron"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <TextToCronInput
                  value={textInput}
                  onChange={setTextInput}
                  onExampleClick={handleExampleClick}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cron-to-text"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CronInput
                  value={cronInput}
                  onChange={setCronInput}
                  isValid={!error && cronInput.trim().length > 0}
                  error={error || undefined}
                  format={format}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <AnimatePresence mode="wait">
          {error && mode === "text-to-cron" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-red-500/30 bg-red-500/5">
                <p className="text-red-400">{error}</p>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6">
                <CronResult
                  cron={result.cron}
                  humanReadable={result.humanReadable}
                  confidence={result.confidence}
                  warning={result.warning}
                  interpretation={result.interpretation}
                />
              </Card>

              <Card>
                <NextExecutions dates={result.nextExecutions} />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 text-center text-zinc-600 text-sm">
          <p>
            Open source on{" "}
            <a
              href="https://github.com"
              className="text-zinc-400 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
