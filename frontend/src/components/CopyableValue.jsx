import { useState } from "react";

export default function CopyableValue({ value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for browsers without Clipboard API access (e.g. non-HTTPS)
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center justify-between gap-2 text-left"
    >
      <span className="font-bold text-gold-light">{value}</span>
      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
          copied ? "bg-emerald-500 text-ink" : "bg-white/10 text-white/70 hover:bg-white/20"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
