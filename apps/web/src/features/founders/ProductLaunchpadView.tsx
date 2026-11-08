import React, { useState, useEffect } from "react";
import {
  Rocket,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  Clock,
  Plus,
  ArrowUpRight,
  Send,
  Building2,
  Tag,
  Globe,
  Code,
  Heart,
  FileText,
  X,
  RefreshCw,
  FolderPlus,
  Share2,
  Copy,
  Check,
  Link2,
} from "lucide-react";
import { Product, ProductCategory, ProductComment, ProductReview, ProductUpdate } from "@platform/shared-types";

interface ProductLaunchpadViewProps {
  onNavigateTab?: (tab: string) => void;
}

const CATEGORIES: Array<{ id: ProductCategory; label: string; icon: string }> = [
  { id: "ai_ml", label: "AI & ML", icon: "🧠" },
  { id: "developer_tools", label: "Developer Tools", icon: "⚡" },
  { id: "saas", label: "SaaS & Cloud", icon: "☁️" },
  { id: "productivity", label: "Productivity", icon: "⏱️" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "finance", label: "FinTech & Banking", icon: "💳" },
  { id: "marketing", label: "Marketing & Growth", icon: "📈" },
  { id: "design", label: "Design & Creative", icon: "🎨" },
  { id: "business", label: "Business Operations", icon: "💼" },
  { id: "social", label: "Social & Community", icon: "🌐" },
  { id: "ecommerce", label: "E-Commerce", icon: "🛍️" },
  { id: "healthcare", label: "Health & BioTech", icon: "🩺" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "other", label: "Other Innovations", icon: "💡" },
];

