// src/components/Navbar.jsx
import { motion } from "framer-motion";
import logo from "../assets/AuroraLogo.png";

/**
 * Try to normalize whatever user object we have into:
 * { name?: string, email?: string, picture?: string }
 */
function normalizeUser(raw) {
  if (!raw) return null;
  let u = { ...raw };

  // If backend returned { user: { ... } }
  if (u.user && (u.user.email || u.user.name)) {
    u = { ...u, ...u.user };
  }

  // If we stored { profile: { ... } }
  if (u.profile && (u.profile.email || u.profile.name)) {
    u = { ...u, ...u.profile };
  }

  // If we stored { payload: { ... } } from Google token
  if (u.payload && (u.payload.email || u.payload.name)) {
    u = { ...u, ...u.payload };
  }

  return u;
}

export default function Navbar({ user, onLogout }) {
  // 1️⃣ Pull from localStorage
  let storedUser = null;
  try {
    const raw = localStorage.getItem("aurora_user");
    if (raw) {
      storedUser = normalizeUser(JSON.parse(raw));
    }
  } catch (e) {
    console.warn("Failed to parse aurora_user from localStorage", e);
  }

  // 2️⃣ Normalize prop + stored and merge
  const normPropUser = normalizeUser(user);
  const mergedUser = {
    ...(storedUser || {}),
    ...(normPropUser || {}),
  };

  // For debugging once: you can open console and see what this is
  console.log("Navbar mergedUser =", mergedUser);

  const hasUser = mergedUser && (mergedUser.email || mergedUser.name);

  const displayName =
    mergedUser?.name ||
    (mergedUser?.email
      ? mergedUser.email.split("@")[0] // use part before @ if only email
      : "User");

  const displayEmail = mergedUser?.email || "";
  const initial = (displayName?.[0] || "U").toUpperCase();

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-2 h-12">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Aurora AI Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold text-gray-900">
              Aurora AI
            </span>
            <span className="text-xs text-gray-500">
              Your document copilot
            </span>
          </div>
        </div>

        {/* Right: user info + logout */}
        {hasUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {mergedUser.picture ? (
                <img
                  src={mergedUser.picture}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initial}
                </div>
              )}

              <div className="flex flex-col leading-tight max-w-[180px]">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </span>
                {displayEmail && (
                  <span className="text-xs text-gray-500 truncate">
                    {displayEmail}
                  </span>
                )}
              </div>
            </div>

            {typeof onLogout === "function" && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Log out
              </button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
