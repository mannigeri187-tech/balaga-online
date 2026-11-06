import { PublicSocialAccount } from "./SocialPublicProfileModal";

export const SOCIAL_ACCOUNTS: Record<string, PublicSocialAccount> = {
  ishowspeed: {
    id: "acc-speed",
    username: "ishowspeed",
    displayName: "IShowSpeed",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    isVerified: true,
    category: "Digital creator",
    bio: "Live every single day! Streaming, football, gaming and world tour 🌍⚽️ | Catch the stream on YouTube",
    website: "youtube.com/ishowspeed",
    postsCount: 384,
    followersCount: "14.2M",
    followingCount: 198,
    isFollowing: false,
    mutualsText: "Followed by priya_art, aarav_social + 48 others",
    highlights: [
      { id: "h-1", title: "Live", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" },
      { id: "h-2", title: "India Tour", cover: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300&q=80" },
      { id: "h-3", title: "CR7 Moments", cover: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&q=80" },
      { id: "h-4", title: "Gaming", cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80" },
    ],
    posts: [
      {
        id: "sp-1",
        mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        likesCount: 240000,
        commentsCount: 6120,
        caption: "BENGALURU WAS ELECTRIC! Much love to all the supporters who showed up today 🇮🇳❤️",
        type: "image",
        createdAt: "1 day ago",
      },
      {
        id: "sp-2",
        mediaUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
        likesCount: 185000,
        commentsCount: 4210,
        caption: "Practicing free kicks before the evening broadcast. SIUUU! ⚽️⚡️",
        type: "image",
        createdAt: "3 days ago",
      },
      {
        id: "sp-3",
        mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
        likesCount: 342000,
        commentsCount: 9280,
        caption: "Matchday highlights! The energy in the stadium was incredible 🔥",
        type: "video",
        createdAt: "5 days ago",
      },
      {
        id: "sp-4",
        mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        likesCount: 198000,
        commentsCount: 5120,
        caption: "New music video dropping this weekend. Turn the bass all the way up 🎶",
        type: "image",
        createdAt: "1 week ago",
      },
      {
        id: "sp-5",
        mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        likesCount: 129000,
        commentsCount: 3100,
        caption: "Late night gaming marathon with chat! 🎮",
        type: "image",
        createdAt: "2 weeks ago",
      },
      {
        id: "sp-6",
        mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
        likesCount: 410000,
        commentsCount: 11400,
        caption: "Thank you for 14 Million subscribers! We are just getting started 🌍🚀",
        type: "image",
        createdAt: "3 weeks ago",
      },
    ],
  },
  priya_art: {
    id: "acc-priya",
    username: "priya_art",
    displayName: "Priya Rao",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    isVerified: true,
    category: "Visual Artist",
    bio: "Watercolor artist & botanical sketcher. Cubbon park mornings & paper textures 🎨🌿 | Bengaluru",
    website: "priyarao.art",
    postsCount: 124,
    followersCount: "42.8k",
    followingCount: 312,
    isFollowing: true,
    mutualsText: "Followed by aarav_social and kabir_rides",
    highlights: [
      { id: "h-p1", title: "Botanicals", cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80" },
      { id: "h-p2", title: "En Plein Air", cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80" },
    ],
    posts: [
      {
        id: "pp-1",
        mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
        likesCount: 3200,
        commentsCount: 94,
        caption: "Cold press watercolor study under the bamboo grove at Cubbon Park 🌿",
        type: "image",
        createdAt: "1 day ago",
      },
      {
        id: "pp-2",
        mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
        likesCount: 4120,
        commentsCount: 128,
        caption: "Mixing ultramarine and raw umber for tree bark textures 🎨",
        type: "image",
        createdAt: "4 days ago",
      },
      {
        id: "pp-3",
        mediaUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
        likesCount: 5200,
        commentsCount: 180,
        caption: "Studio desk setup for today's botanical illustration workshop 🌿",
        type: "video",
        createdAt: "1 week ago",
      },
    ],
  },
  kabir_rides: {
    id: "acc-kabir",
    username: "kabir_rides",
    displayName: "Kabir Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    isVerified: false,
    category: "Athlete / Cyclist",
    bio: "Brevet endurance cyclist & road cycling enthusiast. Nandi hills dawn ascents 🚴‍♂️☕️",
    website: "strava.com/athletes/kabir",
    postsCount: 92,
    followersCount: "18.4k",
    followingCount: 420,
    isFollowing: false,
    mutualsText: "Followed by tanvi_reads and priya_art",
    highlights: [
      { id: "h-k1", title: "Nandi", cover: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&q=80" },
      { id: "h-k2", title: "Centuries", cover: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300&q=80" },
    ],
    posts: [
      {
        id: "kp-1",
        mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
        likesCount: 1820,
        commentsCount: 42,
        caption: "Nandi Hills dawn climb. 60km before 8 AM! 🚴‍♂️🌅",
        type: "image",
        createdAt: "2 days ago",
      },
      {
        id: "kp-2",
        mediaUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
        likesCount: 2310,
        commentsCount: 65,
        caption: "New carbon gravel wheelset tested on the Kolar highway 🚴‍♂️",
        type: "image",
        createdAt: "5 days ago",
      },
    ],
  },
  tanvi_reads: {
    id: "acc-tanvi",
    username: "tanvi_reads",
    displayName: "Tanvi Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    isVerified: false,
    category: "Writer & Film Critic",
    bio: "35mm analog film rolls & world cinema screenings. Reading fiction & drinking filter coffee 🎬☕️",
    postsCount: 68,
    followersCount: "11.2k",
    followingCount: 290,
    isFollowing: true,
    mutualsText: "Followed by aarav_social",
    posts: [
      {
        id: "tp-1",
        mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
        likesCount: 940,
        commentsCount: 31,
        caption: "Arthouse cinema festival program arrived. Film schedule planned 🎬",
        type: "image",
        createdAt: "3 days ago",
      },
    ],
  },
  rohan_acoustic: {
    id: "acc-rohan",
    username: "rohan_acoustic",
    displayName: "Rohan Deshmukh",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    isVerified: false,
    category: "Musician",
    bio: "Fingerstyle acoustic guitarist. Indiranagar live sets & vinyl collections 🎸🎶",
    postsCount: 54,
    followersCount: "9.8k",
    followingCount: 340,
    isFollowing: false,
    posts: [
      {
        id: "rp-1",
        mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
        likesCount: 4300,
        commentsCount: 112,
        caption: "Filter coffee & fingerstyle chords on Sunday morning ☕️🎶",
        type: "video",
        createdAt: "1 week ago",
      },
    ],
  },
};

export const getAccountByUsername = (username?: string): PublicSocialAccount => {
  if (username && SOCIAL_ACCOUNTS[username]) {
    return SOCIAL_ACCOUNTS[username];
  }
  return {
    id: `acc-${username || "user"}`,
    username: username || "creator",
    displayName: username ? username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Balaga Creator",
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80`,
    isVerified: false,
    category: "Community Creator",
    bio: "Sharing stories, creative moments & local passions on Balaga Socializing 📸✨",
    postsCount: 18,
    followersCount: "2.4k",
    followingCount: 180,
    isFollowing: false,
    posts: [
      {
        id: `p-${username}-1`,
        mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        likesCount: 840,
        commentsCount: 24,
        caption: "Morning light over the lake. Beautiful day in Bengaluru!",
        type: "image",
        createdAt: "2 days ago",
      },
    ],
  };
};

export interface PublicBuilderCard {
  isPublicBuilder: boolean;
  headline: string;
  startupName?: string;
  stage?: string;
  techStack: string[];
  superpowers: string[];
  lookingFor?: string;
  verifiedBadge?: "gold" | "blue" | "teal";
}

export const BUILDER_PROFILES: Record<string, PublicBuilderCard> = {
  aarav_social: {
    isPublicBuilder: true,
    headline: "Founder & Full-stack Engineer at Balaga",
    startupName: "Balaga.online",
    stage: "Seed / Active v1",
    techStack: ["TypeScript", "React", "Node.js", "Supabase", "Tailwind"],
    superpowers: ["Full-Stack Architecture", "Product Design", "Distributed Systems"],
    lookingFor: "Early adopters & talented indie hackers in Bengaluru",
    verifiedBadge: "gold",
  },
  priya_art: {
    isPublicBuilder: true,
    headline: "Co-Founder & Design Lead at BioHealth AI",
    startupName: "BioHealth AI",
    stage: "Pre-seed",
    techStack: ["Figma", "Design Systems", "Three.js", "Tailwind"],
    superpowers: ["Botanical Illustration", "UI/UX Systems", "Micro-Interactions"],
    lookingFor: "Founding Engineer with PyTorch experience",
    verifiedBadge: "blue",
  },
  kabir_rides: {
    isPublicBuilder: true,
    headline: "Hardware Engineer & IoT Architect",
    startupName: "AeroTelemetry",
    stage: "Bootstrapped",
    techStack: ["Embedded C++", "Rust", "BLE 5.2", "KiCAD"],
    superpowers: ["Battery Optimization", "Low-power firmware"],
    lookingFor: "Flutter mobile developer",
    verifiedBadge: "blue",
  },
};

export const getBuilderCardByUsername = (username?: string): PublicBuilderCard => {
  if (username && BUILDER_PROFILES[username]) {
    return BUILDER_PROFILES[username];
  }
  return {
    isPublicBuilder: false,
    headline: "Creator & Community Member",
    techStack: [],
    superpowers: ["Creativity", "Community Engagement"],
  };
};
