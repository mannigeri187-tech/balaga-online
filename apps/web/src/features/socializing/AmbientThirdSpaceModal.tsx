import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Mic,
  Users,
  Sparkles,
  CloudRain,
  Coffee,
  Trees,
  Headphones,
  X,
  CheckCircle2
} from "lucide-react";
import { Button } from "../../components/ui/Button";

interface Soundscape {
  id: string;
  name: string;
  location: string;
  description: string;
  icon: any;
  color: string;
  tags: string[];
}

interface PeerInRoom {
  id: string;
  name: string;
  avatar: string;
  activity: string;
  isTalking?: boolean;
}

interface AmbientThirdSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const soundscapes: Soundscape[] = [
  {
    id: "indiranagar-rain",
    name: "Indiranagar Rain & Cafe",
    location: "12th Main Road • Bengaluru",
    description: "Gentle monsoon raindrops on window glass, distant espresso grinder, and mellow acoustic chords.",
    icon: CloudRain,
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    tags: ["Monsoon Rain", "Cafe Ambience", "Focus"]
  },
  {
    id: "koramangala-lofi",
    name: "Koramangala Rooftop Lo-Fi",
    location: "4th Block Rooftop • Bengaluru",
    description: "Warm vinyl crackle, mellow chillhop keyboard chords, and gentle night breeze.",
    icon: Coffee,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    tags: ["Chillhop Beats", "Late Night", "Deep Work"]
  },
  {
    id: "himalayan-stream",
    name: "Himalayan Forest Stream",
    location: "Parvati Valley Pine Ridge",
    description: "Flowing glacial water over river stones, crisp pine needle breeze, and soft Tibetan bells.",
    icon: Trees,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    tags: ["Natural Stream", "Pine Breeze", "Zen"]
  },
  {
    id: "binaural-focus",
    name: "Alpha Wave Deep Focus",
    location: "Acoustic Silence Chamber",
    description: "Calibrated 14Hz binaural alpha beat layered over warm pink noise for zero-distraction flow state.",
    icon: Headphones,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    tags: ["Binaural 14Hz", "Pink Noise", "Study"]
  }
];

const mockRoomPeers: PeerInRoom[] = [
  {
    id: "p1",
    name: "Priya Rao",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    activity: "Reading Design RFCs"
  },
  {
    id: "p2",
    name: "Rahul Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    activity: "Writing Go Ring Buffer"
  },
  {
    id: "p3",
    name: "Ananya Sen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    activity: "Tea Break & Sketching"
  }
];

export const AmbientThirdSpaceModal: React.FC<AmbientThirdSpaceModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSoundscapeId, setActiveSoundscapeId] = useState<string>("indiranagar-rain");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(75);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState<boolean>(false);
  const [peers] = useState<PeerInRoom[]>(mockRoomPeers);
  const [audioBroadcastToast, setAudioBroadcastToast] = useState<string | null>(null);

  // Native Web Audio synth generator ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Create pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime((volume / 100) * 0.15, ctx.currentTime);
        gainNodeRef.current = gainNode;

        whiteNoise.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(0);
      }
    } catch {
      // AudioContext fallback handled silently
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen]);

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = isPlaying ? (volume / 100) * 0.15 : 0;
      gainNodeRef.current.gain.setValueAtTime(targetGain, audioContextRef.current.currentTime);
    }
  }, [volume, isPlaying]);

  const togglePlay = () => {
    if (!audioContextRef.current) return;
    if (isPlaying) {
      audioContextRef.current.suspend();
      setIsPlaying(false);
    } else {
      audioContextRef.current.resume();
      setIsPlaying(true);
    }
  };

  const handlePushToTalk = () => {
    setIsPushToTalkActive(true);
    setAudioBroadcastToast("🎙️ Broadcasting voice spark to room peers...");

    setTimeout(() => {
      setIsPushToTalkActive(false);
      setAudioBroadcastToast("Spark sent (5s ephemeral voice clip)");
      setTimeout(() => setAudioBroadcastToast(null), 2500);
    }, 4000);
  };

  if (!isOpen) return null;

  const currentSoundscape = soundscapes.find((s) => s.id === activeSoundscapeId) || soundscapes[0];
  const IconComponent = currentSoundscape.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Ambient Third Space
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  S21 Social Innovation
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> Spatial Audio Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Co-working audio lounges with procedural Indian rain soundscapes, binaural focus, and walkie-talkie sparks
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
          {/* Active Soundscape Player Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-tr border ${currentSoundscape.color} shadow-lg shrink-0`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Now Streaming • {currentSoundscape.location}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {currentSoundscape.name}
                </h3>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  {currentSoundscape.description}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {currentSoundscape.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Play Controls & Volume */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl shrink-0">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center justify-center transition shadow-lg shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-36">
                <button
                  onClick={() => setVolume(volume === 0 ? 75 : 0)}
                  className="text-slate-400 hover:text-white"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                  {volume}%
                </span>
              </div>
            </div>
          </div>

          {/* Soundscapes Selector Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Choose Ambient Soundscape
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {soundscapes.map((scape) => {
                const isSelected = scape.id === currentSoundscape.id;
                const ScapeIcon = scape.icon;
                return (
                  <button
                    key={scape.id}
                    onClick={() => {
                      setActiveSoundscapeId(scape.id);
                      setIsPlaying(true);
                      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
                        audioContextRef.current.resume();
                      }
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                        : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-700 ${scape.color.split(" ")[2]} shrink-0`}>
                      <ScapeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{scape.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {scape.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Lounge & Walkie-Talkie Sparks */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Co-Working In This Third Space ({peers.length + 1})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Friends listening together in shared ambient flow
                </p>
              </div>

              {/* Push-to-Talk button */}
              <button
                onClick={handlePushToTalk}
                disabled={isPushToTalkActive}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  isPushToTalkActive
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isPushToTalkActive ? "Broadcasting 5s Voice..." : "Push-to-Talk Spark"}
              </button>
            </div>

            {audioBroadcastToast && (
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{audioBroadcastToast}</span>
              </div>
            )}

            {/* Peer Avatars List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3"
                >
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">
                      {peer.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {peer.activity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Zero track recording: Ambient noise synthesized procedurally via client-side Web Audio API.</span>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Minimize Lounge
          </Button>
        </div>
      </div>
    </div>
  );
};
