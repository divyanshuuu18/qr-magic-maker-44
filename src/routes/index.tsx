import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { QrCode, Scan, History, Moon, Sun, Sparkles, Layers, Palette } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  renderPngDataUrl,
  renderSvg,
  DotStyle,
  EyeShape,
  EyeInnerShape,
  FrameStyle,
  ErrorLevel,
} from "@/lib/qr";
import { ContentTypeTabs } from "@/components/qr/ContentTypeTabs";
import { StyleCustomizer } from "@/components/qr/StyleCustomizer";
import { QrPreviewCard } from "@/components/qr/QrPreviewCard";
import { QrScannerModal } from "@/components/qr/QrScannerModal";
import { QrHistoryDrawer } from "@/components/qr/QrHistoryDrawer";
import { ContentCategory, QrHistoryItem } from "@/components/qr/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QR Studio Pro — Advanced Custom QR Code Generator & Scanner" },
      {
        name: "description",
        content:
          "Generate bespoke, high-contrast QR codes with custom shapes, linear & radial gradients, corner eyes, center logos, and 'Scan Me' frames. Built-in WiFi, vCard, UPI & crypto templates plus instant QR decoding.",
      },
      { property: "og:title", content: "QR Studio Pro — Advanced Custom QR Code Studio" },
      {
        property: "og:description",
        content:
          "Create beautiful, brand-ready QR codes with live smartphone mockup preview, custom dot shapes, gradient fills, and built-in QR scanner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STORAGE_KEY_HISTORY = "qr_studio_history_v1";

function Index() {
  // Active category & content text
  const [category, setCategory] = useState<ContentCategory>("url");
  const [text, setText] = useState("https://lovable.dev");
  const [debounced, setDebounced] = useState(text);

  // Active tab in left sidebar: 'content' or 'style'
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

  // Style customization state
  const [size, setSize] = useState(512);
  const [fg, setFg] = useState("#06b6d4");
  const [bg, setBg] = useState("#090d16");
  const [colorMode, setColorMode] = useState<"solid" | "gradient">("gradient");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [gradientColor2, setGradientColor2] = useState("#3b82f6");
  const [gradientAngle, setGradientAngle] = useState(135);

  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [eyeShape, setEyeShape] = useState<EyeShape>("rounded");
  const [eyeInnerShape, setEyeInnerShape] = useState<EyeInnerShape>("dot");

  const [logo, setLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.22);
  const [logoBg, setLogoBg] = useState(true);

  const [frame, setFrame] = useState<FrameStyle>("none");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [frameColor, setFrameColor] = useState("#06b6d4");
  const [frameTextColor, setFrameTextColor] = useState("#ffffff");

  const [level, setLevel] = useState<ErrorLevel>("M");

  // Output states
  const [png, setPng] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<QrHistoryItem[]>([]);

  // Dark mode state
  const [isDark, setIsDark] = useState(true);

  // Initialize theme and history
  useEffect(() => {
    // Dark mode by default for vibrant visuals
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("qr_theme");
    if (storedTheme === "light") {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }

    // Load history
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("qr_theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("qr_theme", "dark");
      setIsDark(true);
    }
  };

  // Debounce text changes
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 250);
    return () => clearTimeout(t);
  }, [text]);

  // Generate QR code whenever any option changes
  useEffect(() => {
    let cancelled = false;
    const val = debounced.trim();
    if (!val) {
      setPng(null);
      setSvg(null);
      return;
    }

    setRendering(true);
    const opts = {
      text: val,
      size,
      fg,
      bg,
      level,
      dotStyle,
      eyeShape,
      eyeInnerShape,
      colorMode,
      gradientType,
      gradientColor2,
      gradientAngle,
      frame,
      frameText,
      frameColor,
      frameTextColor,
      logo,
      logoScale,
      logoBg,
    };

    (async () => {
      try {
        const [p, s] = await Promise.all([renderPngDataUrl(opts), renderSvg(opts)]);
        if (cancelled) return;
        setPng(p);
        setSvg(s);
      } catch (e) {
        if (cancelled) return;
        console.error("Rendering QR code failed:", e);
        toast.error("QR encoding error: Content may be too long for selected level.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    debounced,
    size,
    fg,
    bg,
    level,
    dotStyle,
    eyeShape,
    eyeInnerShape,
    colorMode,
    gradientType,
    gradientColor2,
    gradientAngle,
    frame,
    frameText,
    frameColor,
    frameTextColor,
    logo,
    logoScale,
    logoBg,
  ]);

  // Save current QR to history
  const handleSaveToHistory = useCallback(() => {
    if (!png) return;
    const newItem: QrHistoryItem = {
      id: String(Date.now()),
      title: debounced.slice(0, 40),
      category,
      rawText: debounced,
      pngDataUrl: png,
      createdAt: Date.now(),
      fg,
      bg,
    };
    const updated = [newItem, ...history.filter((h) => h.rawText !== debounced)].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      toast.success("Saved to Recent History!");
    } catch {
      // ignore
    }
  }, [png, debounced, category, fg, bg, history]);

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    toast.success("Removed from history");
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    toast.success("History cleared");
  };

  const handleLoadFromHistory = (item: QrHistoryItem) => {
    setText(item.rawText);
    setCategory(item.category);
    toast.success("Loaded QR code from history");
  };

  const handleImportScanned = (scannedText: string, detectedType: ContentCategory) => {
    setText(scannedText);
    setCategory(detectedType);
    toast.success(`Decoded & loaded ${detectedType.toUpperCase()} content!`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Toaster position="top-right" richColors />

      {/* MODALS */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onImport={handleImportScanned}
      />
      <QrHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onSelect={handleLoadFromHistory}
        onDelete={handleDeleteHistoryItem}
        onClear={handleClearHistory}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        {/* TOP NAVIGATION / HEADER */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 text-white shadow-xl shadow-cyan-500/20">
              <QrCode className="size-6" />
              <Sparkles className="absolute -top-1 -right-1 size-4 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-display">
                  QR Studio{" "}
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    Pro
                  </span>
                </h1>
                <span className="rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Interactive Studio
                </span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Generate, style & test bespoke QR codes for Images, Contacts, WiFi, Text, Email, and Maps with instant live phone simulator.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScannerOpen(true)}
              className="border-border/80 shadow-sm text-xs font-semibold rounded-xl"
            >
              <Scan className="mr-1.5 size-3.5 text-primary" />
              <span>Scan / Decode</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="border-border/80 shadow-sm text-xs font-semibold rounded-xl"
            >
              <History className="mr-1.5 size-3.5 text-primary" />
              <span>Saved ({history.length})</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title="Toggle theme"
              className="size-9 p-0 text-muted-foreground hover:text-foreground rounded-xl"
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        {/* QUICK CATEGORY SHORTCUT LAUNCHER */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
            <Sparkles className="size-3 text-primary" /> Quick Modes:
          </span>
          {[
            { id: "image" as ContentCategory, label: "🖼️ Image QR" },
            { id: "vcard" as ContentCategory, label: "👤 Contact Card" },
            { id: "wifi" as ContentCategory, label: "📶 WiFi Access" },
            { id: "text" as ContentCategory, label: "📝 Plain Text" },
            { id: "email" as ContentCategory, label: "✉️ Email" },
            { id: "url" as ContentCategory, label: "🔗 Website URL" },
            { id: "location" as ContentCategory, label: "📍 Map Location" },
            { id: "event" as ContentCategory, label: "📅 Calendar Event" },
            { id: "whatsapp" as ContentCategory, label: "💚 WhatsApp" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategory(item.id);
                setActiveTab("content");
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                category === item.id && activeTab === "content"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* STUDIO WORKSPACE GRID */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* LEFT COLUMN: TABS & CONTROLS */}
          <section className="glass-panel p-5 sm:p-7 space-y-6">
            {/* Top Step / Studio Switcher */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === "content"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Layers className="size-4" />
                  <span>1. Content & Type</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("style")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === "style"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Palette className="size-4" />
                  <span>2. Design & Styling</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live updates</span>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "content" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Select format template to encode data cleanly</span>
                  <span className="font-mono">{text.length} characters</span>
                </div>
                <ContentTypeTabs
                  value={text}
                  category={category}
                  onChangeCategory={setCategory}
                  onChangeText={setText}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <StyleCustomizer
                  fg={fg}
                  setFg={setFg}
                  bg={bg}
                  setBg={setBg}
                  colorMode={colorMode}
                  setColorMode={setColorMode}
                  gradientType={gradientType}
                  setGradientType={setGradientType}
                  gradientColor2={gradientColor2}
                  setGradientColor2={setGradientColor2}
                  gradientAngle={gradientAngle}
                  setGradientAngle={setGradientAngle}
                  dotStyle={dotStyle}
                  setDotStyle={setDotStyle}
                  eyeShape={eyeShape}
                  setEyeShape={setEyeShape}
                  eyeInnerShape={eyeInnerShape}
                  setEyeInnerShape={setEyeInnerShape}
                  logo={logo}
                  setLogo={setLogo}
                  logoScale={logoScale}
                  setLogoScale={setLogoScale}
                  logoBg={logoBg}
                  setLogoBg={setLogoBg}
                  frame={frame}
                  setFrame={setFrame}
                  frameText={frameText}
                  setFrameText={setFrameText}
                  frameColor={frameColor}
                  setFrameColor={setFrameColor}
                  frameTextColor={frameTextColor}
                  setFrameTextColor={setFrameTextColor}
                  size={size}
                  setSize={setSize}
                  level={level}
                  setLevel={setLevel}
                />
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: INTERACTIVE PREVIEW CARD */}
          <section className="glass-panel p-5 sm:p-7 lg:sticky lg:top-8 lg:self-start space-y-6">
            <QrPreviewCard
              png={png}
              svg={svg}
              text={debounced}
              fg={fg}
              bg={bg}
              level={level}
              hasLogo={!!logo}
              onSaveHistory={handleSaveToHistory}
            />
          </section>
        </div>

        {/* FOOTER FEATURE HIGHLIGHTS */}
        <footer className="mt-16 border-t border-border/60 pt-8 pb-12 text-center text-xs text-muted-foreground space-y-3">
          <div className="flex flex-wrap justify-center gap-6 font-medium text-foreground/80">
            <span>🔒 100% Client-Side Privacy</span>
            <span>⚡ Real-Time SVG & PNG Rendering</span>
            <span>📱 iOS & Android Camera Optimized</span>
            <span>🎨 High-DPI Vector Print Ready</span>
          </div>
          <p>
            © {new Date().getFullYear()} QR Studio Pro. Crafted with precision for high-contrast
            scannability.
          </p>
        </footer>
      </div>
    </main>
  );
}
