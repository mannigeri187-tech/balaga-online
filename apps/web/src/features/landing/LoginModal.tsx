import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Rocket,
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (realm?: "socializing" | "founders") => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithEmail, signUpWithEmail, loginAsDemo } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRealm, setSelectedRealm] = useState<"socializing" | "founders">("socializing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = (profile: "aarav" | "priya") => {
    loginAsDemo(profile);
    const realm = profile === "priya" ? "founders" : "socializing";
    onSuccess(realm);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await loginWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message || "Failed to log in. Please check your credentials.");
        } else {
          setSuccessMessage("Welcome back! Entering Balaga...");
          setTimeout(() => {
            onSuccess(selectedRealm);
            onClose();
          }, 600);
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message || "Failed to create account.");
        } else {
          setSuccessMessage("Account created successfully! Check your email or continue.");
          setTimeout(() => {
            onSuccess(selectedRealm);
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unexpected authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-600/20 to-emerald-500/20 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
            B
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {mode === "login" ? "Welcome to Balaga" : "Create Your Balaga Account"}
            </h2>
            <p className="text-xs text-slate-400">
              India's Premier Dual-Realm Community & Founder Network
            </p>
          </div>
        </div>

        {/* 1-CLICK INSTANT DEMO PROFILES */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click Demo Profiles</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">No Pass Required</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin("aarav")}
              className="p-2.5 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/50 hover:border-violet-600 text-left transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Aarav</span>
              </div>
              <p className="text-[10px] text-violet-300 font-medium">Social Explorer</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Kannada, Hindi, Media</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("priya")}
              className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 hover:border-emerald-600 text-left transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Priya</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-medium">Tech Founder</p>
              <p className="text-[9px] text-slate-400 mt-0.5">SaaS, Kanban, AI/ML</p>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            or with credentials
          </span>
        </div>

        {/* Error or Success notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Destination Realm Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Starting Realm
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRealm("socializing")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  selectedRealm === "socializing"
                    ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-900/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Socializing</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRealm("founders")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  selectedRealm === "founders"
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Founders</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Sign In & Enter Realm" : "Register & Start Building"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setErrorMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {mode === "login" ? (
              <span>
                New here? <span className="text-emerald-400 font-bold">Create an account</span>
              </span>
            ) : (
              <span>
                Already have an account? <span className="text-violet-400 font-bold">Sign In</span>
              </span>
            )}
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with Supabase Auth & RLS Policy Isolation</span>
        </div>
      </div>
    </div>
  );
};
