import React, { useState } from "react";
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  IndianRupee,
} from "lucide-react";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (details: { txnId: string; amount: number; plan: string }) => void;
}

const PRESET_PLANS = [
  {
    id: "creator_monthly",
    name: "Creator Monthly",
    price: 199,
    description: "Full Socializing realm, IndicTrans2 Bhasha, Hey.xyz 4-quad media & verified badge.",
    popular: false,
  },
  {
    id: "founder_quarterly",
    name: "Founder Quarterly",
    price: 499,
    description: "Founders realm, Twenty CRM Kanban, Cal.com Schedulers & Dub.co attribution.",
    popular: true,
  },
  {
    id: "all_access_annual",
    name: "All-Access Annual",
    price: 999,
    description: "Unlimited access across both Socializing & Founders realms with zero data bleed.",
    popular: false,
  },
];

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(PRESET_PLANS[1]);
  const [upiId] = useState("balaga@okhdfcbank");
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulatedSuccess, setIsSimulatedSuccess] = useState(false);
  const [simulatedTxnId, setSimulatedTxnId] = useState("");

  if (!isOpen) return null;

  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    "Balaga Online"
  )}&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(
    `Balaga ${selectedPlan.name}`
  )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    const txnId = `TXN_UPI_${Date.now().toString().slice(-8)}`;
    setSimulatedTxnId(txnId);
    setIsSimulatedSuccess(true);
    if (onPaymentSuccess) {
      onPaymentSuccess({
        txnId,
        amount: selectedPlan.price,
        plan: selectedPlan.name,
      });
    }
  };

  const handleReset = () => {
    setIsSimulatedSuccess(false);
    setSimulatedTxnId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/20 to-teal-400/20 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Zero-Fee UPI Gateway
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                0% MDR
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct NPCI settlement — instant activation across both realms
            </p>
          </div>
        </div>

        {isSimulatedSuccess ? (
          /* Payment Success State */
          <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Payment Confirmed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your <span className="text-emerald-400 font-bold">{selectedPlan.name}</span> subscription is now active.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-white">{simulatedTxnId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400">₹{selectedPlan.price}.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>UPI Payee:</span>
                <span className="font-mono text-slate-300">{upiId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Instant Settlement (NPCI)
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Continue to Realm
            </button>
          </div>
        ) : (
          /* Payment Configuration & QR State */
          <div>
            {/* Plan Selector */}
            <div className="mb-5 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Select Your Access Pass:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-900/30"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 right-2 text-[9px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full">
                          Best
                        </span>
                      )}
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {plan.name}
                      </div>
                      <div className="text-sm font-black text-emerald-400 mt-1">
                        ₹{plan.price}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                {selectedPlan.description}
              </p>
            </div>

            {/* QR Code and Instructions Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5">
              {/* Dynamic QR Code */}
              <div className="bg-white p-2 rounded-2xl shrink-0 shadow-lg shadow-black/50">
                <img
                  src={qrImageUrl}
                  alt={`Scan to pay ₹${selectedPlan.price} via UPI`}
                  className="w-36 h-36 rounded-lg object-contain"
                  loading="lazy"
                />
              </div>

              {/* Instructions and Details */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <div className="text-xs text-slate-400">Payable Amount:</div>
                  <div className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-0.5">
                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                    <span>{selectedPlan.price}.00</span>
                  </div>
                </div>

                {/* Copy UPI ID */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Official UPI ID:
                  </div>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-300">
                      {upiId}
                    </span>
                    <button
                      onClick={handleCopyUpi}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy UPI VPA"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Intent 1-Tap Link */}
                <a
                  href={upiUri}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Tap to open GPay / PhonePe</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Instant UPI Payment (Dev / Testing)</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct NPCI UPI Bank Settlement</span>
              </div>
              <span className="font-mono text-slate-400">0% Commission</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
