import { History, Download, ArrowRight, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrHistoryItem } from "./types";

interface QrHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: QrHistoryItem[];
  onSelect: (item: QrHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function QrHistoryDrawer({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClear,
}: QrHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative h-full w-full max-w-md border-l border-border bg-card p-6 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-semibold text-base">
              <History className="size-5 text-primary" />
              <span>Recent Creations</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-normal">
                {items.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Saved locally in your browser so you can retrieve or tweak them anytime.
          </p>
        </div>

        {/* Scrollable list */}
        <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Clock className="size-10 stroke-[1.5] mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No saved QR codes yet</p>
              <p className="text-xs mt-1">
                Generate a code and click "Save to Recent History" to store it here.
              </p>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/50 p-1"
                  style={{ backgroundColor: it.bg }}
                >
                  <img
                    src={it.pngDataUrl}
                    alt={it.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                      {it.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(it.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="truncate font-mono text-xs text-foreground font-medium">
                    {it.title || it.rawText}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onSelect(it);
                      onClose();
                    }}
                    title="Load into Studio"
                    className="size-8 p-0"
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = it.pngDataUrl;
                      a.download = `qr-${it.id}.png`;
                      a.click();
                    }}
                    title="Download PNG"
                    className="size-8 p-0"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(it.id)}
                    title="Delete"
                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 size-3.5" /> Clear All History
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
