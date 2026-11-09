import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Heart,
  Rocket,
  Check,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export type AuthModalMode =
  | "login"
  | "signup"
  | "verify"
  | "confirmed"
  | "forgot_password"
  | "reset_password";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (realm?: "socializing" | "founders") => void;
  initialMode?: AuthModalMode;
  initialMessage?: string | null;
}

function maskEmail(rawEmail: string): string {
  if (!rawEmail || !rawEmail.includes("@")) return rawEmail;
  const [user, domain] = rawEmail.split("@");
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  const maskedLength = Math.min(user.length - 2, 4);
  return `${user[0]}${"*".repeat(maskedLength)}${user[user.length - 1]}@${domain}`;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
  initialMessage = null,
}) => {
  const {
    loginWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    resetPasswordForEmail,
    updateUserPassword,
  } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState<"socializing" | "founders">("socializing");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialMessage);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email verification resend cooldown timer (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(initialMessage);
      setSuccessMessage(null);
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, initialMode, initialMessage]);

  // Password Validation Criteria
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper) score += 1;
    if (passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithEmail(cleanEmail, password);
      if (result.unverified) {
        setErrorMessage(
          "Your email address has not been verified yet. Please click the link sent to your inbox."
        );
        setMode("verify");
        return;
      }

      if (result.error) {
        setErrorMessage(result.error.message || "Invalid email or password.");
        return;
      }

      setSuccessMessage("Authentication verified. Entering Balaga...");
      setTimeout(() => {
        onSuccess(selectedRealm);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (passwordScore < 3 || password.length < 8) {
      setErrorMessage(
        "Please create a stronger password with at least 8 characters including mixed case and numbers."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUpWithEmail(cleanEmail, password, selectedRealm);
      if (result.error) {
        setErrorMessage(result.error.message || "Failed to create account.");
        return;
      }

      // Mandatory Email Verification flow
      if (result.needsVerification) {
        setMode("verify");
        setResendCooldown(60);
      } else {
        // If instant confirmation is active in local mock/staging
        setSuccessMessage("Account created successfully!");
        setTimeout(() => {
          onSuccess(selectedRealm);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Verification
  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { error } = await resendVerificationEmail(email);
      if (error) {
        setErrorMessage(error.message || "Failed to resend verification email.");
      } else {
        setSuccessMessage("Verification link resent. Please check your inbox and spam folder.");
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPasswordForEmail(cleanEmail);
      if (error) {
        setErrorMessage(error.message || "Failed to send reset instructions.");
      } else {
        setSuccessMessage("Password reset instructions sent. Please check your email.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Update (after recovery link)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updateUserPassword(password);
      if (error) {
        setErrorMessage(error.message || "Failed to update password.");
      } else {
        setSuccessMessage("Password updated successfully. Please sign in with your new credentials.");
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#07090e]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0f17] border border-[#1e293b] shadow-2xl p-6 sm:p-9 text-[#f1f5f9] overflow-hidden">
        
        {/* Subtle decorative top hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14b8a6] via-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-black text-white text-base shadow-md shadow-teal-900/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">Balaga</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded bg-teal-950/30">
                Sovereign Auth
              </span>
            </div>
            <p className="text-[11px] text-slate-400">One account. Two independent worlds.</p>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-teal-950/40 border border-teal-700/60 text-xs text-teal-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: SIGN UP (REGISTRATION)
        ───────────────────────────────────────────────────────────── */}
        {mode === "signup" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Create your Balaga account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your sovereign credential for authentic social discovery and founder ventures.
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Validation Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Password Strength</span>
                      <span className={passwordScore >= 4 ? "text-teal-400" : "text-amber-400"}>
                        {passwordScore <= 2 ? "Weak" : passwordScore <= 3 ? "Good" : "Strong"}
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-1 rounded-full bg-slate-800 overflow-hidden flex gap-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordScore <= 2
                            ? "bg-rose-500"
                            : passwordScore <= 3
                            ? "bg-amber-500"
                            : "bg-teal-400"
                        }`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                      <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? "text-teal-400" : "text-slate-500"}`}>
                        <Check className="w-3 h-3" /> 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? "text-teal-400" : "text-slate-500"}`}>
                        <Check className="w-3 h-3" /> Upper & Lowercase
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-teal-400" : "text-slate-500"}`}>
                        <Check className="w-3 h-3" /> Contains Number
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-teal-400" : "text-slate-500"}`}>
                        <Check className="w-3 h-3" /> Special Character
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Starting Realm Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Initial Starting Realm
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRealm("socializing")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRealm === "socializing"
                        ? "bg-[#111827] border-teal-500/60 shadow-sm shadow-teal-900/20"
                        : "bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Heart className={`w-3.5 h-3.5 ${selectedRealm === "socializing" ? "text-teal-400" : "text-slate-500"}`} />
                        <span className={`text-xs font-bold ${selectedRealm === "socializing" ? "text-white" : "text-slate-300"}`}>
                          Socializing
                        </span>
                      </div>
                      {selectedRealm === "socializing" && (
                        <div className="w-2 h-2 rounded-full bg-teal-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Culture, vernacular reels & local circles
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRealm("founders")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRealm === "founders"
                        ? "bg-[#111827] border-teal-500/60 shadow-sm shadow-teal-900/20"
                        : "bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Rocket className={`w-3.5 h-3.5 ${selectedRealm === "founders" ? "text-teal-400" : "text-slate-500"}`} />
                        <span className={`text-xs font-bold ${selectedRealm === "founders" ? "text-white" : "text-slate-300"}`}>
                          Founders
                        </span>
                      </div>
                      {selectedRealm === "founders" && (
                        <div className="w-2 h-2 rounded-full bg-teal-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Startup hub, Twenty ATS & mentor network
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-teal-950 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Legal & Terms */}
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                By registering, you confirm you are 18+ and agree to Balaga's{" "}
                <span className="text-slate-400 underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-slate-400 underline cursor-pointer">Zero-Bleed Privacy Policy</span>.
              </p>
            </form>

            {/* Switch to Login */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold transition"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: SIGN IN (LOGIN)
        ───────────────────────────────────────────────────────────── */}
        {mode === "login" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Sign in to Balaga
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your verified email and password to access your sovereign account.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-teal-950 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Signup */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold transition"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: VERIFY EMAIL (MANDATORY VERIFICATION REQUIRED)
        ───────────────────────────────────────────────────────────── */}
        {mode === "verify" && (
          <div className="text-center py-2 space-y-4">
            {/* Minimalist Abstract Illustration */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Check your inbox
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                We sent a secure confirmation link to{" "}
                <span className="text-slate-200 font-mono font-medium">
                  {maskEmail(email) || "your email"}
                </span>
                . You must click the link to verify your account before accessing Balaga.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-left text-xs text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Next steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>Open the email sent from Balaga.</li>
                <li>Click <strong>Confirm your email</strong>.</li>
                <li>Return here to sign in with your credentials.</li>
              </ol>
            </div>

            {/* Resend Action */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading || resendCooldown > 0}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Resend verification email"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="hover:text-slate-200 transition"
                >
                  Change email address
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-teal-400 hover:text-teal-300 transition font-medium"
                >
                  Return to sign in
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: CONFIRMED (EMAIL VERIFIED CONFIRMATION SCREEN)
        ───────────────────────────────────────────────────────────── */}
        {mode === "confirmed" && (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-950/40 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Email verified successfully
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Your sovereign account is now confirmed and authorized. You can sign in to traverse both Socializing and Founders realms.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage("Account ready. Please sign in.");
              }}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 mt-4"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: FORGOT PASSWORD
        ───────────────────────────────────────────────────────────── */}
        {mode === "forgot_password" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Reset your password
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered email address to receive secure reset instructions.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-teal-950 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending instructions...</span>
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Remember your credentials?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold transition"
              >
                Return to sign in
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: RESET PASSWORD (NEW PASSWORD INPUT)
        ───────────────────────────────────────────────────────────── */}
        {mode === "reset_password" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Set a new password
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create a secure password for your sovereign account.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-teal-950 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
