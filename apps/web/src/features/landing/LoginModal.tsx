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
    signInWithGoogle,
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  // Real Google OAuth Trigger
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle(selectedRealm);
      if (error) {
        setErrorMessage(
          error.message ||
            "Unable to connect with Google OAuth. Please check provider configuration."
        );
        setIsGoogleLoading(false);
      }
      // On success, browser redirects automatically to Google OAuth consent URL
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google authentication.");
      setIsGoogleLoading(false);
    }
  };

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
          "Your email address has not been verified yet. Please check your inbox for the confirmation link."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#090D1B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-[#11182B] border border-[#263152] shadow-2xl p-6 sm:p-8 text-[#F4F5FA]">
        
        {/* Subtle decorative top hairline in primary violet */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7047EB] to-transparent" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-lg text-[#9CA3B8] hover:text-[#F4F5FA] hover:bg-[#171D35] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7047EB] via-[#4F46E5] to-[#22B8CF] flex items-center justify-center font-black text-white text-base shadow-md shadow-[#7047EB]/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-[#F4F5FA]">Balaga</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22B8CF] border border-[#22B8CF]/30 px-1.5 py-0.5 rounded bg-[#22B8CF]/10">
                Sovereign Auth
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3B8]">One account. Two independent worlds.</p>
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
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE: SIGN UP (REGISTRATION)
        ───────────────────────────────────────────────────────────── */}
        {mode === "signup" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Create your Balaga account
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1">
                Your sovereign credential for authentic social discovery and founder ventures.
              </p>
            </div>

            {/* FULL-WIDTH GOOGLE OAUTH BUTTON */}
            <div className="mb-5 space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#111827] text-xs sm:text-sm font-semibold transition border border-[#E5E7EB] shadow-sm flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#7047EB]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Visual Separator: OR CONTINUE WITH EMAIL */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#263152] w-full" />
                <span className="bg-[#11182B] px-3 text-[10px] font-mono tracking-wider uppercase text-[#9CA3B8] whitespace-nowrap shrink-0">
                  or continue with email
                </span>
                <div className="border-t border-[#263152] w-full" />
              </div>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B8] hover:text-[#F4F5FA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Validation Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#171D35] border border-[#263152] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#9CA3B8] font-mono">
                      <span>Password Strength</span>
                      <span className={passwordScore >= 4 ? "text-[#22B8CF]" : "text-amber-400"}>
                        {passwordScore <= 2 ? "Weak" : passwordScore <= 3 ? "Good" : "Strong"}
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="h-1 rounded-full bg-[#090D1B] overflow-hidden flex gap-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordScore <= 2
                            ? "bg-rose-500"
                            : passwordScore <= 3
                            ? "bg-amber-500"
                            : "bg-[#7047EB]"
                        }`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                      <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? "text-[#22B8CF]" : "text-[#9CA3B8]/60"}`}>
                        <Check className="w-3 h-3" /> 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? "text-[#22B8CF]" : "text-[#9CA3B8]/60"}`}>
                        <Check className="w-3 h-3" /> Upper & Lowercase
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-[#22B8CF]" : "text-[#9CA3B8]/60"}`}>
                        <Check className="w-3 h-3" /> Contains Number
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-[#22B8CF]" : "text-[#9CA3B8]/60"}`}>
                        <Check className="w-3 h-3" /> Special Character
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Starting Realm Selection */}
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Initial Starting Realm
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRealm("socializing")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRealm === "socializing"
                        ? "bg-[#171D35] border-[#7047EB] shadow-sm shadow-[#7047EB]/20"
                        : "bg-[#090D1B] border-[#263152] text-[#9CA3B8] hover:border-[#7047EB]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Heart className={`w-3.5 h-3.5 ${selectedRealm === "socializing" ? "text-[#7047EB]" : "text-[#9CA3B8]"}`} />
                        <span className={`text-xs font-bold ${selectedRealm === "socializing" ? "text-[#F4F5FA]" : "text-[#9CA3B8]"}`}>
                          Socializing
                        </span>
                      </div>
                      {selectedRealm === "socializing" && (
                        <div className="w-2 h-2 rounded-full bg-[#22B8CF]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#9CA3B8] leading-tight">
                      Culture, vernacular reels & local circles
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRealm("founders")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRealm === "founders"
                        ? "bg-[#171D35] border-[#7047EB] shadow-sm shadow-[#7047EB]/20"
                        : "bg-[#090D1B] border-[#263152] text-[#9CA3B8] hover:border-[#7047EB]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Rocket className={`w-3.5 h-3.5 ${selectedRealm === "founders" ? "text-[#7047EB]" : "text-[#9CA3B8]"}`} />
                        <span className={`text-xs font-bold ${selectedRealm === "founders" ? "text-[#F4F5FA]" : "text-[#9CA3B8]"}`}>
                          Founders
                        </span>
                      </div>
                      {selectedRealm === "founders" && (
                        <div className="w-2 h-2 rounded-full bg-[#22B8CF]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#9CA3B8] leading-tight">
                      Startup hub, Twenty ATS & mentor network
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#8059F2] active:bg-[#6035DA] disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-[#7047EB]/25 flex items-center justify-center gap-2 mt-2"
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
              <p className="text-[10px] text-[#9CA3B8] text-center leading-relaxed">
                By registering, you confirm you are 18+ and agree to Balaga's{" "}
                <span className="text-[#F4F5FA] underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-[#F4F5FA] underline cursor-pointer">Zero-Bleed Privacy Policy</span>.
              </p>
            </form>

            {/* Switch to Login */}
            <div className="mt-5 pt-4 border-t border-[#263152] text-center text-xs text-[#9CA3B8]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#7047EB] hover:text-[#8059F2] font-semibold transition"
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
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Sign in to Balaga
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1">
                Enter your verified credentials or continue with Google to access your account.
              </p>
            </div>

            {/* FULL-WIDTH GOOGLE OAUTH BUTTON */}
            <div className="mb-5 space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#111827] text-xs sm:text-sm font-semibold transition border border-[#E5E7EB] shadow-sm flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#7047EB]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Visual Separator: OR CONTINUE WITH EMAIL */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#263152] w-full" />
                <span className="bg-[#11182B] px-3 text-[10px] font-mono tracking-wider uppercase text-[#9CA3B8] whitespace-nowrap shrink-0">
                  or continue with email
                </span>
                <div className="border-t border-[#263152] w-full" />
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#F4F5FA]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-[#22B8CF] hover:text-[#7047EB] transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B8] hover:text-[#F4F5FA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#8059F2] active:bg-[#6035DA] disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-[#7047EB]/25 flex items-center justify-center gap-2 mt-2"
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
            <div className="mt-5 pt-4 border-t border-[#263152] text-center text-xs text-[#9CA3B8]">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#7047EB] hover:text-[#8059F2] font-semibold transition"
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
            {/* Minimalist Abstract Illustration in Violet / Indigo */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#171D35] border border-[#7047EB]/40 flex items-center justify-center text-[#7047EB] shadow-inner shadow-[#7047EB]/20">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Check your inbox
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1 max-w-sm mx-auto leading-relaxed">
                We sent a secure confirmation link to{" "}
                <span className="text-[#F4F5FA] font-mono font-medium">
                  {maskEmail(email) || "your email"}
                </span>
                . You must click the link to verify your account before accessing Balaga.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090D1B] border border-[#263152] text-left text-xs text-[#9CA3B8] space-y-1.5">
              <div className="font-semibold text-[#F4F5FA] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22B8CF]" />
                <span>Next steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#9CA3B8]">
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
                className="w-full py-2.5 rounded-xl bg-[#171D35] hover:bg-[#263152] disabled:opacity-50 text-[#F4F5FA] text-xs font-semibold transition border border-[#263152] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-[#22B8CF]" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Resend verification email"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-[#9CA3B8] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="hover:text-[#F4F5FA] transition"
                >
                  Change email address
                </button>
                <span className="text-[#263152]">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#7047EB] hover:text-[#8059F2] transition font-medium"
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#171D35] border border-[#7047EB]/50 flex items-center justify-center text-[#22B8CF] shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Email verified successfully
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1 max-w-sm mx-auto leading-relaxed">
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
              className="w-full py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#8059F2] text-white text-xs font-bold transition flex items-center justify-center gap-2 mt-4"
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
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Reset your password
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1">
                Enter your registered email address to receive secure reset instructions.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#8059F2] disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-[#7047EB]/25 flex items-center justify-center gap-2"
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

            <div className="mt-5 pt-4 border-t border-[#263152] text-center text-xs text-[#9CA3B8]">
              Remember your credentials?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#7047EB] hover:text-[#8059F2] font-semibold transition"
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
              <h2 className="text-xl font-bold tracking-tight text-[#F4F5FA]">
                Set a new password
              </h2>
              <p className="text-xs text-[#9CA3B8] mt-1">
                Create a secure password for your sovereign account.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B8] hover:text-[#F4F5FA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F4F5FA] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#263152] text-xs text-[#F4F5FA] placeholder-[#9CA3B8]/60 focus:outline-none focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB]/50 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#7047EB] hover:bg-[#8059F2] disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-[#7047EB]/25 flex items-center justify-center gap-2"
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
