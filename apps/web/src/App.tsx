import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { WorldProvider, useWorld } from "./contexts/WorldContext";
import { WorldLayout } from "./components/layout/WorldLayout";
import { LandingPageView } from "./features/landing/LandingPageView";
import { LoginModal } from "./features/landing/LoginModal";
import { UpiPaymentModal } from "./features/landing/UpiPaymentModal";

const AppContent: React.FC = () => {
  const { switchWorld } = useWorld();

  // Route state: "landing" is the default homepage for https://balaga.online /
  const [currentRoute, setCurrentRoute] = useState<"landing" | "app">(() => {
    if (typeof window === "undefined") return "landing";
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // In-app explicit route requests:
    if (
      path.startsWith("/app") ||
      path.startsWith("/feed") ||
      path.startsWith("/dashboard") ||
      params.get("view") === "app" ||
      window.location.hash === "#app"
    ) {
      return "app";
    }

    // The root / route MUST display the public landing page by default
    return "landing";
  });

  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(() => {
    if (typeof window === "undefined") return "login";
    const path = window.location.pathname;
    return path === "/signup" || path === "/join" ? "signup" : "login";
  });

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
        setCurrentRoute("app");
        setIsAuthModalOpen(false);
      } else {
        setCurrentRoute("landing");
        if (path === "/login" || path === "/signin") {
          setAuthModalMode("login");
          setIsAuthModalOpen(true);
        } else if (path === "/signup" || path === "/join") {
          setAuthModalMode("signup");
          setIsAuthModalOpen(true);
        } else {
          setIsAuthModalOpen(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToApp = (realm?: "socializing" | "founders") => {
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
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(realm) => {
              setIsAuthModalOpen(false);
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
