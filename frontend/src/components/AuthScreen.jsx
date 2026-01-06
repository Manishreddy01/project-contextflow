// src/components/AuthScreen.jsx
import { useEffect, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthScreen({ onAuthSuccess }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Missing VITE_GOOGLE_CLIENT_ID in .env");
      return;
    }

    // Ensure the Google script exists
    const scriptId = "google-identity-script";
    let script = document.getElementById(scriptId);

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return;

      // Clear any previous button contents on remount
      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });

      // Optional: auto-select last account
      window.google.accounts.id.prompt();
    };

    const handleScriptLoad = () => {
      initGoogle();
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = handleScriptLoad;
      document.body.appendChild(script);
    } else {
      // Script already present (e.g., after logout) – just init immediately
      if (window.google) {
        initGoogle();
      } else {
        script.addEventListener("load", handleScriptLoad);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener?.("load", handleScriptLoad);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCredentialResponse = async (response) => {
  try {
    setError("");

    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: response.credential }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message =
        data?.detail || data?.error || `Auth failed (status ${res.status})`;
      console.error("Auth error response:", message);
      setError(message);
      return;
    }

    const data = await res.json();

    if (typeof onAuthSuccess === "function") {
      onAuthSuccess(data);
    } else {
      console.error("onAuthSuccess prop is missing or not a function");
      setError("App is misconfigured (missing auth callback).");
    }
  } catch (err) {
    console.error("Auth error:", err);
    setError(err?.message || "Authentication failed");
  }
};


  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-lg px-10 py-8 max-w-md w-full border border-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900 text-center">
          Aurora AI
        </h1>
        <p className="mt-2 text-sm text-slate-500 text-center">
          Sign in with Google to access your chats.
        </p>

        <div className="mt-6 flex justify-center">
          <div ref={buttonRef} />
        </div>

        {error && (
          <p className="mt-4 text-sm text-center text-red-600">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
