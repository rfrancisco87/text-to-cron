import { useState, useCallback } from "react";

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useClipboard(resetDelay: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, resetDelay);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    },
    [resetDelay]
  );

  return { copied, copy };
}
