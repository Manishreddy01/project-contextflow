// src/components/Navbar.jsx
import { motion } from "framer-motion";
import logo from "../assets/AuroraLogo.png";

export default function Navbar({ user, onLogout }) {
  const hasUser = !!(user && user.email);

  const displayName = hasUser
    ? user.name || user.email.split("@")[0]
    : "";
  const email = hasUser ? user.email : "";
  const initial = hasUser
    ? (displayName || email || "U").charAt(0).toUpperCase()
    : "U";

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-900"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand (left) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden shadow shadow-black/40">
            <img
              src={logo}
              alt="ContextFlow logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              ContextFlow
            </span>
            <span className="text-xs text-slate-300/80">
              Your personal RAG &amp; web agent
            </span>
          </div>
        </div>

        {/* User info + logout (right) – only when logged in */}
        {hasUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                {initial}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm text-white">{displayName}</span>
                <span className="text-[11px] text-slate-300/80">
                  {email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/10 transition"
              style={{ color: "#ffffff" }}  // 🔥 force white text
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
