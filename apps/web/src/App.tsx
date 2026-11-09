import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WorldProvider, useWorld } from "./contexts/WorldContext";
import { WorldLayout } from "./components/layout/WorldLayout";
import { LandingPageView } from "./features/landing/LandingPageView";
import { LoginModal, AuthModalMode } from "./features/landing/LoginModal";
import { UpiPaymentModal } from "./features/landing/UpiPaymentModal";

const AppContent: React.FC = () => {
  const { switchWorld } = useWorld();
  const { isAuthenticated, isEmailVerified, isLoading: isAuthLoading } = useAuth();

  // Route state: "landing" is the default homepage for https://balaga.online /
  const [currentRoute, setCurrentRoute] = useState<"landing" | "app">(() => {
    if (typeof window === "undefined") return "landing";
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (
      path.startsWith("/app") ||
      path.startsWith("/feed") ||
      path.startsWith("/dashboard") ||
      params.get("view") === "app" ||
      window.location.hash === "#app"
    ) {
      return "app";
    }

    return "landing";
  });

  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(() => {
    if (typeof window === "undefined") return "login";
    const path = window.location.pathname;
    return path === "/signup" || path === "/join" ? "signup" : "login";
  });

  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    return (
      path === "/login" ||
      path === "/signin" ||
      path === "/signup" ||
      path === "/join"
    );
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Email confirmation & password reset hash/query listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const search = window.location.search;
    const params = new URLSearchParams(search);

    // 1. Expired or invalid verification link
    if (hash.includes("error=") || hash.includes("error_code=")) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const errorDesc =
        hashParams.get("error_description") ||
        "The email verification link is invalid or has expired.";
      setAuthModalMode("verify");
      setAuthModalMessage(
        `${errorDesc.replace(/\+/g, " ")} Please request a fresh verification link below.`
      );
      setIsAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // 2. Successful verification return
    else if (hash.includes("type=signup") || hash.includes("type=email_change")) {
      setAuthModalMode("confirmed");
      setAuthModalMessage(null);
      setIsAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // 3. Password recovery return
    else if (hash.includes("type=recovery") || params.get("auth_flow") === "reset_password") {
      setAuthModalMode("reset_password");
      setAuthModalMessage(null);
      setIsAuthModalOpen(true);
    }
  }, []);

  // Synchronize browser history (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);

      if (
        path.startsWith("/app") ||
        path.startsWith("/feed") ||
        path.startsWith("/dashboard") ||
        params.get("view") === "app" ||
        window.location.hash === "#app"
      ) {
        if (!isAuthenticated || !isEmailVerified) {
          // Guard: unauthenticated or unverified users cannot enter /app
          setCurrentRoute("landing");
          setAuthModalMode("login");
          setAuthModalMessage("Please sign in with a verified account to access Balaga.");
          setIsAuthModalOpen(true);
          window.history.replaceState({}, "", "/");
        } else {
          setCurrentRoute("app");
          setIsAuthModalOpen(false);
        }
      } else {
        setCurrentRoute("landing");
        if (path === "/login" || path === "/signin") {
          setAuthModalMode("login");
          setAuthModalMessage(null);
          setIsAuthModalOpen(true);
        } else if (path === "/signup" || path === "/join") {
          setAuthModalMode("signup");
          setAuthModalMessage(null);
          setIsAuthModalOpen(true);
        } else {
          setIsAuthModalOpen(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated, isEmailVerified]);

  // Enforce route protection: if user is on /app without verified authentication
  useEffect(() => {
    if (!isAuthLoading && currentRoute === "app") {
      if (!isAuthenticated || !isEmailVerified) {
        setCurrentRoute("landing");
        setAuthModalMode("login");
        setAuthModalMessage("Please sign in with your verified Balaga account.");
        setIsAuthModalOpen(true);
        window.history.replaceState({}, "", "/");
      }
    }
  }, [isAuthLoading, currentRoute, isAuthenticated, isEmailVerified]);

  const navigateToApp = (realm?: "socializing" | "founders") => {
    if (!isAuthenticated || !isEmailVerified) {
      setAuthModalMode("login");
      setAuthModalMessage("Please sign in with a verified account to access Balaga.");
      setIsAuthModalOpen(true);
      return;
    }

    if (realm) {
      switchWorld(realm);
    }
    setCurrentRoute("app");
    window.history.pushState({}, "", "/app");
  };

  const navigateToLanding = () => {
    setCurrentRoute("landing");
    window.history.pushState({}, "", "/");
  };

  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setAuthModalMessage(null);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      {currentRoute === "landing" ? (
        <>
          <LandingPageView
            onEnterApp={navigateToApp}
            onOpenLogin={handleOpenAuth}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
          />

          <LoginModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            initialMessage={authModalMessage}
            onClose={() => {
              setIsAuthModalOpen(false);
              setAuthModalMessage(null);
            }}
            onSuccess={(realm) => {
              setIsAuthModalOpen(false);
              setAuthModalMessage(null);
              navigateToApp(realm);
            }}
          />

          <UpiPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
          />
        </>
      ) : (
        <WorldLayout onNavigateToLanding={navigateToLanding} />
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorldProvider>
        <AppContent />
      </WorldProvider>
    </AuthProvider>
  );
};

export default App;
