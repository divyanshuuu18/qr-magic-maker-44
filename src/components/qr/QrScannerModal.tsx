import { useState, useRef } from "react";
import { UploadCloud, QrCode, ArrowRight, X, AlertCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodeQrImage } from "@/lib/qr";
import { ContentCategory } from "./types";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, detectedType: ContentCategory) => void;
}

export function QrScannerModal({ isOpen, onClose, onImport }: QrScannerModalProps) {
  const [decoding, setDecoding] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    text: string;
    detectedType: string;
    parsed?: Record<string, unknown>;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file?: File) => {
    if (!file) return;
    setDecoding(true);
    setScanError(null);
    setScannedResult(null);

    try {
      const res = await decodeQrImage(file);
      setScannedResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to decode QR code from image.";
      setScanError(msg);
    } finally {
      setDecoding(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleApply = () => {
    if (!scannedResult) return;
    const cat = (scannedResult.detectedType as ContentCategory) || "text";
    onImport(scannedResult.text, cat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QrCode className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Scan & Decode QR</h2>
              <p className="text-xs text-muted-foreground">
                Upload any QR code image to read its contents and import it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Upload / Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 p-8 text-center cursor-pointer transition-all hover:border-primary/60 hover:bg-muted/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <UploadCloud className="size-6 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {decoding ? "Decoding QR code..." : "Drop an image here, or click to browse"}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Supports PNG, JPG, WebP, SVG screenshots
          </span>
        </div>

        {/* Error Alert */}
        {scanError && (
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Successful Decoded Result Card */}
        {scannedResult && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FileCheck className="size-4" /> Detected Format:{" "}
                <span className="uppercase font-mono">{scannedResult.detectedType}</span>
              </span>
            </div>
            <div className="rounded-xl bg-card p-3 border border-border/60">
              <span className="block font-mono text-xs text-foreground break-all max-h-28 overflow-y-auto">
                {scannedResult.text}
              </span>
            </div>
            <Button onClick={handleApply} className="w-full font-semibold shadow-md">
              <span>Load into Studio Editor</span>
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
