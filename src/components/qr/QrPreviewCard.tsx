import { useState, useCallback } from "react";
import {
  Download,
  Copy,
  Smartphone,
  Maximize2,
  Printer,
  BookmarkPlus,
  Check,
  ShieldCheck,
  AlertTriangle,
  Code,
  Scan,
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  Eye,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  dataUrlToBlob,
  evaluateScannability,
  detectContentType,
  downloadTextFile,
  ErrorLevel,
} from "@/lib/qr";

interface QrPreviewCardProps {
  png: string | null;
  svg: string | null;
  text: string;
  fg: string;
  bg: string;
  level: ErrorLevel;
  hasLogo: boolean;
  onSaveHistory?: () => void;
}

export function QrPreviewCard({
  png,
  svg,
  text,
  fg,
  bg,
  level,
  hasLogo,
  onSaveHistory,
}: QrPreviewCardProps) {
  const [viewMode, setViewMode] = useState<"phone" | "clean" | "standee">("phone");
  const [copiedImg, setCopiedImg] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Scannability scoring
  const scannability = evaluateScannability(text, level, fg, bg, hasLogo);

  // Detect content format for smart action button
  const detected = detectContentType(text);

  // Smart action handler for when user taps the phone's camera detection banner
  const handleSmartAction = () => {
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 2500);

    switch (detected.type) {
      case "wifi": {
        const pass = String(detected.parsed?.["password"] ?? "");
        const ssid = String(detected.parsed?.["ssid"] ?? "WiFi");
        if (pass) {
          navigator.clipboard.writeText(pass);
          toast.success(`Copied password for "${ssid}" to clipboard! Camera prompt simulation: Connect to ${ssid}.`);
        } else {
          toast.success(`Connecting to open network "${ssid}"!`);
        }
        break;
      }
      case "vcard": {
        const name = String(detected.parsed?.["name"] ?? "Contact");
        downloadTextFile(text, `${name.replace(/\s+/g, "_") || "contact"}.vcf`, "text/vcard");
        toast.success(`Downloaded vCard file for ${name}! Ready to add to Contacts.`);
        break;
      }
      case "image": {
        const imgUrl = String(detected.parsed?.["url"] ?? text);
        window.open(imgUrl, "_blank");
        toast.success("Opening image in new tab!");
        break;
      }
      case "event": {
        const title = String(detected.parsed?.["title"] ?? "Event");
        downloadTextFile(text, `${title.replace(/\s+/g, "_") || "event"}.ics`, "text/calendar");
        toast.success(`Downloaded .ics calendar file for "${title}"! Ready to import.`);
        break;
      }
      case "email": {
        const email = String(detected.parsed?.["email"] ?? "");
        const sub = String(detected.parsed?.["subject"] ?? "");
        const body = String(detected.parsed?.["body"] ?? "");
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
        toast.success(`Opening mail client to email ${email}!`);
        break;
      }
      case "phone": {
        const phone = String(detected.parsed?.["phone"] ?? "");
        window.location.href = `tel:${phone}`;
        toast.success(`Initiating call to ${phone}!`);
        break;
      }
      case "whatsapp": {
        const phone = String(detected.parsed?.["phone"] ?? "");
        const msg = String(detected.parsed?.["message"] ?? "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
        toast.success("Opening WhatsApp chat!");
        break;
      }
      case "location": {
        window.open(text.startsWith("http") ? text : `https://maps.google.com/?q=${encodeURIComponent(text)}`, "_blank");
        toast.success("Opening location in Google Maps!");
        break;
      }
      case "url": {
        window.open(text.startsWith("http") ? text : `https://${text}`, "_blank");
        toast.success("Opening website in new tab!");
        break;
      }
      default: {
        navigator.clipboard.writeText(text);
        toast.success("Copied text payload to clipboard!");
        break;
      }
    }
  };

  // Get human-readable action label and icon
  const getSmartActionDetails = () => {
    switch (detected.type) {
      case "wifi":
        return {
          icon: "📶",
          title: `Connect to "${detected.parsed?.["ssid"] || "WiFi"}"`,
          subtitle: "Tap to copy password & simulate join",
        };
      case "vcard":
        return {
          icon: "👤",
          title: `Add ${detected.parsed?.["name"] || "Contact"} to Contacts`,
          subtitle: "Tap to download .VCF contact card",
        };
      case "image":
        return {
          icon: "🖼️",
          title: "Open & View Image",
          subtitle: "Tap to view full resolution photo",
        };
      case "event":
        return {
          icon: "📅",
          title: `Add to Calendar (${detected.parsed?.["title"] || "Event"})`,
          subtitle: "Tap to download .ICS calendar event",
        };
      case "email":
        return {
          icon: "✉️",
          title: `Send Email to ${detected.parsed?.["email"] || "recipient"}`,
          subtitle: "Tap to open default mail client",
        };
      case "phone":
        return {
          icon: "📞",
          title: `Call ${detected.parsed?.["phone"] || "number"}`,
          subtitle: "Tap to launch phone dialer",
        };
      case "whatsapp":
        return {
          icon: "💚",
          title: "Chat on WhatsApp",
          subtitle: "Tap to open direct WhatsApp conversation",
        };
      case "location":
        return {
          icon: "📍",
          title: "Open Location in Maps",
          subtitle: "Tap for turn-by-turn directions",
        };
      case "url":
        return {
          icon: "🔗",
          title: "Open Web Link",
          subtitle: "Tap to open website in new tab",
        };
      default:
        return {
          icon: "📝",
          title: "Copy Decoded Text",
          subtitle: "Tap to copy raw contents",
        };
    }
  };

  const smartAction = getSmartActionDetails();

  // Download actions
  const download = useCallback(
    (kind: "png" | "svg") => {
      const url =
        kind === "png"
          ? png
          : svg
            ? URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
            : null;
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${Date.now()}.${kind}`;
      a.click();
      if (kind === "svg") setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Downloaded ${kind.toUpperCase()} file`);
    },
    [png, svg],
  );

  // Copy PNG image to clipboard
  const copyImage = useCallback(async () => {
    if (!png) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": dataUrlToBlob(png) })]);
      setCopiedImg(true);
      setTimeout(() => setCopiedImg(false), 2000);
      toast.success("QR code image copied to clipboard!");
    } catch {
      toast.error("Browser blocked clipboard copy. Please use Download instead.");
    }
  }, [png]);

  // Copy SVG markup
  const copySvgMarkup = useCallback(async () => {
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
      toast.success("SVG vector code copied to clipboard!");
    } catch {
      toast.error("Unable to copy SVG text");
    }
  }, [svg]);

  // Print layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* View mode toggle & scannability badge */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-muted/70 p-1 border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("phone")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === "phone"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="size-3.5" />
            <span>Phone View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("clean")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === "clean"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Maximize2 className="size-3.5" />
            <span>Studio View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("standee")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === "standee"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Table Standee</span>
          </button>
        </div>

        {/* Scannability Rating Pill */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            scannability.rating === "Excellent"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : scannability.rating === "Good"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          }`}
          title={scannability.message}
        >
          {scannability.rating === "Excellent" ? (
            <ShieldCheck className="size-3.5" />
          ) : (
            <AlertTriangle className="size-3.5" />
          )}
          <span>{scannability.score}% Scan Score</span>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="relative flex w-full justify-center">
        {viewMode === "phone" && (
          /* REALISTIC SMARTPHONE MOCKUP */
          <div className="relative w-full max-w-[325px] rounded-[44px] border-[8px] border-neutral-900 bg-neutral-950 p-3 shadow-2xl ring-1 ring-neutral-800">
            {/* Dynamic island / camera notch */}
            <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-neutral-900 flex items-center justify-center gap-2">
              <div className="size-2 rounded-full bg-neutral-800" />
              <div className="size-2 rounded-full bg-neutral-800/60" />
            </div>

            {/* Camera Viewport Simulation */}
            <div className="relative flex flex-col items-center justify-between rounded-[32px] bg-neutral-900/95 p-3.5 min-h-[440px] overflow-hidden text-neutral-200">
              {/* Camera Header HUD */}
              <div className="flex w-full items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Scan className="size-3 text-emerald-400 animate-pulse" /> CAMERA SCANNER
                </span>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                  1x Optical
                </span>
              </div>

              {/* QR Code Target Frame with laser beam */}
              <div className="relative my-auto flex size-56 items-center justify-center">
                {/* Corner Targeting Reticle Brackets */}
                <div className="pointer-events-none absolute -left-1 -top-1 size-5 border-l-2 border-t-2 border-yellow-400" />
                <div className="pointer-events-none absolute -right-1 -top-1 size-5 border-r-2 border-t-2 border-yellow-400" />
                <div className="pointer-events-none absolute -bottom-1 -left-1 size-5 border-b-2 border-l-2 border-yellow-400" />
                <div className="pointer-events-none absolute -bottom-1 -right-1 size-5 border-b-2 border-r-2 border-yellow-400" />

                {/* Animated Scanner Laser Beam */}
                <div className="pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_8px_#facc15] animate-scan-laser z-20" />

                {/* Actual QR Image Inside Phone */}
                <div
                  className="flex size-48 items-center justify-center overflow-hidden rounded-2xl p-2 shadow-lg transition-all"
                  style={{ backgroundColor: bg }}
                >
                  {png ? (
                    <img
                      src={png}
                      alt="Generated QR code"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center p-4 text-center text-xs text-neutral-500">
                      Enter content to preview
                    </div>
                  )}
                </div>
              </div>

              {/* INTERACTIVE TAP-TO-ACT SMART BANNER */}
              <div className="w-full space-y-1">
                <button
                  type="button"
                  onClick={handleSmartAction}
                  className={`w-full rounded-2xl p-3 text-left transition-all flex items-center gap-2.5 shadow-lg group ${
                    actionSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-800/95 hover:bg-neutral-800 border border-neutral-700/80 text-white"
                  }`}
                  title="Click to test this action"
                >
                  <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                    {actionSuccess ? "✓" : smartAction.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold truncate leading-tight">
                      {smartAction.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 group-hover:text-yellow-300 truncate transition-colors">
                      {actionSuccess ? "Action executed successfully!" : smartAction.subtitle}
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider text-neutral-300">
                    Tap
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === "clean" && (
          /* CLEAN STUDIO SHOWCASE CARD */
          <div
            className="flex flex-col items-center justify-center aspect-square w-full max-w-[360px] rounded-3xl border border-border/80 p-8 shadow-2xl transition-all relative overflow-hidden"
            style={{ backgroundColor: bg }}
          >
            {png ? (
              <img
                src={png}
                alt="Generated QR Code"
                className="h-full w-full object-contain filter drop-shadow-md"
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Enter text or select a template to generate your QR code
              </div>
            )}
          </div>
        )}

        {viewMode === "standee" && (
          /* TABLE STANDEE / TENT CARD PREVIEW */
          <div className="relative w-full max-w-[340px] rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/90 p-6 shadow-2xl text-center space-y-4 standee-tent">
            <div className="mx-auto size-2.5 rounded-full bg-border" />

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                <Sparkles className="size-3 text-primary" />
                <span>
                  {detected.type === "wifi"
                    ? "Free High-Speed WiFi"
                    : detected.type === "vcard"
                      ? "Scan to Save Contact"
                      : detected.type === "image"
                        ? "Scan to View Menu / Image"
                        : "Scan With Phone Camera"}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground font-display">
                {detected.type === "wifi"
                  ? String(detected.parsed?.["ssid"] || "Guest WiFi")
                  : detected.type === "vcard"
                    ? String(detected.parsed?.["name"] || "Digital Card")
                    : "Instant Access"}
              </h3>
            </div>

            {/* Standee QR frame */}
            <div
              className="mx-auto flex size-44 items-center justify-center rounded-2xl p-2 shadow-inner border border-border/60"
              style={{ backgroundColor: bg }}
            >
              {png && (
                <img
                  src={png}
                  alt="Standee QR Code"
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Point your iPhone or Android camera</p>
              <p className="text-[11px]">No extra apps required • Connect instantly</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <Printer className="size-3.5" /> Print Standee Card
            </Button>
          </div>
        )}
      </div>

      {/* Scannability Note & Contrast Information */}
      <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <strong className="text-foreground">Contrast Ratio:</strong> {scannability.contrastRatio}:1
        </span>
        <span className="truncate max-w-[200px] text-right font-medium text-foreground/80">
          {scannability.message}
        </span>
      </div>

      {/* Action Buttons Grid */}
      <div className="w-full space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={() => download("png")}
            disabled={!png}
            className="w-full font-semibold shadow-md gap-1.5"
          >
            <Download className="size-4" /> Download PNG
          </Button>
          <Button
            variant="outline"
            onClick={() => download("svg")}
            disabled={!svg}
            className="w-full font-semibold gap-1.5"
          >
            <Download className="size-4" /> Download SVG
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={copyImage}
            disabled={!png}
            className="text-xs"
          >
            {copiedImg ? (
              <Check className="mr-1 size-3 text-emerald-500" />
            ) : (
              <Copy className="mr-1 size-3" />
            )}
            Copy Image
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={copySvgMarkup}
            disabled={!svg}
            className="text-xs"
          >
            {copiedSvg ? (
              <Check className="mr-1 size-3 text-emerald-500" />
            ) : (
              <Code className="mr-1 size-3" />
            )}
            Copy SVG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            disabled={!png}
            className="text-xs"
          >
            <Printer className="mr-1 size-3" /> Print
          </Button>
        </div>

        {onSaveHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveHistory}
            disabled={!png}
            className="w-full text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            <BookmarkPlus className="mr-1.5 size-3.5 text-primary" /> Save to Recent History
          </Button>
        )}
      </div>

      {/* HIDDEN PRINT TARGET (Visible only when printing) */}
      <div id="print-target" className="hidden">
        {png && (
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto p-8 border-2 border-black rounded-3xl">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Scan With Any Camera</h1>
              <p className="text-base text-gray-700 font-medium">{smartAction.title}</p>
            </div>
            <img src={png} alt="Printable QR Code" className="w-72 h-72 object-contain" />
            <div className="text-sm font-mono text-gray-500 max-w-xs break-all">
              {text.slice(0, 100)}
            </div>
            <p className="text-xs text-gray-400">Created with QR Studio Pro</p>
          </div>
        )}
      </div>
    </div>
  );
}
