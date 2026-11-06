import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  X,
  Package,
  ShieldCheck,
  Search,
} from "lucide-react";

export interface GearItem {
  id: string;
  title: string;
  category: "Photography" | "Cycling" | "Art & Design" | "Books";
  ownerName: string;
  ownerUsername: string;
  ownerAvatar: string;
  trustTier: string;
  lendingTerms: string;
  location: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface CircleGearSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleName?: string;
}

export const CircleGearSwapModal: React.FC<CircleGearSwapModalProps> = ({
  isOpen,
  onClose,
  circleName = "Bangalore Urban Sketchers",
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "list">("browse");

  const [gearList, setGearList] = useState<GearItem[]>([
    {
      id: "gear-1",
      title: "Voigtlander Nokton 35mm f/1.4 Lens (Leica M Mount)",
      category: "Photography",
      ownerName: "Aarav Patel",
      ownerUsername: "aarav_social",
      ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      trustTier: "Level 3 Peer",
      lendingTerms: "Free borrow for weekend analog photography projects",
      location: "Indiranagar, Bengaluru",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      isAvailable: true,
    },
    {
      id: "gear-2",
      title: "Arches 300gsm Cold-Press Watercolor Block (14x20 in)",
      category: "Art & Design",
      ownerName: "Priya Rao",
      ownerUsername: "priya_art",
      ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      trustTier: "Level 3 Peer",
      lendingTerms: "Free for plein air paint-out sessions",
      location: "Malleshwaram, Bengaluru",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
      isAvailable: true,
    },
    {
      id: "gear-3",
      title: "Topeak High-Pressure Floor Pump & Tubeless Repair Kit",
      category: "Cycling",
      ownerName: "Kabir Mehta",
      ownerUsername: "kabir_rides",
      ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      trustTier: "Level 2 Peer",
      lendingTerms: "Available for Saturday morning prep loops",
      location: "Koramangala, Bengaluru",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      isAvailable: true,
    },
    {
      id: "gear-4",
      title: "Designing Data-Intensive Applications (Hardcover)",
      category: "Books",
      ownerName: "Siddharth Verma",
      ownerUsername: "sid_verma",
      ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      trustTier: "Level 2 Peer",
      lendingTerms: "Borrow for 3 weeks • Return with notes welcome",
      location: "HSR Layout, Bengaluru",
      imageUrl: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80",
      isAvailable: true,
    },
  ]);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GearItem["category"]>("Photography");
  const [newTerms, setNewTerms] = useState("");
  const [newLocation, setNewLocation] = useState("Indiranagar, Bengaluru");
  const [newImageUrl, setNewImageUrl] = useState("");

  if (!isOpen) return null;

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: GearItem = {
      id: `gear-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      ownerName: "Aarav Patel",
      ownerUsername: "aarav_social",
      ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      trustTier: "Level 3 Peer",
      lendingTerms: newTerms.trim() || "Free borrow for mutual circle members",
      location: newLocation.trim() || "Bengaluru",
      imageUrl:
        newImageUrl.trim() ||
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      isAvailable: true,
    };

    setGearList([newItem, ...gearList]);
    setNewTitle("");
    setNewTerms("");
    setNewImageUrl("");
    setActiveTab("browse");
  };

  const handleBorrowRequest = (item: GearItem) => {
    alert(
      `Borrow Request Dispatched!\n\nConnected you with @${item.ownerUsername} for "${item.title}".\nTrust Level: ${item.trustTier}. Location: ${item.location}.`
    );
  };

  const filtered = gearList.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Circle Gear Swap & Lending
                <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded">
                  MUTUAL TRUST
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Lend & borrow cameras, cycling gear, and tools without rental extortion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("browse")}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === "browse"
                  ? "border-teal-400 text-teal-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Available in {circleName} ({gearList.length})
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === "list"
                  ? "border-teal-400 text-teal-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              + Lend an Item
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === "list" ? (
            /* LIST AN ITEM FORM */
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Item Name & Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony FE 50mm f/1.8 Lens, Park Tool Chain Breaker..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lending Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free for weekend meetups, mutual trust deposit only..."
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("browse")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs"
                >
                  Publish Listing to Circle
                </Button>
              </div>
            </form>
          ) : (
            /* BROWSE ITEMS */
            <div className="space-y-4">
              {/* Search & Categories */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gear by name or neighborhood..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-[11px]">
                  {["All", "Photography", "Cycling", "Art & Design", "Books"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                        activeCategory === cat
                          ? "bg-teal-600/30 text-teal-300 border border-teal-500/40"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-3.5 space-y-3 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {item.lendingTerms}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.ownerAvatar}
                            alt={item.ownerName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-slate-300">{item.ownerName}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {item.trustTier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 truncate">
                          📍 {item.location}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleBorrowRequest(item)}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-1 px-3 shrink-0"
                        >
                          Request Borrow 🤝
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            🔒 Safe Peer Exchange: Protected by Balaga Trust Fingerprint. Zero commercial fees.
          </div>
        </div>
      </div>
    </div>
  );
};
