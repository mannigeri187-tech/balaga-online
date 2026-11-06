import React, { createContext, useContext, useState, useEffect } from "react";
import { WORLDS, WorldType } from "@platform/config";
import { SocialProfile, FounderProfile, WorldContextState } from "@platform/shared-types";

const WorldContext = createContext<WorldContextState | undefined>(undefined);

const LOCAL_STORAGE_KEY = "balaga_active_world";

export const WorldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorld, setActiveWorld] = useState<WorldType>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem("vanguard_active_world");
    return saved === WORLDS.SOCIALIZING || saved === WORLDS.FOUNDERS
      ? (saved as WorldType)
      : WORLDS.SOCIALIZING;
  });

  const [socialProfile] = useState<SocialProfile | null>({
    id: "10000000-0000-0000-0000-000000000001",
    accountId: "00000000-0000-0000-0000-000000000001",
    username: "aarav_social",
    displayName: "Aarav Social",
    bio: "Photography enthusiast & weekend badminton player.",
    interests: ["Photography", "Travel", "Indie Cinema", "Fitness"],
    hobbies: ["Badminton", "Baking"],
    languages: ["English", "Hindi", "Kannada"],
    broadLocation: "Bengaluru, Karnataka",
    allowDmsFrom: "everyone",
    showActivityStatus: true,
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [founderProfile] = useState<FounderProfile | null>({
    id: "20000000-0000-0000-0000-000000000001",
    accountId: "00000000-0000-0000-0000-000000000001",
    username: "aarav_builder",
    displayName: "Aarav Sharma",
    headline: "Full-Stack Architect & AI Product Founder",
    bio: "Building next-gen distributed platforms and real-time networking tools.",
    skills: ["TypeScript", "React", "PostgreSQL", "System Architecture", "Go"],
    interests: ["AI/ML", "B2B SaaS", "Developer Tools"],
    experienceYears: 7,
    roles: ["Founder", "CTO"],
    availability: "full_time",
    workPreference: "hybrid",
    broadLocation: "Bengaluru, Karnataka",
    portfolioUrl: "https://github.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, activeWorld);
  }, [activeWorld]);

  const switchWorld = (world: WorldType) => {
    if (world !== activeWorld) {
      setIsLoading(true);
      setActiveWorld(world);
      setTimeout(() => setIsLoading(false), 150);
    }
  };

  return (
    <WorldContext.Provider
      value={{
        activeWorld,
        switchWorld,
        hasSocialProfile: !!socialProfile,
        hasFounderProfile: !!founderProfile,
        socialProfile,
        founderProfile,
        isLoading,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};

export const useWorld = (): WorldContextState => {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error("useWorld must be used within a WorldProvider");
  }
  return context;
};
