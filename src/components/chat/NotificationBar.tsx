export default function NotificationBar({ text }: { text: string }) {
  return (
    <div
      className="
        flex shrink-0 items-center gap-1.75
        border-t border-green-500/25
        bg-green-500/10
        px-3.5 py-2.25
        text-[11px] text-green-500
      "
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>

      <span>
        {text}
      </span>
    </div>
  );
}
