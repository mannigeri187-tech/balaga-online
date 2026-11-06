import React, { useState, useRef } from "react";
import {
  Code,
  Sparkles,
  RotateCcw,
  Copy,
  CheckCircle2,
  X,
  Palette,
  Calculator,
  Music
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface MicroApp {
  id: string;
  title: string;
  author: string;
  category: string;
  icon: any;
  description: string;
  htmlContent: string;
}

interface MicroAppsContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockMicroApps: MicroApp[] = [
  {
    id: "app-canvas",
    title: "Akshara Calligraphy Pad",
    author: "Kavya Murthy",
    category: "Creative Arts",
    icon: Palette,
    description: "Interactive smooth bezier stroke drawing pad for Indian typography and calligraphy sketches with touch & pressure.",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #090d16; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    canvas { background: #0f172a; border: 1px solid #334155; border-radius: 12px; cursor: crosshair; touch-action: none; }
    .toolbar { margin-top: 10px; display: flex; gap: 8px; }
    button { background: #1e293b; color: #38bdf8; border: 1px solid #475569; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; cursor: pointer; }
    button:hover { background: #334155; }
  </style>
</head>
<body>
  <canvas id="c" width="380" height="260"></canvas>
  <div class="toolbar">
    <button onclick="setColor('#38bdf8')">Sky Blue</button>
    <button onclick="setColor('#f43f5e')">Rose</button>
    <button onclick="setColor('#10b981')">Emerald</button>
    <button onclick="clearCanvas()">Clear</button>
  </div>
  <script>
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let drawing = false;
    let strokeColor = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(e) {
      const rect = c.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      return { x, y };
    }

    c.addEventListener('mousedown', (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    window.addEventListener('mouseup', () => { drawing = false; });
    c.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.strokeStyle = strokeColor;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    c.addEventListener('touchstart', (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); });
    window.addEventListener('touchend', () => { drawing = false; });
    c.addEventListener('touchmove', (e) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.strokeStyle = strokeColor;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      e.preventDefault();
    });

    function setColor(col) { strokeColor = col; }
    function clearCanvas() { ctx.clearRect(0, 0, c.width, c.height); }
  </script>
</body>
</html>`
  },
  {
    id: "app-chai-split",
    title: "Chai & Samosa Stall Calculator",
    author: "Rahul Verma",
    category: "Utility",
    icon: Calculator,
    description: "Quick mental calculator for corner tapri tea, biscuits, and filter coffee splits among friends.",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #090d16; color: #f8fafc; font-family: system-ui, sans-serif; padding: 20px; box-sizing: border-box; }
    h3 { margin: 0 0 12px 0; font-size: 15px; color: #fbbf24; }
    .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
    .btn-group { display: flex; gap: 6px; }
    button { background: #1e293b; color: #f8fafc; border: 1px solid #475569; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    button:hover { background: #334155; }
    .total-box { margin-top: 15px; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; text-align: center; }
    .total-amount { font-size: 20px; font-weight: bold; color: #10b981; font-family: monospace; }
  </style>
</head>
<body>
  <h3>☕ Tapri Chai Splitter</h3>
  <div class="row">
    <span>Cutting Chai (₹12)</span>
    <div class="btn-group">
      <button onclick="change('chai', -1)">-</button>
      <span id="chai-count" style="width:20px;text-align:center;">3</span>
      <button onclick="change('chai', 1)">+</button>
    </div>
  </div>
  <div class="row">
    <span>Filter Coffee (₹20)</span>
    <div class="btn-group">
      <button onclick="change('coffee', -1)">-</button>
      <span id="coffee-count" style="width:20px;text-align:center;">1</span>
      <button onclick="change('coffee', 1)">+</button>
    </div>
  </div>
  <div class="row">
    <span>Onion Samosa (₹15)</span>
    <div class="btn-group">
      <button onclick="change('samosa', -1)">-</button>
      <span id="samosa-count" style="width:20px;text-align:center;">2</span>
      <button onclick="change('samosa', 1)">+</button>
    </div>
  </div>
  <div class="total-box">
    <div style="font-size:11px;color:#94a3b8;">Total Bill (Split across 4 friends)</div>
    <div class="total-amount" id="total">₹86 (₹21.5 / person)</div>
  </div>
  <script>
    let counts = { chai: 3, coffee: 1, samosa: 2 };
    function change(item, delta) {
      counts[item] = Math.max(0, counts[item] + delta);
      document.getElementById(item + '-count').innerText = counts[item];
      recalc();
    }
    function recalc() {
      const sum = (counts.chai * 12) + (counts.coffee * 20) + (counts.samosa * 15);
      const perHead = (sum / 4).toFixed(1);
      document.getElementById('total').innerText = '₹' + sum + ' (₹' + perHead + ' / person)';
    }
  </script>
</body>
</html>`
  },
  {
    id: "app-synth",
    title: "Pentatonic Raga Synth",
    author: "Aditya Nair",
    category: "Music & Audio",
    icon: Music,
    description: "5-note Raag Bhupali pentatonic keyboard synthesizer running on Web Audio API oscillators.",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #090d16; color: #f8fafc; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
    h4 { margin: 0 0 10px 0; color: #a855f7; font-size: 13px; }
    .keys { display: flex; gap: 8px; }
    .key { width: 50px; height: 120px; background: #1e293b; border: 1px solid #475569; border-radius: 8px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 8px; cursor: pointer; user-select: none; transition: 0.1s; }
    .key:active { background: #a855f7; color: #fff; transform: translateY(2px); }
  </style>
</head>
<body>
  <h4>Raag Bhupali Pentatonic (Sa Re Ga Pa Dha)</h4>
  <div class="keys">
    <div class="key" onmousedown="play(261.63)"><span>Sa</span></div>
    <div class="key" onmousedown="play(293.66)"><span>Re</span></div>
    <div class="key" onmousedown="play(329.63)"><span>Ga</span></div>
    <div class="key" onmousedown="play(392.00)"><span>Pa</span></div>
    <div class="key" onmousedown="play(440.00)"><span>Dha</span></div>
    <div class="key" onmousedown="play(523.25)"><span>Sa'</span></div>
  </div>
  <script>
    let actx;
    function play(freq) {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      gain.gain.setValueAtTime(0.3, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.8);
    }
  </script>
</body>
</html>`
  }
];

export const MicroAppsContainerModal: React.FC<MicroAppsContainerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>("app-canvas");
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  if (!isOpen) return null;

  const currentApp = mockMicroApps.find((a) => a.id === selectedAppId) || mockMicroApps[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentApp.htmlContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = currentApp.htmlContent;
      setToastMessage("Container sandbox reloaded!");
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Living Micro-Apps Container
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                  S24 Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Zero-Install Sandboxed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Playable HTML5/WebAudio mini-apps embedded safely inside Balaga feed containers
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
          {/* Left: App selector */}
          <div className="w-full md:w-80 border-r border-slate-800 p-4 flex flex-col gap-3 bg-slate-950/40">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Featured Community Micro-Apps
            </span>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {mockMicroApps.map((app) => {
                const isSelected = app.id === currentApp.id;
                const AppIcon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-500/40 text-white"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AppIcon className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-semibold text-sm text-white">{app.title}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{app.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                      <span>By {app.author}</span>
                      <span className="text-sky-300">{app.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              🔒 <strong>Sandbox Security:</strong> Runs with <code>sandbox="allow-scripts"</code>. Parent cookies and DOM remain strictly protected.
            </div>
          </div>

          {/* Right: Sandboxed Runner */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">{currentApp.title}</h3>
                <p className="text-xs text-slate-400">
                  {currentApp.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReload}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="border-slate-700 text-xs"
                >
                  Reload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={<Copy className="w-3.5 h-3.5" />}
                  className="border-slate-700 text-xs text-sky-300"
                >
                  {copiedCode ? "Copied HTML!" : "Remix Code"}
                </Button>
              </div>
            </div>

            {toastMessage && (
              <div className="p-2.5 bg-sky-950/60 border border-sky-500/40 rounded-xl text-xs text-sky-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* IFrame Sandbox Container */}
            <div className="flex-1 min-h-[380px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  balaga-sandbox://{currentApp.id}.container
                </span>
                <span>Active 60fps WebGL/Canvas Runtime</span>
              </div>
              <iframe
                key={currentApp.id}
                ref={iframeRef}
                srcDoc={currentApp.htmlContent}
                title={currentApp.title}
                sandbox="allow-scripts"
                className="w-full flex-1 border-0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Zero backend server spin-up: 100% evaluated client-side in secure sandbox context</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Close Container
          </Button>
        </div>
      </div>
    </div>
  );
};
