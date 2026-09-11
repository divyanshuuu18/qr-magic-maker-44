import QRCode from "qrcode";

export type ErrorLevel = "L" | "M" | "Q" | "H";

export interface QrOptions {
  text: string;
  size: number;
  fg: string;
  bg: string;
  level: ErrorLevel;
  logo?: string | null;
  logoScale?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderPngDataUrl(opts: QrOptions): Promise<string> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, opts.text, {
    width: opts.size,
    margin: 2,
    errorCorrectionLevel: opts.level,
    color: { dark: opts.fg, light: opts.bg },
  });

  if (opts.logo) {
    const ctx = canvas.getContext("2d");
    const img = await loadImage(opts.logo);
    if (ctx) {
      const scale = opts.logoScale ?? 0.22;
      const box = Math.round(canvas.width * scale);
      const x = Math.round((canvas.width - box) / 2);
      const y = Math.round((canvas.height - box) / 2);
      const pad = Math.round(box * 0.1);
      ctx.fillStyle = opts.bg;
      ctx.fillRect(x - pad, y - pad, box + pad * 2, box + pad * 2);
      ctx.drawImage(img, x, y, box, box);
    }
  }

  return canvas.toDataURL("image/png");
}

export async function renderSvg(opts: QrOptions): Promise<string> {
  const svg = await QRCode.toString(opts.text, {
    type: "svg",
    width: opts.size,
    margin: 2,
    errorCorrectionLevel: opts.level,
    color: { dark: opts.fg, light: opts.bg },
  });

  if (!opts.logo) return svg;

  const scale = opts.logoScale ?? 0.22;
  const viewBox = /viewBox="0 0 (\d+(?:\.\d+)?) /.exec(svg);
  const units = viewBox ? Number(viewBox[1]) : 100;
  const box = units * scale;
  const pos = (units - box) / 2;
  const pad = box * 0.1;
  const overlay =
    `<rect x="${pos - pad}" y="${pos - pad}" width="${box + pad * 2}" height="${box + pad * 2}" fill="${opts.bg}"/>` +
    `<image href="${opts.logo}" x="${pos}" y="${pos}" width="${box}" height="${box}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace("</svg>", `${overlay}</svg>`);
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const head = dataUrl.split(",")[0] ?? "";
  const body = dataUrl.split(",")[1] ?? "";
  const mime = /:(.*?);/.exec(head)?.[1] ?? "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export const CAPACITY: Record<ErrorLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};
