import { useRef } from "react";
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  LayoutTemplate,
  Trash2,
  UploadCloud,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DotStyle, EyeShape, EyeInnerShape, FrameStyle, ErrorLevel } from "@/lib/qr";
import { COLOR_PRESETS, LOGO_PRESETS, ColorPreset } from "./types";

interface StyleCustomizerProps {
  // Colors
  fg: string;
  setFg: (v: string) => void;
  bg: string;
  setBg: (v: string) => void;
  colorMode: "solid" | "gradient";
  setColorMode: (v: "solid" | "gradient") => void;
  gradientType: "linear" | "radial";
  setGradientType: (v: "linear" | "radial") => void;
  gradientColor2: string;
  setGradientColor2: (v: string) => void;
  gradientAngle: number;
  setGradientAngle: (v: number) => void;

  // Shapes
  dotStyle: DotStyle;
  setDotStyle: (v: DotStyle) => void;
  eyeShape: EyeShape;
  setEyeShape: (v: EyeShape) => void;
  eyeInnerShape: EyeInnerShape;
  setEyeInnerShape: (v: EyeInnerShape) => void;

  // Logo
  logo: string | null;
  setLogo: (v: string | null) => void;
  logoScale: number;
  setLogoScale: (v: number) => void;
  logoBg: boolean;
  setLogoBg: (v: boolean) => void;

  // Frame
  frame: FrameStyle;
  setFrame: (v: FrameStyle) => void;
  frameText: string;
  setFrameText: (v: string) => void;
  frameColor: string;
  setFrameColor: (v: string) => void;
  frameTextColor: string;
  setFrameTextColor: (v: string) => void;

  // Size & Level
  size: number;
  setSize: (v: number) => void;
  level: ErrorLevel;
  setLevel: (v: ErrorLevel) => void;
}

