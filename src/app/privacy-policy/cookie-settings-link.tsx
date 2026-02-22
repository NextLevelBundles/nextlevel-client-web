"use client";

declare global {
  interface Window {
    Cookiebot?: { renew: () => void; show: () => void };
    CookieConsent?: { renew: () => void; show: () => void };
  }
}

export function CookieSettingsLink({
  children,
}: {
  children: React.ReactNode;
}) {
  const openCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    const cb = window.Cookiebot ?? window.CookieConsent;
    if (cb) {
      cb.renew();
    }
  };

  return (
    <a
      href="#cookie-settings"
      className="text-primary hover:underline cursor-pointer"
      onClick={openCookieSettings}
    >
      {children}
    </a>
  );
}
