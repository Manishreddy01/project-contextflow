// src/components/AuthScreen.jsx
import { useEffect, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function AuthScreen({ onAuthSuccess }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scriptId = "google-identity-services";

    const handleCredentialResponse = (response) => {
      setError(null);

      fetch(`${BACKEND_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || "Authentication failed");
          }
          return res.json();
        })
        .then((data) => {
          if (typeof onAuthSuccess === "function") {
            onAuthSuccess(data);
          }
        })
        .catch((err) => {
          console.error("Auth error:", err);
          setError(err.message || "Authentication failed");
        });
    };

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          shape: "pill",
          text: "continue_with",
        });
      } catch (e) {
        console.error("GSI init error", e);
        setError("Authentication unavailable.");
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => setError("Failed to load Google auth.");
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [onAuthSuccess]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-900">
      <div className="w-full max-w-md px-6">
        {/* Card with NO white border, just a soft shadow */}
        <div className="bg-slate-900/85 rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] px-8 py-10 backdrop-blur-sm text-white">
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md shadow-indigo-900/70">
              CF
            </div>

            {/* Title + subtitle */}
            <div className="text-center space-y-2">
            <h1
              className="font-extrabold tracking-tight text-white"
              style={{
                fontSize: "2.75rem",      // ~text-4xl / 5xl
                lineHeight: "1.1",
                letterSpacing: "-0.03em",
              }}
            >
              ContextFlow
            </h1>
            <p className="text-sm text-slate-200/85">
              Sign in to chat with your AI agent
            </p>
          </div>

            {/* Google button */}
            <div ref={buttonRef} className="mt-4" />

            {/* Error, if any */}
            {error && (
              <p className="mt-3 text-xs text-red-300 text-center">
                Error: {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
