import React, { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Award,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface PredictionMarket {
  id: string;
  question: string;
  category: string;
  resolvesAt: string;
  yesKarma: number;
  noKarma: number;
  totalParticipants: number;
  userStaked?: {
    side: "YES" | "NO";
    amount: number;
  };
}

interface PredictionStakesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockMarkets: PredictionMarket[] = [
  {
    id: "m-1",
    question: "Will Namma Metro Pink Line (Kalena Agrahara to Nagawara) begin public operations before Dec 2026?",
    category: "Civic & Urban Infrastructure",
    resolvesAt: "Dec 31, 2026",
    yesKarma: 3420,
    noKarma: 1850,
    totalParticipants: 312
  },
  {
    id: "m-2",
    question: "Will Bangalore's open-source Rust meetup cross 500 in-person builders at Bangalore International Centre?",
    category: "Tech & Communities",
    resolvesAt: "Nov 30, 2026",
    yesKarma: 2480,
    noKarma: 620,
    totalParticipants: 184
  },
  {
    id: "m-3",
    question: "Will an Indic LLM fine-tune break the top 5 global positions on HuggingFace OpenLLM Leaderboard this quarter?",
    category: "AI & Indic Computing",
    resolvesAt: "Dec 15, 2026",
    yesKarma: 5120,
    noKarma: 980,
    totalParticipants: 420
  }
];

export const PredictionStakesModal: React.FC<PredictionStakesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(mockMarkets);
  const [userKarma, setUserKarma] = useState<number>(450);
  const [selectedStakeAmount, setSelectedStakeAmount] = useState<number>(25);
  const [stakeSuccessToast, setStakeSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStake = (marketId: string, side: "YES" | "NO") => {
    if (userKarma < selectedStakeAmount) return;

    setUserKarma((prev) => prev - selectedStakeAmount);
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== marketId) return m;
        return {
          ...m,
          yesKarma: side === "YES" ? m.yesKarma + selectedStakeAmount : m.yesKarma,
          noKarma: side === "NO" ? m.noKarma + selectedStakeAmount : m.noKarma,
          totalParticipants: m.userStaked ? m.totalParticipants : m.totalParticipants + 1,
          userStaked: {
            side,
            amount: (m.userStaked?.amount || 0) + selectedStakeAmount
          }
        };
      })
    );

    setStakeSuccessToast(`Staked ${selectedStakeAmount} Karma on "${side}"!`);
    setTimeout(() => setStakeSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Decisional Prediction Stakes
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  S27 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> Karma-Only • Zero Fiat
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Playful, non-monetary community forecasting markets driven strictly by earned Balaga Karma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Karma Balance & Staking Selector Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Your Available Karma</span>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {userKarma} Karma
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Stake Size:</span>
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedStakeAmount(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    selectedStakeAmount === amt
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  {amt} K
                </button>
              ))}
            </div>
          </div>

          {stakeSuccessToast && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{stakeSuccessToast}</span>
            </div>
          )}

          {/* Active Markets Grid */}
          <div className="space-y-4">
            {markets.map((m) => {
              const total = m.yesKarma + m.noKarma;
              const yesPercent = total > 0 ? Math.round((m.yesKarma / total) * 100) : 50;
              const noPercent = 100 - yesPercent;

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {m.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> Resolves: {m.resolvesAt}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                    {m.question}
                  </h4>

                  {/* Prediction Odds Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-emerald-400">YES {yesPercent}% ({m.yesKarma} Karma)</span>
                      <span className="text-rose-400">NO {noPercent}% ({m.noKarma} Karma)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                        style={{ width: `${yesPercent}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
                        style={{ width: `${noPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stake Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {m.totalParticipants} forecasters
                      </span>
                      {m.userStaked && (
                        <span className="text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Your stake: {m.userStaked.amount} Karma on {m.userStaked.side}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStake(m.id, "YES")}
                        disabled={userKarma < selectedStakeAmount}
                        className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        Stake YES (+{selectedStakeAmount})
                      </button>
                      <button
                        onClick={() => handleStake(m.id, "NO")}
                        disabled={userKarma < selectedStakeAmount}
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        Stake NO (+{selectedStakeAmount})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Compliant: 100% non-monetary Karma points with zero real currency exchange or withdrawal.</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Markets
          </Button>
        </div>
      </div>
    </div>
  );
};
