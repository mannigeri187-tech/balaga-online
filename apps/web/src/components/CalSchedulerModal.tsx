import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Sparkles,
  User,
} from "lucide-react";

export interface CalHostDetails {
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  topic?: string;
  pricingLabel?: string;
}

export interface CalSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: CalHostDetails;
  onBookingConfirmed?: (booking: {
    host: CalHostDetails;
    date: string;
    time: string;
    durationMinutes: number;
    meetUrl: string;
    agenda: string;
  }) => void;
}

export const CalSchedulerModal: React.FC<CalSchedulerModalProps> = ({
  isOpen,
  onClose,
  host,
  onBookingConfirmed,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>("11:30 AM");
  const [step, setStep] = useState<"slot_selection" | "booking_details" | "confirmed">("slot_selection");
  const [agenda, setAgenda] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("Aarav Sharma");
  const [guestEmail, setGuestEmail] = useState<string>("aarav.builder@balaga.online");
  const selectedTimezone = "Asia/Kolkata (IST, GMT+5:30)";

  // Generate the next 10 business days starting from today
  const availableDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    let current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 0; i < 14 && dates.length < 10; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      // Skip Sundays
      if (d.getDay() !== 0) {
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const monthName = d.toLocaleDateString("en-US", { month: "short" });
        const dayNumber = d.getDate();
        const isoString = d.toISOString().split("T")[0];
        dates.push({
          dayName,
          monthName,
          dayNumber,
          isoString,
          fullLabel: `${dayName}, ${monthName} ${dayNumber}`,
        });
      }
    }
    return dates;
  }, []);

  // Time slots for morning, afternoon and evening
  const timeSlots = useMemo(() => {
    return [
      { id: "s-1", time: "10:00 AM", period: "Morning", available: true },
      { id: "s-2", time: "10:45 AM", period: "Morning", available: true },
      { id: "s-3", time: "11:30 AM", period: "Morning", available: true },
      { id: "s-4", time: "02:00 PM", period: "Afternoon", available: true },
      { id: "s-5", time: "02:45 PM", period: "Afternoon", available: false },
      { id: "s-6", time: "03:30 PM", period: "Afternoon", available: true },
      { id: "s-7", time: "04:15 PM", period: "Afternoon", available: true },
      { id: "s-8", time: "05:00 PM", period: "Evening", available: true },
      { id: "s-9", time: "06:30 PM", period: "Evening", available: true },
    ];
  }, []);

  if (!isOpen) return null;

  const activeDate = availableDates[selectedDateIndex] || availableDates[0];
  const generatedMeetId = useMemo(() => {
    return `huddle-${Math.random().toString(36).substring(2, 8)}`;
  }, [host.name]);
  const meetUrl = `https://meet.balaga.online/${generatedMeetId}`;

  // Generate Google Calendar Link
  const googleCalendarUrl = useMemo(() => {
    const title = encodeURIComponent(`Balaga 1-on-1: ${host.name} & ${guestName}`);
    const details = encodeURIComponent(
      `Mentorship/Discussion Session on Balaga Founders Realm.\nHost: ${host.name} (${host.role})\nTopic: ${host.topic || "Startup Architecture"}\nMeet Link: ${meetUrl}\nAgenda: ${agenda || "Discussion on roadmap and scale."}`
    );
    const location = encodeURIComponent(meetUrl);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  }, [host, guestName, meetUrl, agenda]);

  // Download .ics File
  const handleDownloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Balaga Online//Cal Scheduler//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Balaga Session with ${host.name}`,
      `DESCRIPTION:${host.topic || "Founders Mentorship"} - Meeting link: ${meetUrl}`,
      `LOCATION:${meetUrl}`,
      `DTSTART:${activeDate.isoString.replace(/-/g, "")}T100000Z`,
      `DTEND:${activeDate.isoString.replace(/-/g, "")}T103000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balaga-session-${host.name.toLowerCase().replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (onBookingConfirmed && selectedSlot) {
      onBookingConfirmed({
        host,
        date: activeDate.fullLabel,
        time: selectedSlot,
        durationMinutes,
        meetUrl,
        agenda,
      });
    }
    setStep("confirmed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10"
          aria-label="Close scheduler"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "confirmed" ? (
          /* Confirmation Success Screen */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confirmed & Calendar Synced</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">You are officially scheduled!</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8">
              A calendar invite and encrypted meeting link have been prepared for you and{" "}
              <span className="text-white font-medium">{host.name}</span>.
            </p>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 w-full max-w-md text-left space-y-4 mb-8">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-200">
                  {host.avatarUrl ? (
                    <img src={host.avatarUrl} alt={host.name} className="w-full h-full object-cover" />
                  ) : (
                    host.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{host.name}</div>
                  <div className="text-xs text-slate-400">{host.role} {host.company ? `@ ${host.company}` : ""}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Date</span>
                  </div>
                  <div className="font-semibold text-slate-200">{activeDate.fullLabel}</div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time & Length</span>
                  </div>
                  <div className="font-semibold text-slate-200">{selectedSlot} ({durationMinutes} mins)</div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Meeting Room</span>
                </div>
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{meetUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={handleDownloadIcs}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Download .ics Invite</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Cal.com Layout */
          <div className="grid md:grid-cols-12 min-h-[560px]">
            {/* Left Column: Host info, Duration & Timezone */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
              <div>
                {/* Host Card */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center">
                      {host.avatarUrl ? (
                        <img src={host.avatarUrl} alt={host.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-amber-400">1-on-1 Office Hours</div>
                    <h3 className="text-lg font-bold text-white">{host.name}</h3>
                    <p className="text-xs text-slate-400">{host.role} {host.company ? `@ ${host.company}` : ""}</p>
                  </div>
                </div>

                {host.topic && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 mb-6">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Session Topic</div>
                    <div className="text-xs text-slate-200 font-medium leading-relaxed">{host.topic}</div>
                  </div>
                )}

                {/* Duration Picker */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Call Duration</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDurationMinutes(mins)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          durationMinutes === mins
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                        }`}
                      >
                        {mins} mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Meeting Location */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Balaga Video Huddle (Encrypted P2P)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>{selectedTimezone}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Free notice */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Fee</span>
                <span className="font-bold text-emerald-400">
                  {host.pricingLabel || "Free (Balaga Founders)"}
                </span>
              </div>
            </div>

            {/* Right Column: Date picker & Time slots OR Form */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              {step === "slot_selection" ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-400" />
                      <span>Select Day & Time</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeDate.fullLabel}
                    </span>
                  </div>

                  {/* Horizontal Date Picker Strip */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {availableDates.slice(0, 5).map((date, idx) => (
                      <button
                        key={date.isoString}
                        onClick={() => {
                          setSelectedDateIndex(idx);
                          setSelectedSlot(null);
                        }}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          selectedDateIndex === idx
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                            : "bg-slate-950/40 hover:bg-slate-800 text-slate-300 border-slate-800/80"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                          {date.dayName}
                        </div>
                        <div className="text-base font-extrabold mt-0.5">
                          {date.dayNumber}
                        </div>
                        <div className="text-[9px] opacity-60">
                          {date.monthName}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Available Time Slots Grid */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-slate-400 mb-3">
                      Available Slots ({durationMinutes} mins each)
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-medium transition-all border ${
                            selectedSlot === slot.time
                              ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20"
                              : slot.available
                              ? "bg-slate-950/60 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700"
                              : "bg-slate-950/20 text-slate-600 border-slate-900 cursor-not-allowed line-through"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      {selectedSlot ? (
                        <span>Selected: <strong className="text-white">{activeDate.dayName}, {selectedSlot}</strong></span>
                      ) : (
                        <span>Pick an available time slot</span>
                      )}
                    </div>
                    <button
                      disabled={!selectedSlot}
                      onClick={() => setStep("booking_details")}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        selectedSlot
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Booking Details & Agenda */
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setStep("slot_selection")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h4 className="text-sm font-bold text-white">Your Session Details</h4>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400">Time:</span>{" "}
                        <strong className="text-white">{activeDate.fullLabel} at {selectedSlot}</strong>
                      </div>
                      <div className="text-amber-400 font-semibold">{durationMinutes} mins</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Your Email</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        What would you like to discuss? (Agenda)
                      </label>
                      <textarea
                        rows={3}
                        value={agenda}
                        onChange={(e) => setAgenda(e.target.value)}
                        placeholder="e.g. Architecture review for our high-throughput payment pipeline, or seed pitch feedback..."
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none placeholder-slate-600"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setStep("slot_selection")}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Back to Calendar
                    </button>

                    <button
                      onClick={handleConfirm}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Book Meeting</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
