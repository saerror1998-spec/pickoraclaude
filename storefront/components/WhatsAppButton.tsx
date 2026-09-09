const WHATSAPP_NUMBER = "971524078652";
const PREFILLED_MESSAGE = "Hi, I have a question about a laptop on Pickora.";

/**
 * Floating WhatsApp chat link — the real Pickora Business number. Positioned
 * above MobileDock's fixed bottom nav on small screens (which reserves
 * ~76px), flush to the corner on desktop where MobileDock is hidden.
 */
export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Pickora on WhatsApp"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-deep)] transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-105 lg:bottom-6 lg:right-6"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.4 5.12L2 22l5.14-1.5a9.85 9.85 0 0 0 4.9 1.32h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.1h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.05.89.89-2.97-.2-.31a8.14 8.14 0 0 1-1.27-4.47c0-4.5 3.66-8.16 8.15-8.16a8.1 8.1 0 0 1 5.76 2.39 8.09 8.09 0 0 1 2.39 5.77c0 4.5-3.67 8.19-8.17 8.19Zm4.47-6.12c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.17-1.39-1.31-1.63-.14-.24-.01-.37.11-.49.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.05-.33-.03-.45-.08-.12-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38-.13-.01-.27-.01-.42-.01a.8.8 0 0 0-.58.27c-.2.22-.76.75-.76 1.83s.78 2.12.89 2.27c.11.15 1.51 2.3 3.66 3.13 1.83.71 2.2.57 2.6.53.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.44-.27Z" />
      </svg>
    </a>
  );
}
