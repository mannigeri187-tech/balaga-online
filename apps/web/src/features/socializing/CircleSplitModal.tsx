import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  X,
  IndianRupee,
  CheckCircle2,
  Clock,
  Share2,
  Receipt,
  ShieldCheck,
} from "lucide-react";

export interface SplitMember {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  shareAmount: number;
  isSettled: boolean;
  upiId?: string;
}

export interface SplitExpense {
  id: string;
  title: string;
  totalAmount: number;
  paidBy: string;
  paidByUpi: string;
  circleName?: string;
  createdAt: string;
  members: SplitMember[];
}

interface CircleSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleName?: string;
}

export const CircleSplitModal: React.FC<CircleSplitModalProps> = ({
  isOpen,
  onClose,
  circleName = "Deccan Century Cyclists",
}) => {
  const [activeStep, setActiveStep] = useState<"list" | "create">("list");

  // Sample active and past splits
  const [splits, setSplits] = useState<SplitExpense[]>([
    {
      id: "split-1",
      title: "Nandi Hills Dawn Ride Breakfast ☕",
      totalAmount: 1400,
      paidBy: "Aarav Patel",
      paidByUpi: "aarav.social@okhdfcbank",
      circleName: "Deccan Century Cyclists",
      createdAt: "Today, 8:45 AM",
      members: [
        {
          id: "m-1",
          name: "Kabir Mehta",
          username: "kabir_rides",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
          shareAmount: 350,
          isSettled: true,
          upiId: "kabir.rides@okhdfcbank",
        },
        {
          id: "m-2",
          name: "Priya Rao",
          username: "priya_art",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
          shareAmount: 350,
          isSettled: false,
          upiId: "priya.art@okhdfcbank",
        },
        {
          id: "m-3",
          name: "Ananya Iyer",
          username: "ananya_film",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
          shareAmount: 350,
          isSettled: false,
          upiId: "ananya.iyer@okhdfcbank",
        },
        {
          id: "m-4",
          name: "Aarav Patel (You)",
          username: "aarav_social",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
          shareAmount: 350,
          isSettled: true,
          upiId: "aarav.social@okhdfcbank",
        },
      ],
    },
    {
      id: "split-2",
      title: "Cubbon Park Watercolor Paper Bulk Buy 🎨",
      totalAmount: 900,
      paidBy: "Priya Rao",
      paidByUpi: "priya.art@okhdfcbank",
      circleName: "Bangalore Urban Sketchers",
      createdAt: "Yesterday",
      members: [
        {
          id: "m-1",
          name: "Aarav Patel (You)",
          username: "aarav_social",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
          shareAmount: 300,
          isSettled: true,
          upiId: "aarav.social@okhdfcbank",
        },
        {
          id: "m-2",
          name: "Priya Rao",
          username: "priya_art",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
          shareAmount: 300,
          isSettled: true,
          upiId: "priya.art@okhdfcbank",
        },
        {
          id: "m-3",
          name: "Siddharth Verma",
          username: "sid_verma",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
          shareAmount: 300,
          isSettled: true,
          upiId: "sid.verma@okhdfcbank",
        },
      ],
    },
  ]);

  // Form state for creating a new split
  const [newTitle, setNewTitle] = useState("");
  const [newTotalAmount, setNewTotalAmount] = useState<number | "">("");
  const [newUpiId, setNewUpiId] = useState("aarav.social@okhdfcbank");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([
    "kabir_rides",
    "priya_art",
    "ananya_film",
  ]);

  const candidateFriends = [
    {
      username: "kabir_rides",
      name: "Kabir Mehta",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    },
    {
      username: "priya_art",
      name: "Priya Rao",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      username: "ananya_film",
      name: "Ananya Iyer",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    },
    {
      username: "rohit_sound",
      name: "Rohit Deshmukh",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80",
    },
  ];

  if (!isOpen) return null;

  const toggleSettled = (splitId: string, memberId: string) => {
    setSplits((prev) =>
      prev.map((s) => {
        if (s.id !== splitId) return s;
        return {
          ...s,
          members: s.members.map((m) =>
            m.id === memberId ? { ...m, isSettled: !m.isSettled } : m
          ),
        };
      })
    );
  };

  const handleCreateSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTotalAmount || Number(newTotalAmount) <= 0) return;

    const totalAmt = Number(newTotalAmount);
    // You + selected friends
    const totalPeople = selectedFriends.length + 1;
    const perPerson = Math.round(totalAmt / totalPeople);

    const members: SplitMember[] = [
      {
        id: `m-self-${Date.now()}`,
        name: "Aarav Patel (You)",
        username: "aarav_social",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        shareAmount: perPerson,
        isSettled: true,
        upiId: newUpiId,
      },
      ...selectedFriends.map((uname, idx) => {
        const friend = candidateFriends.find((f) => f.username === uname);
        return {
          id: `m-${idx}-${Date.now()}`,
          name: friend?.name || uname,
          username: uname,
          avatarUrl:
            friend?.avatarUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
          shareAmount: perPerson,
          isSettled: false,
          upiId: `${uname}@okhdfcbank`,
        };
      }),
    ];

    const newSplit: SplitExpense = {
      id: `split-${Date.now()}`,
      title: newTitle.trim(),
      totalAmount: totalAmt,
      paidBy: "Aarav Patel",
      paidByUpi: newUpiId,
      circleName,
      createdAt: "Just now",
      members,
    };

    setSplits([newSplit, ...splits]);
    setNewTitle("");
    setNewTotalAmount("");
    setActiveStep("list");
  };

  const toggleSelectFriend = (username: string) => {
    if (selectedFriends.includes(username)) {
      setSelectedFriends(selectedFriends.filter((u) => u !== username));
    } else {
      setSelectedFriends([...selectedFriends, username]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Zero-Math Circle Split
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                  0% FEE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct UPI settlements • No wallets • No paywalls
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

        {/* Tab Controls */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveStep("list")}
              className={`pb-3 border-b-2 transition-colors ${
                activeStep === "list"
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Circle Expenses ({splits.length})
            </button>
            <button
              onClick={() => setActiveStep("create")}
              className={`pb-3 border-b-2 transition-colors ${
                activeStep === "create"
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              + Split a New Bill
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            {circleName}
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeStep === "create" ? (
            /* CREATE NEW SPLIT FORM */
            <form onSubmit={handleCreateSplit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Filter coffee, breakfast, badminton court rental..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Amount (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 1200"
                      value={newTotalAmount}
                      onChange={(e) =>
                        setNewTotalAmount(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your UPI VPA (for direct payments)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="yourhandle@upi"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Friends Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Friends to Split With ({selectedFriends.length} selected + You)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {candidateFriends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.username);
                    return (
                      <div
                        key={friend.username}
                        onClick={() => toggleSelectFriend(friend.username)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                            : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <img
                          src={friend.avatarUrl}
                          alt={friend.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-white">
                            {friend.name}
                          </p>
                          <p className="text-[10px] text-slate-400">@{friend.username}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
                              : "border-slate-700"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Preview */}
              {newTotalAmount && Number(newTotalAmount) > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">
                    Calculated Share ({selectedFriends.length + 1} people):
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    ₹{Math.round(Number(newTotalAmount) / (selectedFriends.length + 1))}/person
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveStep("list")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Calculate & Create Split
                </Button>
              </div>
            </form>
          ) : (
            /* ACTIVE SPLITS LIST */
            <div className="space-y-6">
              {splits.map((split) => {
                const settledCount = split.members.filter((m) => m.isSettled).length;
                const isAllSettled = settledCount === split.members.length;

                return (
                  <div
                    key={split.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4 hover:border-slate-700/80 transition-all shadow-sm"
                  >
                    {/* Split Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {split.title}
                          </h4>
                          {isAllSettled ? (
                            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              All Settled
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {split.members.length - settledCount} Pending
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Paid by <span className="text-slate-200 font-medium">{split.paidBy}</span> • Total:{" "}
                          <span className="font-mono text-emerald-400 font-bold">
                            ₹{split.totalAmount}
                          </span>{" "}
                          • {split.createdAt}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Balaga Split: ${split.title} (₹${split.totalAmount}). Pay ${split.paidBy} via UPI: ${split.paidByUpi}`
                          );
                          alert("Split summary copied to clipboard for sharing!");
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy split summary"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Breakdown per member */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {split.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <span className="font-medium text-slate-200">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1.5">
                                @{member.username}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-200">
                              ₹{member.shareAmount}
                            </span>

                            {/* Action Button: Settle / Pay UPI */}
                            {member.isSettled ? (
                              <button
                                onClick={() => toggleSettled(split.id, member.id)}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-500/30 transition-colors"
                                title="Click to toggle status"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Settled</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`upi://pay?pa=${encodeURIComponent(
                                    split.paidByUpi
                                  )}&pn=${encodeURIComponent(
                                    split.paidBy
                                  )}&am=${member.shareAmount}&cu=INR&tn=${encodeURIComponent(
                                    `Split: ${split.title}`
                                  )}`}
                                  className="px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                  title="1-tap instant payment via any installed UPI app"
                                >
                                  <IndianRupee className="w-3 h-3" />
                                  <span>Pay UPI</span>
                                </a>
                                <button
                                  onClick={() => toggleSettled(split.id, member.id)}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-[11px] transition-colors"
                                  title="Manually mark as settled"
                                >
                                  Mark Paid
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Trust Guarantee */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Direct VPA Settlement • Zero Platform Cut</span>
                      </span>
                      <span>VPA: {split.paidByUpi}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
