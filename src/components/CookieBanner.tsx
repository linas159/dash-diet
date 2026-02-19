"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto">
        <p className="text-xs text-gray-600 mb-3">
          We use essential cookies to make our site work. By clicking
          &quot;Accept&quot;, you consent to our use of cookies as described in
          our{" "}
          <a href="/cookies" className="text-dash-blue underline">
            Cookie Policy
          </a>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 bg-dash-blue text-white text-xs font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-gray-100 text-gray-600 text-xs font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