export function StyleCustomizer({
  fg,
  setFg,
  bg,
  setBg,
  colorMode,
  setColorMode,
  gradientType,
  setGradientType,
  gradientColor2,
  setGradientColor2,
  gradientAngle,
  setGradientAngle,
  dotStyle,
  setDotStyle,
  eyeShape,
  setEyeShape,
  eyeInnerShape,
  setEyeInnerShape,
  logo,
  setLogo,
  logoScale,
  setLogoScale,
  logoBg,
  setLogoBg,
  frame,
  setFrame,
  frameText,
  setFrameText,
  frameColor,
  setFrameColor,
  frameTextColor,
  setFrameTextColor,
  size,
  setSize,
  level,
  setLevel,
}: StyleCustomizerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const applyPreset = (preset: ColorPreset) => {
    setFg(preset.fg);
    setBg(preset.bg);
    if (preset.isGradient && preset.gradColor2) {
      setColorMode("gradient");
      setGradientType(preset.gradType ?? "linear");
      setGradientColor2(preset.gradColor2);
      if (preset.gradAngle !== undefined) setGradientAngle(preset.gradAngle);
    } else {
      setColorMode("solid");
    }
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      if (level !== "H") setLevel("H");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. COLOR & PALETTE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Palette className="size-4 text-primary" />
            <span>Color & Palette</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setColorMode("solid")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                colorMode === "solid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => setColorMode("gradient")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                colorMode === "gradient"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Gradient
            </button>
          </div>
        </div>

        {/* Quick color preset cards */}
        <div className="space-y-1.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" /> Curated Themes
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-2 text-left text-xs transition-all hover:border-primary/50 hover:bg-card"
              >
                <div
                  className="size-6 shrink-0 rounded-md border border-border/50 shadow-inner"
                  style={{
                    background:
                      p.isGradient && p.gradColor2
                        ? `linear-gradient(135deg, ${p.fg}, ${p.gradColor2})`
                        : p.fg,
                  }}
                />
                <span className="truncate font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorPickerField
            label={colorMode === "gradient" ? "Gradient Start" : "Foreground"}
            value={fg}
            onChange={setFg}
          />
          <ColorPickerField label="Background" value={bg} onChange={setBg} />
        </div>

        {colorMode === "gradient" && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorPickerField
                label="Gradient End"
                value={gradientColor2}
                onChange={setGradientColor2}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  value={gradientType}
                  onValueChange={(v: "linear" | "radial") => setGradientType(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear Gradient</SelectItem>
                    <SelectItem value="radial">Radial Glow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {gradientType === "linear" && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gradient Angle</span>
                  <span>{gradientAngle}°</span>
                </div>
                <Slider
                  value={[gradientAngle]}
                  min={0}
                  max={360}
                  step={15}
                  onValueChange={([v]) => setGradientAngle(v ?? 45)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-border/60" />

      {/* 2. SHAPES & PATTERNS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shapes className="size-4 text-primary" />
          <span>Module Shapes & Corner Eyes</span>
        </div>

        {/* Dot Style */}
        <div className="space-y-2">
          <Label className="text-xs">Data Module Pattern</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                { id: "rounded", label: "Rounded" },
                { id: "dots", label: "Smooth Dots" },
                { id: "square", label: "Classic Square" },
                { id: "classy", label: "Diamonds" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDotStyle(item.id)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  dotStyle === item.id
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                    : "border-border/60 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Eye Shape */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Corner Eye Frame</Label>
            <Select value={eyeShape} onValueChange={(v: EyeShape) => setEyeShape(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Smooth Rounded</SelectItem>
                <SelectItem value="circle">Full Circle</SelectItem>
                <SelectItem value="leaf">Modern Leaf</SelectItem>
                <SelectItem value="square">Classic Square</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Corner Eye Center</Label>
            <Select value={eyeInnerShape} onValueChange={(v: EyeInnerShape) => setEyeInnerShape(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dot">Circle Dot</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <hr className="border-border/60" />

      {/* 3. CENTER LOGO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="size-4 text-primary" />
            <span>Center Logo / Badge</span>
          </div>
          {logo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLogo(null)}
              className="h-7 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1 size-3.5" /> Remove
            </Button>
          )}
        </div>

        {/* Preset Logos */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Quick Popular Icons:</span>
          <div className="flex flex-wrap gap-2">
            {LOGO_PRESETS.map((lp) => (
              <button
                key={lp.id}
                type="button"
                onClick={() => {
                  setLogo(lp.svgDataUri);
                  if (level !== "H") setLevel("H");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1 text-xs hover:border-primary/50 hover:bg-card"
              >
                <img src={lp.svgDataUri} alt={lp.name} className="size-4 object-contain" />
                <span>{lp.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Upload */}
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="w-full border-dashed"
          >
            <UploadCloud className="mr-2 size-4" /> Upload Custom Logo (PNG, SVG, JPG)
          </Button>

          {logo && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Logo Size Scale</span>
                  <span>{Math.round(logoScale * 100)}%</span>
                </div>
                <Slider
                  value={[logoScale]}
                  min={0.14}
                  max={0.28}
                  step={0.02}
                  onValueChange={([v]) => setLogoScale(v ?? 0.22)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="logo-pad" className="cursor-pointer text-xs text-muted-foreground">
                  White badge background behind logo
                </Label>
                <Switch id="logo-pad" checked={logoBg} onCheckedChange={setLogoBg} />
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* 4. CALL-TO-ACTION FRAMES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <LayoutTemplate className="size-4 text-primary" />
          <span>Call-to-Action Frame</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Frame Style</Label>
            <Select value={frame} onValueChange={(v: FrameStyle) => setFrame(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Frame (Clean)</SelectItem>
                <SelectItem value="scan-me">"SCAN ME" Bottom Pill</SelectItem>
                <SelectItem value="top-badge">Top Badge Header</SelectItem>
                <SelectItem value="polaroid">Polaroid Photo Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frame !== "none" && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="frame-text-input" className="text-xs">
                  Frame Text
                </Label>
                <Input
                  id="frame-text-input"
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  placeholder="e.g. SCAN ME, VISIT OUR STORE"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ColorPickerField label="Frame Color" value={frameColor} onChange={setFrameColor} />
                <ColorPickerField
                  label="Text Color"
                  value={frameTextColor}
                  onChange={setFrameTextColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* 5. SIZE & ERROR RECOVERY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sliders className="size-4 text-primary" />
          <span>Resolution & Error Correction</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Resolution Size</Label>
            <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256">256 px (Compact / Web)</SelectItem>
                <SelectItem value="512">512 px (Standard HD)</SelectItem>
                <SelectItem value="1024">1024 px (Crisp High-Res)</SelectItem>
                <SelectItem value="2048">2048 px (Ultra Print 300 DPI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Error Correction</Label>
            <Select value={level} onValueChange={(v: ErrorLevel) => setLevel(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L — 7% recovery (Smallest)</SelectItem>
                <SelectItem value="M">M — 15% recovery (Default)</SelectItem>
                <SelectItem value="Q">Q — 25% recovery (High)</SelectItem>
                <SelectItem value="H">H — 30% recovery (Best for logos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border/80 bg-card p-1 shadow-sm"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}
