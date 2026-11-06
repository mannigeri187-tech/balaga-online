import React, { useState } from "react";
import {
  Presentation,
  Play,
  Pause,
  Code2,
  FileText,
  X
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface TalkChapter {
  timeSeconds: number;
  timeLabel: string;
  title: string;
  slideIndex: number;
  codeAnchor: string;
}

interface TechTalk {
  id: string;
  title: string;
  speaker: string;
  speakerRole: string;
  meetupGroup: string;
  duration: string;
  videoUrl: string;
  repoUrl: string;
  slidesCount: number;
  chapters: TalkChapter[];
  slides: string[];
}

interface TechTalkMasterclassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockTalks: TechTalk[] = [
  {
    id: "talk-1",
    title: "Scaling Distributed Ledgers to 100k TPS on Commodity NVMe",
    speaker: "Karthik Subramanian",
    speakerRole: "Principal Systems Engineer, ex-Zerodha",
    meetupGroup: "Rust Bangalore Meetup #42",
    duration: "24:18",
    videoUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80",
    repoUrl: "github.com/balaga-labs/nvme-ring-buffer",
    slidesCount: 14,
    chapters: [
      {
        timeSeconds: 0,
        timeLabel: "00:00",
        title: "The Kernel Syscall Bottleneck",
        slideIndex: 1,
        codeAnchor: "src/io_uring_driver.rs",
      },
      {
        timeSeconds: 320,
        timeLabel: "05:20",
        title: "Zero-Copy Circular Ring Buffer",
        slideIndex: 4,
        codeAnchor: "src/ring_buffer.rs#L42",
      },
      {
        timeSeconds: 780,
        timeLabel: "13:00",
        title: "P99.99 Latency Benchmarks on AWS i3en",
        slideIndex: 9,
        codeAnchor: "benches/nvme_throughput.rs",
      },
      {
        timeSeconds: 1240,
        timeLabel: "20:40",
        title: "Production Failure Modes & Crash Recovery",
        slideIndex: 12,
        codeAnchor: "src/recovery/wal.rs",
      },
    ],
    slides: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    ],
  },
  {
    id: "talk-2",
    title: "Building Micro-Frontend Architecture for High-Volume Mobile Web",
    speaker: "Ananya Deshmukh",
    speakerRole: "Staff UI Architect, ex-Flipkart",
    meetupGroup: "React Bangalore Summit '26",
    duration: "18:45",
    videoUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
    repoUrl: "github.com/balaga-labs/module-federation-core",
    slidesCount: 18,
    chapters: [
      {
        timeSeconds: 0,
        timeLabel: "00:00",
        title: "Why Monolithic Bundles Hurt India Tier 2/3 Latency",
        slideIndex: 1,
        codeAnchor: "packages/shell/vite.config.ts",
      },
      {
        timeSeconds: 290,
        timeLabel: "04:50",
        title: "Async Module Federation with Bytecode Caching",
        slideIndex: 6,
        codeAnchor: "packages/federation/loader.ts",
      },
      {
        timeSeconds: 810,
        timeLabel: "13:30",
        title: "Figma-to-Code Spatial Tokens at Scale",
        slideIndex: 14,
        codeAnchor: "design-system/tokens.json",
      },
    ],
    slides: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    ],
  },
];

export const TechTalkMasterclassModal: React.FC<TechTalkMasterclassModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTalk, setSelectedTalk] = useState<TechTalk>(mockTalks[0]);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentChapter = selectedTalk.chapters[activeChapterIdx] || selectedTalk.chapters[0];

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIdx(idx);
    setActiveSlideIdx(idx % selectedTalk.slides.length);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Tech Talk Sync & Slide Masterclass</h2>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  F19 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Synchronized talk video, presentation slide deck, and live GitHub repo viewer.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Talk Selector Pill Bar */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/20 flex gap-2 overflow-x-auto text-xs">
          {mockTalks.map((talk) => (
            <button
              key={talk.id}
              onClick={() => {
                setSelectedTalk(talk);
                setActiveChapterIdx(0);
                setActiveSlideIdx(0);
                setIsPlaying(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium truncate max-w-xs transition-colors ${
                selectedTalk.id === talk.id
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {talk.title}
            </button>
          ))}
        </div>

        {/* Split Synchronized Grid Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Video & Synced Chapters (7 cols) */}
          <div className="md:col-span-7 border-r border-slate-800/80 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {/* Video Player Display */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group">
              <img
                src={selectedTalk.videoUrl}
                alt={selectedTalk.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
              </div>

              {/* Video Overlay Badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow">
                <span className="font-medium">{selectedTalk.speaker}</span>
                <span className="font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded-full border border-slate-700">
                  {currentChapter.timeLabel} / {selectedTalk.duration}
                </span>
              </div>
            </div>

            {/* Talk Title & Speaker Credentials */}
            <div>
              <h3 className="text-sm font-bold text-slate-100">{selectedTalk.title}</h3>
              <p className="text-xs text-purple-400 font-medium mt-0.5">
                {selectedTalk.speaker} • <span className="text-slate-400">{selectedTalk.speakerRole}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {selectedTalk.meetupGroup}
                </span>
                <span className="text-slate-500">Duration: {selectedTalk.duration}</span>
              </div>
            </div>

            {/* Synced Chapters Navigation */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Synchronized Talk Chapters (Click to Jump):
              </span>
              <div className="space-y-1.5">
                {selectedTalk.chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectChapter(idx)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      activeChapterIdx === idx
                        ? "bg-purple-950/40 border-purple-500/50 text-purple-200"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] text-purple-400 font-bold shrink-0">
                        {ch.timeLabel}
                      </span>
                      <span className="truncate font-medium">{ch.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      Slide {ch.slideIndex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Synced Slide Deck & GitHub Repo Anchor (5 cols) */}
          <div className="md:col-span-5 p-5 overflow-y-auto space-y-4 bg-slate-900/20 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Synchronized Slide Viewer */}
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> Synced Slide Deck
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Slide {currentChapter.slideIndex} of {selectedTalk.slidesCount}
                  </span>
                </div>
                
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                  <img
                    src={selectedTalk.slides[activeSlideIdx] || selectedTalk.slides[0]}
                    alt="Current Slide"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
                    Auto-Synchronized
                  </div>
                </div>
              </div>

              {/* GitHub Anchor Link */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Active Code Reference
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Jump to Git</span>
                </div>
                <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-300 truncate">
                  {currentChapter.codeAnchor}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Repo: <strong className="text-slate-400">{selectedTalk.repoUrl}</strong>
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://${selectedTalk.repoUrl}`, "_blank")}
                className="text-xs border-slate-700 text-slate-300 hover:text-white"
              >
                <Code2 className="w-3.5 h-3.5 mr-1" />
                Inspect Repo
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Download Deck (.PDF)
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
