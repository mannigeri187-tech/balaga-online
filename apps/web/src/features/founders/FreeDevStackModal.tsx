import React, { useState } from "react";
import {
  Sparkles,
  Globe,
  Mail,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  X,
} from "lucide-react";

interface FreeDevStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSubdomain?: () => void;
}

interface DevService {
  name: string;
  category: "hosting" | "database" | "ai" | "auth" | "storage" | "email" | "payments";
  freeTierQuota: string;
  description: string;
  link: string;
  icon: string;
  envSnippet?: string;
}

const FREE_SERVICES: DevService[] = [
  // PaaS & Hosting
  {
    name: "Render",
    category: "hosting",
    freeTierQuota: "750 free hrs/mo (Web Service + PostgreSQL)",
    description: "Full-stack hosting for Node.js, Python, Go, and static sites with automatic SSL.",
    link: "https://render.com",
    icon: "🚀",
    envSnippet: "PORT=10000\nNODE_ENV=production",
  },
  {
    name: "Vercel",
    category: "hosting",
    freeTierQuota: "100GB bandwidth, unlimited previews",
    description: "Fast zero-config serverless hosting for Next.js, Vite, React and frontend web apps.",
    link: "https://vercel.com",
    icon: "▲",
  },
  {
    name: "Cloudflare Pages & Workers",
    category: "hosting",
    freeTierQuota: "100k requests/day, unlimited bandwidth",
    description: "Ultra-fast global edge compute and static site hosting with instant deployment.",
    link: "https://pages.cloudflare.com",
    icon: "⚡",
  },

  // Databases
  {
    name: "Supabase (PostgreSQL)",
    category: "database",
    freeTierQuota: "500MB DB, 50k MAUs, 1GB storage",
    description: "Open-source Firebase alternative: Postgres DB, Auth, Realtime subscriptions and Storage.",
    link: "https://supabase.com",
    icon: "⚡",
    envSnippet: "SUPABASE_URL=https://your-project.supabase.co\nSUPABASE_ANON_KEY=eyJhbGciOi...",
  },
  {
    name: "Neon (Serverless Postgres)",
    category: "database",
    freeTierQuota: "0.5GB storage, branching included",
    description: "Serverless PostgreSQL with instant autoscaling and git-like branchable databases.",
    link: "https://neon.tech",
    icon: "🐘",
    envSnippet: "DATABASE_URL=postgres://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  },
  {
    name: "Turso (libSQL/SQLite)",
    category: "database",
    freeTierQuota: "9GB storage, 500 databases, edge replication",
    description: "Edge-first SQLite database built on libSQL with global multi-region replicas.",
    link: "https://turso.tech",
    icon: "🗄️",
  },

  // AI & LLM Inference
  {
    name: "Groq Cloud",
    category: "ai",
    freeTierQuota: "Free LPU speed (Llama 3.3 70B, Mixtral)",
    description: "Blazing-fast LPUs delivering 500+ tokens/sec on top open-source AI models at ₹0.",
    link: "https://console.groq.com",
    icon: "🧠",
    envSnippet: "GROQ_API_KEY=gsk_your_api_key_here\nGROQ_MODEL=llama-3.3-70b-versatile",
  },
  {
    name: "Cloudflare Workers AI",
    category: "ai",
    freeTierQuota: "10,000 neurons/day free",
    description: "Serverless GPU inference for embeddings, speech-to-text, and vision on Cloudflare edge.",
    link: "https://developers.cloudflare.com/workers-ai",
    icon: "🤖",
  },

  // Auth & Identity
  {
    name: "Clerk",
    category: "auth",
    freeTierQuota: "10,000 monthly active users",
    description: "Complete user authentication, social logins, MFA, and user profile management UI.",
    link: "https://clerk.com",
    icon: "🔐",
    envSnippet: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\nCLERK_SECRET_KEY=sk_test_...",
  },
  {
    name: "Supabase Auth",
    category: "auth",
    freeTierQuota: "50,000 MAUs free",
    description: "Built-in email/password, magic links, phone OTP, and Google/GitHub OAuth.",
    link: "https://supabase.com/auth",
    icon: "🛡️",
  },

  // Email & Messaging
  {
    name: "Resend",
    category: "email",
    freeTierQuota: "3,000 emails/month (100/day)",
    description: "Modern developer-first transactional email API with React Email template support.",
    link: "https://resend.com",
    icon: "✉️",
    envSnippet: "RESEND_API_KEY=re_123456789\nEMAIL_FROM=founder@yourstartup.com",
  },
  {
    name: "Cloudflare Email Routing",
    category: "email",
    freeTierQuota: "100% Free Unlimited Inbound Routing",
    description: "Receive custom domain emails (e.g. team@startup.com) and forward them free to personal Gmail.",
    link: "https://developers.cloudflare.com/email-routing",
    icon: "📬",
  },
  {
    name: "Zoho Mail Forever Free",
    category: "email",
    freeTierQuota: "5 free mailboxes (5GB each)",
    description: "Zero-cost business webmail accounts on your own custom domain with mobile app access.",
    link: "https://www.zoho.com/mail/zohomail-pricing.html",
    icon: "💼",
  },

  // Storage & Object CDN
  {
    name: "Cloudflare R2",
    category: "storage",
    freeTierQuota: "10 GB storage/month, ZERO egress fees",
    description: "S3-compatible object storage for file, image, and video uploads with no bandwidth charges.",
    link: "https://www.cloudflare.com/developer-platform/r2",
    icon: "📦",
    envSnippet: "R2_ACCOUNT_ID=...\nR2_ACCESS_KEY_ID=...\nR2_SECRET_ACCESS_KEY=...",
  },

  // Payments & Monetization
  {
    name: "UPI Direct QR / VPA",
    category: "payments",
    freeTierQuota: "0% Transaction Fees (RBI Zero-MDR)",
    description: "Accept instant payments via Google Pay, PhonePe, and Paytm directly to your bank with zero gateway fees.",
    link: "https://www.npci.org.in/what-we-do/upi/product-overview",
    icon: "🇮🇳",
    envSnippet: "UPI_VPA=yourname@okaxis\nUPI_MERCHANT_NAME=YourStartup",
  },
  {
    name: "Razorpay (Test & Production)",
    category: "payments",
    freeTierQuota: "No setup fee, pay-as-you-transact (2%)",
    description: "Cards, Netbanking, UPI, and Subscription mandates for Indian businesses with instant activation.",
    link: "https://razorpay.com",
    icon: "💳",
    envSnippet: "RAZORPAY_KEY_ID=rzp_test_...\nRAZORPAY_KEY_SECRET=...",
  },
];

export const FreeDevStackModal: React.FC<FreeDevStackModalProps> = ({
  isOpen,
  onClose,
  onClaimSubdomain,
}) => {
  const [activeTab, setActiveTab] = useState<"catalog" | "domain" | "email" | "payments" | "env">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Live UPI Generator state
  const [upiVpa, setUpiVpa] = useState("aarav@okhdfcbank");
  const [upiPayeeName, setUpiPayeeName] = useState("Balaga Innovator");
  const [upiAmount, setUpiAmount] = useState("499");
  const [upiNote, setUpiNote] = useState("Startup MVP Pre-Order");

  if (!isOpen) return null;

  const filteredServices = FREE_SERVICES.filter((s) => {
    const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.freeTierQuota.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const upiIntentString = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
    upiPayeeName
  )}&am=${encodeURIComponent(upiAmount)}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Free-For-Dev ₹0 Startup Infrastructure Hub</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  90K+ ⭐ CURATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run a production SaaS with ₹0 cloud bills · Free domain, custom email, database & zero-MDR UPI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-2 gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: "catalog", label: "₹0 Service Directory 📚" },
            { id: "domain", label: "Free Domain & Subdomain 🌐" },
            { id: "email", label: "Free Custom Email ✉️" },
            { id: "payments", label: "Zero-Fee Payments 🇮🇳" },
            { id: "env", label: "Master .env Boilerplate ⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: CATALOG */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "All Services" },
                    { id: "hosting", label: "Hosting / PaaS" },
                    { id: "database", label: "Databases" },
                    { id: "ai", label: "AI Inference" },
                    { id: "auth", label: "Auth" },
                    { id: "email", label: "Email" },
                    { id: "storage", label: "Storage" },
                    { id: "payments", label: "Payments" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition border ${
                        selectedCategory === cat.id
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search 1,000+ free tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 max-w-xs"
                />
              </div>

              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredServices.map((svc) => (
                  <div
                    key={svc.name}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{svc.icon}</span>
                          <h4 className="text-xs font-bold text-white">{svc.name}</h4>
                        </div>
                        <a
                          href={svc.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                          title="Open official website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{svc.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-semibold text-[10px]">
                        {svc.freeTierQuota}
                      </span>
                      {svc.envSnippet && (
                        <button
                          onClick={() => handleCopy(svc.envSnippet!, svc.name)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          {copiedSnippet === svc.name ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedSnippet === svc.name ? "Copied" : ".env"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FREE DOMAIN & SUBDOMAIN */}
          {activeTab === "domain" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>How to Get a Free Domain for Your Startup</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You do not need to buy an expensive domain to launch your MVP. Balaga provides free instant subdomains with automated SSL, and platforms like GitHub provide free student domains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Balaga Free Subdomain */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Option 1: Instant Balaga Subdomain</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        100% FREE FOREVER
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Claim <strong className="text-slate-200">yourstartup.balaga.online</strong> directly inside the platform. Includes automated wildcard SSL, Cloudflare global edge caching, and DNS verification in under 30 seconds.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onClaimSubdomain?.();
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Launch Subdomain Claimer</span>
                  </button>
                </div>

                {/* Option 2: GitHub Student / Free TLDs */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Option 2: GitHub Student / Cloudflare</span>
                      </span>
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                        FREE 1 YEAR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      If you have an academic email (.edu / .ac.in), GitHub Student Developer Pack grants 1 free year of a custom domain (<code className="text-sky-300">.me</code>, <code className="text-sky-300">.tech</code>, or <code className="text-sky-300">.live</code>) via Namecheap.
                    </p>
                  </div>

                  <a
                    href="https://education.github.com/pack"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Claim via GitHub Pack</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FREE CUSTOM EMAIL */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Free Business Email Setup (₹0 Google Workspace Alternative)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google Workspace costs ₹250–₹750/user/month. As a bootstrapped founder, you can run professional emails like <code className="text-emerald-300">founder@yourstartup.com</code> completely free using either of these two paths:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: Cloudflare Email Routing (Forwarding) */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Method A: Cloudflare Routing</h4>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      UNLIMITED & FREE
                    </span>
                  </div>
                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                    <li>Add your domain to Cloudflare (Free plan).</li>
                    <li>Go to <strong className="text-slate-200">Email Routing</strong> → Enable.</li>
                    <li>Create custom addresses: <code className="text-slate-300">hello@startup.com</code>, <code className="text-slate-300">contact@startup.com</code>.</li>
                    <li>Set destination to your personal Gmail.</li>
                    <li>Incoming emails land right in your normal inbox instantly.</li>
                  </ol>
                  <a
                    href="https://developers.cloudflare.com/email-routing"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-1"
                  >
                    <span>Cloudflare Setup Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Method B: Zoho Mail Forever Free (Full Webmail) */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Method B: Zoho Mail Free Plan</h4>
                    <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                      5 MAILBOXES (5GB)
                    </span>
                  </div>
                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                    <li>Sign up on Zoho Mail under the <strong className="text-slate-200">Forever Free Plan</strong>.</li>
                    <li>Add your domain and add 2 MX DNS records in your domain registrar.</li>
                    <li>Get 5 real, dedicated mailboxes with full IMAP/Webmail access.</li>
                    <li>Send and receive directly as <code className="text-slate-300">founder@startup.com</code> with zero bills.</li>
                  </ol>
                  <a
                    href="https://www.zoho.com/mail/zohomail-pricing.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline pt-1"
                  >
                    <span>Zoho Free Plan Signup</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ZERO-FEE UPI & PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Zero-MDR UPI Payment Gateway (0% Fees)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In India, UPI payments are legally zero-fee (RBI Zero-MDR). You do not need to pay payment gateway commissions (2%–3%) for early MVP pre-orders or customer payments. Generate a direct UPI Intent or dynamic QR code below:
                </p>
              </div>

              {/* Live Generator Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure UPI Payment</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Your UPI VPA / ID (GPay / PhonePe / Paytm):</label>
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Payee Business / Founder Name:</label>
                      <input
                        type="text"
                        value={upiPayeeName}
                        onChange={(e) => setUpiPayeeName(e.target.value)}
                        placeholder="Startup Innovations"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Amount (INR ₹):</label>
                        <input
                          type="number"
                          value={upiAmount}
                          onChange={(e) => setUpiAmount(e.target.value)}
                          placeholder="499"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Transaction Note:</label>
                        <input
                          type="text"
                          value={upiNote}
                          onChange={(e) => setUpiNote(e.target.value)}
                          placeholder="Early Access Plan"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR / Intent Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-inner flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        upiIntentString
                      )}`}
                      alt="UPI QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400">Scan to Pay ₹{upiAmount}</span>
                    <p className="text-[10px] text-slate-400">Works with Google Pay, PhonePe, Paytm, CRED & BHIM</p>
                  </div>
                  <button
                    onClick={() => handleCopy(upiIntentString, "upi_link")}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedSnippet === "upi_link" ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === "upi_link" ? "Copied UPI Intent URL" : "Copy UPI Intent Deep-Link"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MASTER .ENV BOILERPLATE */}
          {activeTab === "env" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Production-Ready ₹0 .env Template</h4>
                  <p className="text-[11px] text-slate-400">
                    Paste this into your startup project's root <code className="text-slate-300">.env</code> to connect all free tiers instantly.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `# ==============================================================================
# BALAGA ₹0 PRODUCTION STARTUP STACK CONFIGURATION
# All services below have verified generous free tiers (Free-For-Dev Standard)
# ==============================================================================

# 1. DATABASE & AUTH (Supabase - 500MB DB + 50k MAUs Free)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgres://postgres:yourpassword@db.your-project-id.supabase.co:5432/postgres

# 2. ULTRA-FAST AI INFERENCE (Groq Cloud - Free LPU Speed)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# 3. TRANSACTIONAL EMAIL (Resend - 3,000 emails/month free)
RESEND_API_KEY=re_123456789_abcdef
EMAIL_FROM=founder@yourstartup.balaga.online

# 4. STORAGE & CDN (Cloudflare R2 - 10GB Zero-Egress Free)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your-startup-assets

# 5. ZERO-FEE UPI PAYMENTS (India Zero-MDR)
UPI_VPA=yourvpa@okhdfcbank
UPI_PAYEE_NAME=YourStartupInnovations

# 6. APPLICATION CONFIG
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourstartup.balaga.online
`,
                      "master_env"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  {copiedSnippet === "master_env" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === "master_env" ? "Copied Master .env!" : "Copy Full .env File"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto">
{`# 1. DATABASE & AUTH (Supabase - 500MB DB + 50k MAUs Free)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgres://postgres:yourpassword@db.your-project-id.supabase.co:5432/postgres

# 2. ULTRA-FAST AI INFERENCE (Groq Cloud - Free LPU Speed)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# 3. TRANSACTIONAL EMAIL (Resend - 3,000 emails/month free)
RESEND_API_KEY=re_123456789_abcdef
EMAIL_FROM=founder@yourstartup.balaga.online

# 4. STORAGE & CDN (Cloudflare R2 - 10GB Zero-Egress Free)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your-startup-assets

# 5. ZERO-FEE UPI PAYMENTS (India Zero-MDR)
UPI_VPA=yourvpa@okhdfcbank
UPI_PAYEE_NAME=YourStartupInnovations

# 6. APPLICATION CONFIG
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourstartup.balaga.online`}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
