/** The KicksControl wordmark: a stub of label barcode, then the name. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[1.375rem] font-extrabold tracking-[-0.04em] ${className}`}>
      <svg viewBox="0 0 14 16" className="h-[0.8em] w-auto" fill="currentColor" aria-hidden>
        <rect x="0" width="2" height="16" /><rect x="3.5" width="1" height="16" /><rect x="6" width="3" height="16" />
        <rect x="10.5" width="1" height="16" /><rect x="13" width="1" height="16" />
      </svg>
      KICKSCONTROL
    </span>
  )
}
