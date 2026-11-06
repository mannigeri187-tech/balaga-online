import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { WorldProvider } from "./contexts/WorldContext";
import { WorldLayout } from "./components/layout/WorldLayout";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorldProvider>
        <WorldLayout />
      </WorldProvider>
    </AuthProvider>
  );
};

export default App;