export const ProductLaunchpadView: React.FC<ProductLaunchpadViewProps> = ({ onNavigateTab: _onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<string>("today");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPricing, setSelectedPricing] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("upvotes");

  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProduct, setTrendingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productComments, setProductComments] = useState<ProductComment[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [modalTab, setModalTab] = useState<"about" | "discussion" | "reviews" | "updates">("about");
  const [showLaunchModal, setShowLaunchModal] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState<boolean>(false);
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);

  // Discussion & Review Forms
  const [newComment, setNewComment] = useState<string>("");
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewTitle, setNewReviewTitle] = useState<string>("");
  const [newReviewContent, setNewReviewContent] = useState<string>("");
  const [appealReason, setAppealReason] = useState<string>("");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [isCopiedDub, setIsCopiedDub] = useState<boolean>(false);

  // Launch Wizard Form
  const [formName, setFormName] = useState<string>("");
  const [formTagline, setFormTagline] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formProblem, setFormProblem] = useState<string>("");
  const [formSolution, setFormSolution] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("developer_tools");
  const [formPricing, setFormPricing] = useState<string>("freemium");
  const [formWebsite, setFormWebsite] = useState<string>("");
  const [formDemo, setFormDemo] = useState<string>("");
  const [formLogo, setFormLogo] = useState<string>("🚀");
  const [formCover, setFormCover] = useState<string>("");
  const [formTech, setFormTech] = useState<string>("");
  const [formFeatures, setFormFeatures] = useState<string>("");
  const [formStartupId, setFormStartupId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Collections state
  const [collections, setCollections] = useState<any[]>([]);
  const [newCollectionName, setNewCollectionName] = useState<string>("");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all") params.append("tab", activeTab);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedPricing !== "all") params.append("pricing", selectedPricing);
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`/api/founders/products?${params.toString()}`, {
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.trendingProduct) {
          setTrendingProduct(data.trendingProduct);
        }
      }
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, selectedCategory, selectedPricing, sortBy]);

  const handleUpvote = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/founders/products/${productId}/upvote`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted }
              : p
          )
        );
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) =>
            prev ? { ...prev, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted } : null
          );
        }
        showToast(data.message);
      }
    } catch (e) {
      console.error("Failed to upvote:", e);
    }
  };

  const handleSave = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/founders/products/${productId}/save`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, hasSaved: data.hasSaved, savesCount: data.savesCount } : p
          )
        );
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) =>
            prev ? { ...prev, hasSaved: data.hasSaved, savesCount: data.savesCount } : null
          );
        }
        showToast(data.message);
      }
    } catch (e) {
      console.error("Failed to save product:", e);
    }
  };

  const handleFollow = async (productId: string) => {
    try {
      const res = await fetch(`/api/founders/products/${productId}/follow`, {
        method: "POST",
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedProduct) {
          setSelectedProduct((prev) =>
            prev ? { ...prev, hasFollowed: data.hasFollowed, followersCount: data.followersCount } : null
          );
        }
        showToast(data.message);
      }
    } catch (e) {
      console.error("Failed to follow product:", e);
    }
  };

  const openProductDetail = async (prod: Product) => {
    setSelectedProduct(prod);
    setModalTab("about");
    try {
      // Track view & fetch full detail
      const res = await fetch(`/api/founders/products/${prod.slug || prod.id}`, {
        headers: {
          "x-platform-world": "founders",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProduct(data.product);
        setProductComments(data.comments || []);
        setProductReviews(data.reviews || []);
        setProductUpdates(data.updates || []);
      }
    } catch (e) {
      console.error("Failed to load product detail:", e);
    }
  };

  const handleTrackClick = async (productId: string, url: string) => {
    try {
      await fetch(`/api/founders/products/${productId}/click`, {
        method: "POST",
        headers: { "x-platform-world": "founders" },
      });
    } catch {
      // non-blocking
    }
    window.open(url, "_blank");
  };

  const handleAddComment = async () => {
    if (!selectedProduct || !newComment.trim()) return;
    try {
      const res = await fetch(`/api/founders/products/${selectedProduct.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          isQuestion,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProductComments((prev) => [...prev, data.comment]);
        setNewComment("");
        setIsQuestion(false);
        showToast(data.message);
      }
    } catch (e) {
      console.error("Failed to post comment:", e);
    }
  };

  const handleAddReview = async () => {
    if (!selectedProduct || !newReviewContent.trim()) return;
    try {
      const res = await fetch(`/api/founders/products/${selectedProduct.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({
          rating: newReviewRating,
          title: newReviewTitle.trim() || undefined,
          content: newReviewContent.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProductReviews((prev) => [data.review, ...prev]);
        setSelectedProduct((prev) =>
          prev
            ? { ...prev, averageRating: data.averageRating, reviewsCount: data.reviewsCount }
            : null
        );
        setNewReviewTitle("");
        setNewReviewContent("");
        showToast("Verified review posted!");
      } else {
        const err = await res.json();
        showToast(err.error || "Review submission failed");
      }
    } catch (e) {
      console.error("Failed to post review:", e);
    }
  };

  const handleLaunchProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTagline.trim() || !formDescription.trim() || !formWebsite.trim()) {
      showToast("Please fill in required fields: Name, Tagline, Description, Website.");
      return;
    }

    setSubmitting(true);
    try {
      const featuresArray = formFeatures
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
      const techArray = formTech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        problem: formProblem.trim() || undefined,
        solution: formSolution.trim() || undefined,
        features: featuresArray,
        category: formCategory,
        pricingModel: formPricing,
        websiteUrl: formWebsite.trim(),
        demoUrl: formDemo.trim() || undefined,
        logoUrl: formLogo.trim() || "🚀",
        coverUrl: formCover.trim() || undefined,
        technologies: techArray,
        startupId: formStartupId || null,
      };

      const res = await fetch("/api/founders/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setShowLaunchModal(false);
        fetchProducts();
        showToast(data.message);
      } else {
        showToast(data.error || "Product submission failed.");
      }
    } catch (e) {
      console.error("Failed to launch product:", e);
      showToast("Error launching product. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAnalytics = async (product: Product) => {
    try {
      const res = await fetch(`/api/founders/products/${product.id}/analytics`, {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data.analytics);
        setShowAnalyticsModal(true);
      } else {
        showToast("Analytics only accessible to authorized product makers.");
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    }
  };

  const handleSendAppeal = async () => {
    if (!selectedProduct || !appealReason.trim()) return;
    try {
      const res = await fetch(`/api/founders/products/${selectedProduct.id}/appeal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ appealReason: appealReason.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowAppealModal(false);
        setAppealReason("");
        showToast(data.message);
      } else {
        const err = await res.json();
        showToast(err.error || "Appeal submission failed");
      }
    } catch (e) {
      console.error("Failed to submit appeal:", e);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/founders/products/collections", {
        headers: { "x-platform-world": "founders" },
      });
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (e) {
      console.error("Failed to fetch collections:", e);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch("/api/founders/products/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform-world": "founders",
        },
        body: JSON.stringify({ name: newCollectionName.trim(), isPublic: true }),
      });
      if (res.ok) {
        setNewCollectionName("");
        fetchCollections();
        showToast("Collection created!");
      }
    } catch (e) {
      console.error("Failed to create collection:", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/90 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 border border-emerald-400">
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Spotlight Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <Rocket className="w-3.5 h-3.5" />
              <span>Feature 7: Product Launchpad • Option A Confirmed</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              India&apos;s Startup Launchpad & Product Showcase
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Discover, vote on, and critique new developer tools, AI innovations, and SaaS products built by Indian founders. Instant publishing with automated abuse & moderation protection.
            </p>

            {/* Quick Metrics Ticker */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">140+</span> Products Launched
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">1 Vote / Member</span> Abuse-Resistant
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">Instant</span> Option A Publishing
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 min-w-[200px]">
            <button
              onClick={() => setShowLaunchModal(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Product</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchCollections();
                  setShowCollectionsModal(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>Collections</span>
              </button>
              <button
                onClick={() => setActiveTab("my_products")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: "today", label: "Today's Launches", icon: Sparkles },
            { id: "trending", label: "Trending", icon: TrendingUp },
            { id: "upcoming", label: "Upcoming & Beta", icon: Clock },
            { id: "recent", label: "Recently Launched", icon: Calendar },
            { id: "popular_week", label: "Popular This Week", icon: Star },
            { id: "all", label: "Explore All", icon: Layers },
            { id: "my_products", label: "My Products", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchProducts}
          title="Refresh products list"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/70">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, keywords, tech..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="all">All 14 Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Pricing Model Filter */}
        <div className="relative">
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="all">All Pricing Models</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="subscription">Subscription</option>
            <option value="open_source">Open Source</option>
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="upvotes">Most Upvoted</option>
            <option value="recent">Newest Launches</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Viewed</option>
          </select>
          <TrendingUp className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Trending Spotlight Card (if present) */}
      {trendingProduct && activeTab === "today" && (
        <div className="relative p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {trendingProduct.logoUrl}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  #1 SPOTLIGHT
                </span>
                <span className="text-xs text-slate-400 capitalize">{trendingProduct.category.replace("_", " ")}</span>
              </div>
              <h3 className="text-lg font-bold text-white hover:text-emerald-400 transition cursor-pointer" onClick={() => openProductDetail(trendingProduct)}>
                {trendingProduct.name}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1">{trendingProduct.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => openProductDetail(trendingProduct)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              View Launch & Demo
            </button>
            <button
              onClick={(e) => handleUpvote(trendingProduct.id, e)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                trendingProduct.hasUpvoted
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{trendingProduct.upvotesCount}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-sm">Fetching verified launches...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <Rocket className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category filter, pricing, or search keyword. Or be the first to launch in this category!
          </p>
          <button
            onClick={() => setShowLaunchModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Launch Product Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => {
            const isRestricted = prod.moderationStatus === "restricted";
            const isMonitoring = prod.moderationStatus === "monitoring";

            return (
              <div
                key={prod.id}
                onClick={() => openProductDetail(prod)}
                className={`group relative rounded-2xl bg-slate-900/80 border p-5 transition flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl cursor-pointer ${
                  isRestricted
                    ? "border-red-500/40 bg-red-950/10"
                    : isMonitoring
                    ? "border-amber-500/40 bg-amber-950/10"
                    : "border-slate-800/90 hover:border-emerald-500/50"
                }`}
              >
                {/* Moderation Status Banner (if flagged/restricted) */}
                {isRestricted && (
                  <div className="mb-3 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Restricted by Automated Moderation
                    </span>
                    <span className="underline">Appeal</span>
                  </div>
                )}
                {isMonitoring && (
                  <div className="mb-3 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Community Monitoring Active
                  </div>
                )}

                <div className="space-y-3">
                  {/* Top Bar: Logo, Name, Category & Pricing Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0 group-hover:border-emerald-500/50 transition">
                        {prod.logoUrl || "🚀"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition">
                            {prod.name}
                          </h4>
                          {prod.status === "beta" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                              BETA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="capitalize">{typeof prod.category === "string" ? prod.category.replace("_", " ") : "Tech"}</span>
                          <span>•</span>
                          <span className="capitalize text-emerald-400">{prod.pricingModel}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSave(prod.id, e)}
                      title={prod.hasSaved ? "Saved" : "Save Product"}
                      className={`p-2 rounded-lg transition ${
                        prod.hasSaved
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tagline & Pitch Preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {prod.tagline}
                  </p>

                  {/* Problem & Solution Snippet */}
                  {prod.problem && (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 text-[11px] space-y-1">
                      <div className="text-slate-400 line-clamp-1">
                        <strong className="text-slate-200">Problem:</strong> {prod.problem}
                      </div>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  {prod.technologies && prod.technologies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {prod.technologies.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[10px] font-mono border border-slate-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {prod.technologies.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{prod.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Maker info + Upvote Button */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {prod.maker?.avatarUrl ? (
                      <img
                        src={prod.maker.avatarUrl}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-300">
                        {prod.maker?.displayName ? prod.maker.displayName[0] : "M"}
                      </div>
                    )}
                    <span className="line-clamp-1 max-w-[110px]">
                      {prod.maker?.displayName || "Independent Maker"}
                    </span>
                    {prod.startup && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {prod.startup.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pr-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{prod.commentsCount || 0}</span>
                    </div>

                    <button
                      onClick={(e) => handleUpvote(prod.id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        prod.hasUpvoted
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{prod.upvotesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl shadow-inner shrink-0">
                  {selectedProduct.logoUrl || "🚀"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">{selectedProduct.name}</h2>
                    {selectedProduct.status === "beta" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                        BETA
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {typeof selectedProduct.category === "string" ? selectedProduct.category.replace("_", " ") : "Tech"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">{selectedProduct.tagline}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>Launched {selectedProduct.launchDate}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold capitalize">{selectedProduct.pricingModel}</span>
                    {selectedProduct.averageRating ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {selectedProduct.averageRating} ({selectedProduct.reviewsCount || 0} reviews)
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpvote(selectedProduct.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedProduct.hasUpvoted
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedProduct.upvotesCount}</span>
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Moderation Alert Banner (if applicable) */}
            {selectedProduct.moderationStatus === "restricted" && (
              <div className="px-6 py-3 bg-red-950/40 border-b border-red-500/40 flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>Moderation Restriction:</strong> {selectedProduct.moderationReason || "Suspicious content flagged."}
                  </span>
                </div>
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="px-3 py-1 rounded-lg bg-red-500 text-slate-950 font-bold text-xs hover:bg-red-400 transition"
                >
                  Submit Appeal
                </button>
              </div>
            )}

            {/* Modal Internal Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/40 text-xs">
              {[
                { id: "about", label: "Product & Demo", icon: FileText },
                { id: "discussion", label: `Discussions & Q&A (${productComments.length})`, icon: MessageSquare },
                { id: "reviews", label: `Verified Reviews (${productReviews.length})`, icon: Star },
                { id: "updates", label: `Updates (${productUpdates.length})`, icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 border-b-2 font-medium transition ${
                      active
                        ? "border-emerald-500 text-emerald-400 font-bold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {modalTab === "about" && (
                <div className="space-y-6">
                  {/* Action Bar: Website & Demo Links */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      {selectedProduct.websiteUrl && (
                        <button
                          onClick={() => handleTrackClick(selectedProduct.id, selectedProduct.websiteUrl)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {selectedProduct.demoUrl && (
                        <button
                          onClick={() => handleTrackClick(selectedProduct.id, selectedProduct.demoUrl!)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                        >
                          <Code className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Try Live Demo</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const slug = selectedProduct.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                          const dubLink = `https://balaga.link/p/${slug}?ref=launchpad`;
                          navigator.clipboard.writeText(dubLink);
                          showToast(`Dub.co tracking short-link copied: ${dubLink}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/20 transition"
                        title="Copy Dub.co Attribution Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share (balaga.link)</span>
                      </button>

                      <button
                        onClick={() => handleFollow(selectedProduct.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          selectedProduct.hasFollowed
                            ? "bg-slate-800 border-emerald-500/50 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{selectedProduct.hasFollowed ? "Following" : "Follow Updates"}</span>
                      </button>

                      {selectedProduct.canManage && (
                        <button
                          onClick={() => handleOpenAnalytics(selectedProduct)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Maker Dashboard</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Problem & Solution Architecture */}
                  {(selectedProduct.problem || selectedProduct.solution) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProduct.problem && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">The Problem</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.problem}</p>
                        </div>
                      )}
                      {selectedProduct.solution && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Our Solution</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.solution}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Overview</h4>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Features List */}
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Capabilities</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedProduct.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maker & Startup Info Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                        {selectedProduct.maker?.displayName ? selectedProduct.maker.displayName[0] : "M"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{selectedProduct.maker?.displayName || "Independent Maker"}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                            Maker
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{selectedProduct.maker?.headline || "Product Creator on Balaga"}</p>
                      </div>
                    </div>

                    {selectedProduct.startup && (
                      <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-300">{selectedProduct.startup.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DISCUSSION & Q&A TAB */}
              {modalTab === "discussion" && (
                <div className="space-y-6">
                  {/* New Comment / Question Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">Ask a Question or Leave Feedback</span>
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isQuestion}
                          onChange={(e) => setIsQuestion(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Mark as Technical Question</span>
                      </label>
                    </div>

                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask the maker about tech stack, pricing, roadmap or give feedback..."
                      rows={3}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </div>

                  {/* Threaded Comments List */}
                  <div className="space-y-3">
                    {productComments.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-8">
                        No questions or comments yet. Be the first to start the discussion!
                      </p>
                    ) : (
                      productComments.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{c.author?.displayName || "Community Member"}</span>
                              {c.isMakerReply && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-[10px]">
                                  MAKER
                                </span>
                              )}
                              {c.isQuestion && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40 text-[10px]">
                                  QUESTION
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>

                          {/* Nested Replies */}
                          {c.replies && c.replies.length > 0 && (
                            <div className="pl-4 mt-3 border-l-2 border-emerald-500/40 space-y-2">
                              {c.replies.map((reply) => (
                                <div key={reply.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-200">{reply.author?.displayName || "Maker"}</span>
                                    {reply.isMakerReply && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-[10px]">
                                        MAKER
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-300">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {modalTab === "reviews" && (
                <div className="space-y-6">
                  {/* Verified Review Submission Form */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200">Submit a Verified User Review</h4>
                    <p className="text-[11px] text-slate-400">Share your hands-on feedback after testing this product.</p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 hover:scale-110 transition"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="Review summary headline (e.g. Great developer experience, low latency)"
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />

                    <textarea
                      value={newReviewContent}
                      onChange={(e) => setNewReviewContent(e.target.value)}
                      placeholder="Detailed feedback: what worked well, what needs improvement..."
                      rows={3}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleAddReview}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Submit Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {productReviews.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-8">
                        No reviews yet. Be the first verified user to review this product!
                      </p>
                    ) : (
                      productReviews.map((r) => (
                        <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{r.reviewer?.displayName || "Verified Founder"}</span>
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Verified User
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-400">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>

                          {r.title && <h5 className="text-xs font-bold text-white">{r.title}</h5>}
                          <p className="text-xs text-slate-300 leading-relaxed">{r.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* UPDATES TAB */}
              {modalTab === "updates" && (
                <div className="space-y-4">
                  {productUpdates.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-8">
                      No official product updates published yet.
                    </p>
                  ) : (
                    productUpdates.map((u) => (
                      <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{u.title}</span>
                            {u.version && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                                v{u.version}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{u.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LAUNCH PRODUCT WIZARD MODAL */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Launch Product on Balaga</h3>
              </div>
              <button
                onClick={() => setShowLaunchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Option A: Instant publishing with automated security & spam moderation scanning.</span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. DocuLens AI"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tagline (Max 140 chars) *</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Ultra-low latency distributed tracing for Go & Node services"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pricing Model *</label>
                  <select
                    value={formPricing}
                    onChange={(e) => setFormPricing(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="freemium">Freemium</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                    <option value="open_source">Open Source</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed breakdown of your architecture, user benefits and launch context..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Problem It Solves</label>
                  <input
                    type="text"
                    value={formProblem}
                    onChange={(e) => setFormProblem(e.target.value)}
                    placeholder="e.g. APM agents add 15% latency to payment switches"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Solution</label>
                  <input
                    type="text"
                    value={formSolution}
                    onChange={(e) => setFormSolution(e.target.value)}
                    placeholder="e.g. Zero-overhead eBPF probes attached in kernel"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://yourproduct.in"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={formDemo}
                    onChange={(e) => setFormDemo(e.target.value)}
                    placeholder="https://demo.yourproduct.in"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Logo (Emoji or Icon)</label>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="⚡ or 🚀"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={formTech}
                    onChange={(e) => setFormTech(e.target.value)}
                    placeholder="Go, eBPF, React, PostgreSQL"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formCover}
                    onChange={(e) => setFormCover(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Associated Startup ID (Optional)</label>
                  <input
                    type="text"
                    value={formStartupId}
                    onChange={(e) => setFormStartupId(e.target.value)}
                    placeholder="e.g. st-dev (or leave blank for independent maker)"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>


              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Features (one per line)</label>
                <textarea
                  rows={2}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="Multi-tenant ledger partition&#10;Sub-microsecond latency probe&#10;One-click Grafana export"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running Security Moderation...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>Publish Instantly</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAKER ANALYTICS MODAL */}
      {showAnalyticsModal && analyticsData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Maker Performance Analytics</h3>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Launchpad Rank</div>
                <div className="text-xl font-extrabold text-emerald-400">#{analyticsData.rankToday || 1}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Views</div>
                <div className="text-xl font-extrabold text-slate-100">{analyticsData.viewsCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Upvotes</div>
                <div className="text-xl font-extrabold text-emerald-400">{analyticsData.upvotesCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Website Clicks</div>
                <div className="text-xl font-extrabold text-slate-100">{analyticsData.websiteClicks}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Followers</div>
                <div className="text-xl font-extrabold text-slate-100">{analyticsData.followersCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Saved Bookmarks</div>
                <div className="text-xl font-extrabold text-slate-100">{analyticsData.savesCount}</div>
              </div>
            </div>

            {/* DUB.CO LINK MANAGEMENT & ATTRIBUTION ENGINE */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Dub.co Branded Short Link & Attribution</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                  dub.co engine
                </span>
              </div>

              {/* Short Link Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono">
                  <span className="text-indigo-400 font-bold">balaga.link/p/</span>
                  <input
                    type="text"
                    value={customSlug || (selectedProduct?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "launch")}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none flex-1 font-semibold"
                    placeholder="custom-slug"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const slug = customSlug || (selectedProduct?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "launch");
                    const fullLink = `https://balaga.link/p/${slug}?utm_source=balaga&utm_medium=launchpad`;
                    navigator.clipboard.writeText(fullLink);
                    setIsCopiedDub(true);
                    showToast(`Dub.co link copied: ${fullLink}`);
                    setTimeout(() => setIsCopiedDub(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  {isCopiedDub ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedDub ? "Copied Link!" : "Copy Short Link"}</span>
                </button>
              </div>

              {/* Deep Attribution Channels (Dub.co Spec) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Referrers */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300">Top Referrer Channels</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Balaga Founder Circles</span>
                      <strong className="text-indigo-300">45% (528 clicks)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>X / Twitter</span>
                      <strong className="text-slate-300">28% (328 clicks)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>LinkedIn</span>
                      <strong className="text-slate-300">17% (199 clicks)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Direct & QR Code</span>
                      <strong className="text-slate-300">10% (117 clicks)</strong>
                    </div>
                  </div>
                </div>

                {/* Geographies */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300">Geographic Attribution</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>🇮🇳 Bengaluru, KA</span>
                      <strong className="text-emerald-400">54%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>🇮🇳 Hyderabad, TG</span>
                      <strong className="text-slate-300">18%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>🇮🇳 Mumbai, MH</span>
                      <strong className="text-slate-300">15%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>🌍 US & Global</span>
                      <strong className="text-slate-300">13%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Trend History */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300">7-Day Engagement Trend</h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                {analyticsData.trendHistory.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{item.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-300">{item.views} views</span>
                      <span className="text-emerald-400 font-bold">{item.upvotes} votes</span>
                      <span className="text-slate-400">{item.clicks} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>          </div>
        </div>
      )}

      {/* COLLECTIONS & SAVED MODAL */}
      {showCollectionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Product Collections</h3>
              </div>
              <button
                onClick={() => setShowCollectionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection name (e.g. My FinTech Stack)..."
                className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {collections.map((col) => (
                <div key={col.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{col.name}</h5>
                    <p className="text-[11px] text-slate-400">{col.itemCount || 0} items • {col.isPublic ? "Public" : "Private"}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">View</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APPEAL MODAL */}
      {showAppealModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">Appeal Moderation Decision</h3>
              </div>
              <button
                onClick={() => setShowAppealModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide context regarding why your product was flagged. Legitimate products are restored with audit trail without arbitrary suppression.
            </p>

            <textarea
              rows={4}
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Explain why your links/content are safe and not malicious or spam..."
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAppealModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAppeal}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
