import React, { useState } from "react";
import {
  Terminal,
  X,
  CheckCircle2,
  Code2,
  Radio,
  Sliders,
  Laptop
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface CodeCastCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const CodeCastCanvasModal: React.FC<CodeCastCanvasModalProps> = ({
  isOpen,
  onClose,
  projectName = "NovaTech Telemetry Rail v2",
}) => {
  const [activeTab, setActiveTab] = useState<"canvas" | "terminal" | "code">("canvas");
  
  // Interactive Canvas Simulation Controls
  const [throughputSpeed, setThroughputSpeed] = useState<number>(45);
  const [nodesActive, setNodesActive] = useState<number>(8);
  const [encryptionOn, setEncryptionOn] = useState<boolean>(true);

  // Terminal State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "⚡ [balaga-cast] Starting live project broadcast container...",
    "📦 Loading wasm runtime for NovaTech Telemetry Rail v2...",
    "🟢 Connected to Mumbai Region Node: bom1-relay-04",
    "🚀 Ready! Type 'test', 'status', or 'run' below.",
  ]);
  const [commandInput, setCommandInput] = useState("");

  if (!isOpen) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let response = `Unknown command: '${cmd}'. Available: 'test', 'status', 'benchmark', 'clear'`;
    if (cmd === "test") {
      response = "✅ Test Suite Passed: 14/14 unit tests, 0 flaky runs (took 342ms)";
    } else if (cmd === "status") {
      response = `🟢 Nodes: ${nodesActive} Active | Throughput: ${throughputSpeed}k RPS | TLS 1.3: Active`;
    } else if (cmd === "benchmark") {
      response = `📊 Benchmark: Latency p99 = 2.1ms | Peak QPS = ${(throughputSpeed * 1.4).toFixed(1)}k RPS`;
    } else if (cmd === "clear") {
      setTerminalLogs([]);
      setCommandInput("");
      return;
    }

    setTerminalLogs((prev) => [...prev, `$ ${commandInput}`, response]);
    setCommandInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Interactive Canvas & Code Cast</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  F15 LIVE
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-medium">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "canvas"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Interactive WebGL Canvas
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "terminal"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Live Code Cast & CLI
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "code"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Code2 className="w-4 h-4" />
            Kernel Source
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: INTERACTIVE WEBGL CANVAS */}
          {activeTab === "canvas" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Visual Canvas Display Area (2 cols) */}
                <div className="md:col-span-2 aspect-video bg-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-inner">
                  {/* Simulated Visual Nodes Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 relative z-10">
                    <span className="font-mono text-cyan-400">canvas://cluster-simulation.wasm</span>
                    <span className="text-[10px] text-emerald-400 font-mono">60 FPS • WebGL 2.0</span>
                  </div>

                  {/* Dynamic Nodes Visualization */}
                  <div className="flex items-center justify-center gap-3 py-6 relative z-10 flex-wrap">
                    {Array.from({ length: nodesActive }).map((_, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      >
                        <div className="w-3 h-3 rounded-full bg-cyan-400 mx-auto animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-300 mt-1 block">
                          node-0{idx + 1}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400">
                          {((throughputSpeed / nodesActive) * (0.9 + (idx % 3) * 0.1)).toFixed(1)}k RPS
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 relative z-10 border-t border-slate-800/80 pt-2">
                    <span>Sandboxed IFrame: Secure memory isolation</span>
                    <span className="text-slate-400 font-mono">Throughput: {throughputSpeed}k req/sec</span>
                  </div>
                </div>

                {/* Interactive Controls Sidebar */}
                <div className="space-y-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Live Parameters
                  </h4>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Simulated Load:</span>
                      <span className="font-mono text-cyan-400">{throughputSpeed}k RPS</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={throughputSpeed}
                      onChange={(e) => setThroughputSpeed(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Cluster Worker Nodes:</span>
                      <span className="font-mono text-cyan-400">{nodesActive}</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={nodesActive}
                      onChange={(e) => setNodesActive(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">End-to-End Encryption:</span>
                    <button
                      type="button"
                      onClick={() => setEncryptionOn(!encryptionOn)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        encryptionOn ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {encryptionOn ? "TLS 1.3 ON" : "OFF"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LIVE CODE CAST & RUNNABLE CLI */}
          {activeTab === "terminal" && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs shadow-inner h-64 overflow-y-auto space-y-1 scrollbar-thin">
                {terminalLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.startsWith("$")
                        ? "text-cyan-400 font-bold"
                        : log.startsWith("✅")
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              <form onSubmit={handleRunCommand} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 font-mono text-cyan-400 text-xs">$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Try 'test', 'status', 'benchmark', or 'clear'..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4">
                  Run Exec
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: KERNEL SOURCE */}
          {activeTab === "code" && (
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed max-h-72 scrollbar-thin">
              <pre>{`// NovaTech High-Throughput Telemetry Dispatcher
package main

import (
    "context"
    "fmt"
    "sync/atomic"
    "time"
)

type TelemetryDispatcher struct {
    workerCount  int32
    metricsRing  chan TelemetryPacket
}

func (td *TelemetryDispatcher) StreamMetrics(ctx context.Context) {
    ticker := time.NewTicker(10 * time.Millisecond)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            atomic.AddInt32(&td.workerCount, 1)
        }
    }
}`}</pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandboxed Canvas: Client-side WebAssembly execution</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-700">
            Close Canvas
          </Button>
        </div>

      </div>
    </div>
  );
};
