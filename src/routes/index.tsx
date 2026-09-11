import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, ImagePlus, QrCode, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAPACITY,
  dataUrlToBlob,
  renderPngDataUrl,
  renderSvg,
  type ErrorLevel,
} from "@/lib/qr";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QR Studio — Free Custom QR Code Generator" },
      {
        name: "description",
        content:
          "Create QR codes instantly from any link, text, email or WiFi details. Pick colors, size, error correction and add a center logo, then download PNG or SVG.",
      },
      { property: "og:title", content: "QR Studio — Free Custom QR Code Generator" },
      {
        property: "og:description",
        content:
          "Real-time QR code generation with custom colors, logo embedding and PNG or SVG download. Runs entirely in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LEVELS: { value: ErrorLevel; label: string }[] = [
  { value: "L", label: "L — Low (7% recovery)" },
  { value: "M", label: "M — Medium (15% recovery)" },
  { value: "Q", label: "Q — Quartile (25% recovery)" },
  { value: "H", label: "H — High (30% recovery)" },
];

const SIZE_PRESETS = [
  { label: "Small", value: 256 },
  { label: "Medium", value: 512 },
  { label: "Large", value: 1024 },
];

function Index() {
  const [text, setText] = useState("https://lovable.dev");
  const [debounced, setDebounced] = useState(text);
  const [size, setSize] = useState(512);
  const [fg, setFg] = useState("#12312e");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState<ErrorLevel>("M");
  const [logo, setLogo] = useState<string | null>(null);
  const [png, setPng] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  const capacity = CAPACITY[level];
  const tooLong = text.length > capacity;
  const dense = !tooLong && text.length > capacity * 0.5;

  useEffect(() => {
    let cancelled = false;
    const value = debounced.trim();
    if (!value) {
      setPng(null);
      setSvg(null);
      setError(null);
      return;
    }
    const opts = { text: value, size, fg, bg, level, logo };
    (async () => {
      try {
        const [p, s] = await Promise.all([renderPngDataUrl(opts), renderSvg(opts)]);
        if (cancelled) return;
        setPng(p);
        setSvg(s);
        setError(null);
      } catch {
        if (cancelled) return;
        setPng(null);
        setSvg(null);
        setError("This content is too long to encode. Try shortening it.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, size, fg, bg, level, logo]);

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
      a.download = `qr-code.${kind}`;
      a.click();
      if (kind === "svg") setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Downloaded ${kind.toUpperCase()}`);
    },
    [png, svg],
  );

  const copyImage = useCallback(async () => {
    if (!png) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": dataUrlToBlob(png) }),
      ]);
      toast.success("QR code copied to clipboard");
    } catch {
      toast.error("Your browser blocked copying images. Use Download instead.");
    }
  }, [png]);

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      if (level !== "H") setLevel("H");
    };
    reader.readAsDataURL(file);
  };

  const warning = useMemo(() => {
    if (tooLong) return `Too long: ${text.length} of ${capacity} characters allowed at level ${level}.`;
    if (dense)
      return "Long content makes a dense code that is harder to scan. Shorten it or print it larger.";
    if (logo && level !== "H")
      return "With a center logo, error correction H scans most reliably.";
    return null;
  }, [tooLong, dense, text.length, capacity, level, logo]);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-16">
      <Toaster />
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <QrCode className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">QR Studio</h1>
            <p className="text-sm text-muted-foreground">
              Instant, customizable QR codes — generated entirely in your browser.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="surface-panel space-y-7 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="https://example.com, plain text, mailto:you@mail.com, tel:+1234567890, WIFI:S:MyNet;T:WPA;P:pass;;"
                className="resize-y"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>URL, text, email, phone or WiFi credentials</span>
                <span className={tooLong ? "text-destructive" : ""}>
                  {text.length} / {capacity}
                </span>
              </div>
            </div>

            {(warning || error) && (
              <div className="flex items-start gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm text-accent-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{error ?? warning}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Size</Label>
                <span className="text-sm text-muted-foreground">{size} px</span>
              </div>
              <Slider
                value={[size]}
                min={128}
                max={1024}
                step={32}
                onValueChange={([v]) => setSize(v ?? 512)}
              />
              <div className="flex gap-2">
                {SIZE_PRESETS.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={size === p.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSize(p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Foreground" value={fg} onChange={setFg} />
              <ColorField label="Background" value={bg} onChange={setBg} />
            </div>

            <div className="space-y-2">
              <Label>Error correction</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as ErrorLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Center logo (optional)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogo(e.target.files?.[0])}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  <ImagePlus /> Upload image
                </Button>
                {logo && (
                  <>
                    <img
                      src={logo}
                      alt="Selected logo preview"
                      className="size-10 rounded-lg border border-border object-contain"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setLogo(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <Trash2 /> Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="surface-panel flex flex-col items-center gap-6 p-6 sm:p-8 lg:sticky lg:top-8 lg:self-start">
            <h2 className="self-start text-lg font-semibold">Live preview</h2>
            <div
              className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl border border-border p-4"
              style={{ backgroundColor: bg }}
            >
              {png ? (
                <img
                  src={png}
                  alt={`QR code for ${debounced.slice(0, 60)}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="px-6 text-center text-sm text-muted-foreground">
                  {error ?? "Type something to see your QR code appear here."}
                </p>
              )}
            </div>
            <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-3">
              <Button onClick={() => download("png")} disabled={!png}>
                <Download /> PNG
              </Button>
              <Button variant="outline" onClick={() => download("svg")} disabled={!svg}>
                <Download /> SVG
              </Button>
              <Button variant="secondary" onClick={copyImage} disabled={!png}>
                <Copy /> Copy
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={label}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-card p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}
