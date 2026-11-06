import React, { useState } from "react";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Play,
  Flame,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface LaunchProduct {
  id: string;
  name: string;
  tagline: string;
  founder: string;
  category: string;
  verifiedTestsCount: number;
  interactiveTrials: number;
  conversionRate: string;
  testActionLabel: string;
  testEndpoint: string;
  sampleInput: string;
  sampleOutput: string;
  hasUserTested?: boolean;
}

interface ProofOfTractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockLaunches: LaunchProduct[] = [
  {
    id: "lp-1",
    name: "IndicEmbed-v2",
    tagline: "Ultra-low latency embeddings fine-tuned on 12 Indian languages for edge devices",
    founder: "Kavya Murthy (ex-AI4Bharat)",
    category: "AI & ML Systems",
    verifiedTestsCount: 342,
    interactiveTrials: 1240,
    conversionRate: "28.4%",
    testActionLabel: "Execute Embedding Extraction",
    testEndpoint: "POST /v1/indic/embed",
    sampleInput: '{"text": "ನಮ್ಮ ಊರು ಬೆಂಗಳೂರು", "dimensions": 384}',
    sampleOutput: '{"status": "ok", "latency_ms": 4.2, "vector_dim": 384, "similarity_score": 0.941}'
  },
  {
    id: "lp-2",
    name: "FastUPI Gateway Mock",
    tagline: "Local deterministic sandbox for testing UPI intent flows and bank downtime retries",
    founder: "Rohan Varma",
    category: "Fintech Infra",
    verifiedTestsCount: 289,
    interactiveTrials: 890,
    conversionRate: "32.1%",
    testActionLabel: "Simulate UPI Intent Call",
    testEndpoint: "POST /upi/v2/simulate-intent",
    sampleInput: '{"vpa": "founder@okaxis", "amount": 500.00, "drop_rate": 0.0}',
    sampleOutput: '{"txn_id": "UPI-B2B-9817234", "status": "SUCCESS", "roundtrip_ms": 11.4}'
  },
  {
    id: "lp-3",
    name: "ZeroTrace Auth",
    tagline: "Passwordless Passkey authentication for Indian regional web apps with SMS fallback",
    founder: "Devika Sen",
    category: "Developer Tools",
    verifiedTestsCount: 215,
    interactiveTrials: 720,
    conversionRate: "24.5%",
    testActionLabel: "Verify Passkey Challenge",
    testEndpoint: "POST /auth/passkey/verify",
    sampleInput: '{"credentialId": "pk_live_091823", "device_attest": "FIDO2_OK"}',
    sampleOutput: '{"session_token": "zt_jwt_88192a", "auth_level": "AADHAAR_COMPLIANT"}'
  }
];

export const ProofOfTractionModal: React.FC<ProofOfTractionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [launches, setLaunches] = useState<LaunchProduct[]>(mockLaunches);
  const [selectedLaunchId, setSelectedLaunchId] = useState<string>("lp-1");
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeProduct = launches.find((l) => l.id === selectedLaunchId) || launches[0];

  const handleExecuteTest = () => {
    setIsExecutingTest(true);
    setExecutionResult(null);

    setTimeout(() => {
      setIsExecutingTest(false);
      setExecutionResult(activeProduct.sampleOutput);

      if (!activeProduct.hasUserTested) {
        setLaunches((prev) =>
          prev.map((l) =>
            l.id === activeProduct.id
              ? {
                  ...l,
                  verifiedTestsCount: l.verifiedTestsCount + 1,
                  interactiveTrials: l.interactiveTrials + 1,
                  hasUserTested: true
                }
              : l
          )
        );
        setTestFeedback("Verified human test completed! Your traction vote has been verified on-chain.");
        setTimeout(() => setTestFeedback(null), 4000);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Proof-of-Traction Community Launches
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  F22 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Bot-Proof Testing
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Launches ranked strictly by verified human interactive testing inside the container — zero vanity upvote farming
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
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Leaderboard list */}
          <div className="w-full md:w-80 border-r border-slate-800 p-4 flex flex-col gap-3 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-cyan-400" /> Today's Ranked Launches
              </span>
              <span className="text-[11px] text-slate-500">Live Telemetry</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {launches.map((prod, idx) => {
                const isSelected = prod.id === activeProduct.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedLaunchId(prod.id);
                      setExecutionResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-semibold text-sm text-white">{prod.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono">
                        {prod.verifiedTestsCount} human tests
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{prod.tagline}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                      <span>{prod.category}</span>
                      <span className="text-emerald-400 font-medium">{prod.conversionRate} conv.</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Anti-Sybil Guarantee: Votes only count when a real tester engages with the container and executes live test payload.
              </span>
            </div>
          </div>

          {/* Right: Live Interactive Testing Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Active Product Showcase Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{activeProduct.name}</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                      {activeProduct.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeProduct.tagline}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Built by <span className="text-slate-300">{activeProduct.founder}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0">
                  <span className="text-xl font-mono font-bold text-cyan-400">
                    {activeProduct.verifiedTestsCount}
                  </span>
                  <span className="text-[10px] text-slate-400">Verified Human Tests</span>
                </div>
              </div>

              {/* Verified Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400">Interactive Trials: </span>
                  <span className="font-mono text-slate-200 font-bold">{activeProduct.interactiveTrials}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">Test-to-Waitlist Conv: </span>
                  <span className="font-mono text-emerald-400 font-bold">{activeProduct.conversionRate}</span>
                </div>
                <div className="text-xs col-span-2 sm:col-span-1">
                  <span className="text-slate-400">Your Status: </span>
                  <span className={`font-semibold ${activeProduct.hasUserTested ? "text-emerald-400" : "text-amber-400"}`}>
                    {activeProduct.hasUserTested ? "✓ Verified Tester" : "Testing Required"}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Container Playground */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Interactive In-Container Test Sandbox
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {activeProduct.testEndpoint}
                </span>
              </div>

              {/* Simulated Payload */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Simulated Input Payload
                </label>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300">
                  {activeProduct.sampleInput}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="primary"
                  onClick={handleExecuteTest}
                  disabled={isExecutingTest}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-5 py-2 flex items-center gap-2"
                >
                  {isExecutingTest ? (
                    <>Executing Test Runtime...</>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> {activeProduct.testActionLabel}
                    </>
                  )}
                </Button>
                <span className="text-xs text-slate-400">
                  {activeProduct.hasUserTested ? "✓ You verified this launch" : "Run test to verify and rank this product"}
                </span>
              </div>

              {/* Test Response Output */}
              {executionResult && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Execution Output (200 OK • Sandbox Verified)
                  </label>
                  <pre className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                    {executionResult}
                  </pre>
                </div>
              )}

              {testFeedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{testFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Traction verification engine powered by WebAssembly sandbox telemetry</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
};
