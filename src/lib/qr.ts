import QRCode from "qrcode";
import jsQR from "jsqr";

export type ErrorLevel = "L" | "M" | "Q" | "H";
export type DotStyle = "square" | "dots" | "rounded" | "classy";
export type EyeShape = "square" | "rounded" | "circle" | "leaf";
export type EyeInnerShape = "square" | "dot" | "diamond";
export type FrameStyle = "none" | "scan-me" | "bottom-bar" | "top-badge" | "polaroid";

export interface QrOptions {
  text: string;
  size: number;
  fg: string;
  bg: string;
  level: ErrorLevel;
  dotStyle?: DotStyle;
  eyeShape?: EyeShape;
  eyeInnerShape?: EyeInnerShape;
  colorMode?: "solid" | "gradient";
  gradientType?: "linear" | "radial";
  gradientColor2?: string;
  gradientAngle?: number;
  frame?: FrameStyle;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  logo?: string | null;
  logoScale?: number;
  logoBg?: boolean;
  logoBgColor?: string;
  margin?: number;
}

export const CAPACITY: Record<ErrorLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Check if a module at (r, c) is part of the 3 corner finder patterns (7x7) */
function isFinderPattern(r: number, c: number, count: number): boolean {
  // Top-left
  if (r < 7 && c < 7) return true;
  // Top-right
  if (r < 7 && c >= count - 7) return true;
  // Bottom-left
  if (r >= count - 7 && c < 7) return true;
  return false;
}

/** Convert hex color to RGB */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const val = parseInt(clean, 16);
  if (isNaN(val)) return { r: 0, g: 0, b: 0 };
  return {
    r: (val >> 16) & 255,
    g: (val >> 8) & 255,
    b: val & 255,
  };
}

/** Calculate relative luminance for WCAG contrast */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
}

/** Calculate contrast ratio between two hex colors */
export function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/** Evaluate overall scannability score & feedback */
export interface ScannabilityInfo {
  score: number; // 0 - 100
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  contrastRatio: number;
  contrastStatus: "high" | "acceptable" | "low";
  densityStatus: "low" | "medium" | "high";
  message: string;
}

export function evaluateScannability(
  text: string,
  level: ErrorLevel,
  fg: string,
  bg: string,
  hasLogo: boolean,
): ScannabilityInfo {
  const contrast = getContrastRatio(fg, bg);
  const cap = CAPACITY[level];
  const length = text.trim().length;
  const ratio = length / cap;

  let score = 100;
  let message = "Perfect scannability. Works with all standard phone cameras.";

  // Contrast deductions
  let contrastStatus: "high" | "acceptable" | "low" = "high";
  if (contrast < 3) {
    score -= 45;
    contrastStatus = "low";
    message = "Low color contrast. QR readers may fail in low light conditions.";
  } else if (contrast < 4.5) {
    score -= 20;
    contrastStatus = "acceptable";
    message = "Moderate contrast. Works fine, but higher contrast scans faster.";
  }

  // Density deductions
  let densityStatus: "low" | "medium" | "high" = "low";
  if (ratio > 0.6) {
    score -= 20;
    densityStatus = "high";
    message = "High data density. Print at larger sizes or shorten content for faster reading.";
  } else if (ratio > 0.35) {
    score -= 10;
    densityStatus = "medium";
  }

  // Logo penalty if level not H
  if (hasLogo && level !== "H" && level !== "Q") {
    score -= 15;
    message = "When embedding a logo, Error Correction High (H) is strongly recommended.";
  }

  score = Math.max(10, Math.min(100, score));

  let rating: "Excellent" | "Good" | "Fair" | "Poor" = "Excellent";
  if (score >= 85) rating = "Excellent";
  else if (score >= 70) rating = "Good";
  else if (score >= 50) rating = "Fair";
  else rating = "Poor";

  return {
    score,
    rating,
    contrastRatio: contrast,
    contrastStatus,
    densityStatus,
    message,
  };
}

/** Render a single eye on canvas */
function drawEyeCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  outerShape: EyeShape,
  innerShape: EyeInnerShape,
  color: string | CanvasGradient,
  bg: string,
) {
  const outerSize = 7 * cellSize;
  const innerSize = 3 * cellSize;
  const strokeW = cellSize;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Outer ring (7x7 with 5x5 hollow inside)
  const rOuter = outerSize / 2;
  const rInner = (5 * cellSize) / 2;

  if (outerShape === "circle") {
    ctx.beginPath();
    ctx.arc(x + rOuter, y + rOuter, rOuter, 0, Math.PI * 2);
    ctx.arc(x + rOuter, y + rOuter, rInner, 0, Math.PI * 2, true);
    ctx.fill();
  } else if (outerShape === "rounded") {
    const rad = cellSize * 2;
    ctx.beginPath();
    ctx.roundRect(x + strokeW / 2, y + strokeW / 2, outerSize - strokeW, outerSize - strokeW, rad);
    ctx.lineWidth = strokeW;
    ctx.stroke();
  } else if (outerShape === "leaf") {
    const rad = cellSize * 2.5;
    ctx.beginPath();
    ctx.roundRect(x + strokeW / 2, y + strokeW / 2, outerSize - strokeW, outerSize - strokeW, [
      rad,
      0,
      rad,
      0,
    ]);
    ctx.lineWidth = strokeW;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.rect(x + strokeW / 2, y + strokeW / 2, outerSize - strokeW, outerSize - strokeW);
    ctx.lineWidth = strokeW;
    ctx.stroke();
  }

  // Inner center dot (3x3 modules centered at x + 2*cell, y + 2*cell)
  const ix = x + 2 * cellSize;
  const iy = y + 2 * cellSize;

  if (innerShape === "dot") {
    ctx.beginPath();
    ctx.arc(ix + innerSize / 2, iy + innerSize / 2, innerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (innerShape === "diamond") {
    ctx.beginPath();
    ctx.moveTo(ix + innerSize / 2, iy);
    ctx.lineTo(ix + innerSize, iy + innerSize / 2);
    ctx.lineTo(ix + innerSize / 2, iy + innerSize);
    ctx.lineTo(ix, iy + innerSize / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    const rad = outerShape === "square" ? 0 : cellSize * 0.8;
    ctx.beginPath();
    ctx.roundRect(ix, iy, innerSize, innerSize, rad);
    ctx.fill();
  }

  ctx.restore();
}

/** Render custom QR code on HTML Canvas and return data URL */
export async function renderPngDataUrl(opts: QrOptions): Promise<string> {
  const text = opts.text.trim();
  if (!text) return "";

  const marginModules = opts.margin ?? 3;
  const dotStyle = opts.dotStyle ?? "rounded";
  const eyeShape = opts.eyeShape ?? "rounded";
  const eyeInnerShape = opts.eyeInnerShape ?? "dot";
  const frame = opts.frame ?? "none";
  const frameText = opts.frameText ?? "SCAN ME";
  const frameColor = opts.frameColor ?? opts.fg;
  const frameTextColor = opts.frameTextColor ?? "#ffffff";

  // Generate QR model
  const qr = QRCode.create(text, { errorCorrectionLevel: opts.level });
  const count = qr.modules.size;

  // Layout sizing
  const rawQrSize = opts.size;
  const cellSize = rawQrSize / (count + marginModules * 2);
  const qrFullSize = cellSize * (count + marginModules * 2);

  // Additional dimensions for frames
  let canvasW = qrFullSize;
  let canvasH = qrFullSize;
  let qrOffsetY = 0;
  let qrOffsetX = 0;

  if (frame === "scan-me" || frame === "bottom-bar") {
    canvasH += cellSize * 6;
  } else if (frame === "top-badge") {
    canvasH += cellSize * 6;
    qrOffsetY = cellSize * 5;
  } else if (frame === "polaroid") {
    canvasH += cellSize * 8;
    canvasW += cellSize * 2;
    qrOffsetX = cellSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(canvasW);
  canvas.height = Math.round(canvasH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Background
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gradient setup if selected
  let dataFill: string | CanvasGradient = opts.fg;
  if (opts.colorMode === "gradient" && opts.gradientColor2) {
    if (opts.gradientType === "radial") {
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        qrOffsetY + qrFullSize / 2,
        cellSize * 2,
        canvas.width / 2,
        qrOffsetY + qrFullSize / 2,
        qrFullSize * 0.75,
      );
      grad.addColorStop(0, opts.fg);
      grad.addColorStop(1, opts.gradientColor2);
      dataFill = grad;
    } else {
      const angleRad = ((opts.gradientAngle ?? 45) * Math.PI) / 180;
      const diag = Math.sqrt(qrFullSize * qrFullSize * 2);
      const x1 = canvas.width / 2 - (Math.cos(angleRad) * diag) / 2;
      const y1 = qrOffsetY + qrFullSize / 2 - (Math.sin(angleRad) * diag) / 2;
      const x2 = canvas.width / 2 + (Math.cos(angleRad) * diag) / 2;
      const y2 = qrOffsetY + qrFullSize / 2 + (Math.sin(angleRad) * diag) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, opts.fg);
      grad.addColorStop(1, opts.gradientColor2);
      dataFill = grad;
    }
  }

  // Calculate logo exclusions if logo is present
  const logoScale = opts.logoScale ?? 0.22;
  const logoBoxMod = opts.logo ? Math.ceil(count * logoScale) : 0;
  const centerMod = count / 2;
  const logoModHalf = logoBoxMod / 2;

  // Draw Data Modules
  ctx.fillStyle = dataFill;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isFinderPattern(r, c, count)) continue;

      if (
        opts.logo &&
        Math.abs(r - centerMod + 0.5) < logoModHalf &&
        Math.abs(c - centerMod + 0.5) < logoModHalf
      ) {
        continue;
      }

      if (qr.modules.get(r, c)) {
        const mx = qrOffsetX + (marginModules + c) * cellSize;
        const my = qrOffsetY + (marginModules + r) * cellSize;

        ctx.beginPath();
        if (dotStyle === "dots") {
          ctx.arc(mx + cellSize / 2, my + cellSize / 2, cellSize * 0.46, 0, Math.PI * 2);
          ctx.fill();
        } else if (dotStyle === "rounded") {
          ctx.roundRect(
            mx + cellSize * 0.06,
            my + cellSize * 0.06,
            cellSize * 0.88,
            cellSize * 0.88,
            cellSize * 0.35,
          );
          ctx.fill();
        } else if (dotStyle === "classy") {
          ctx.moveTo(mx + cellSize / 2, my + cellSize * 0.08);
          ctx.lineTo(mx + cellSize * 0.92, my + cellSize / 2);
          ctx.lineTo(mx + cellSize / 2, my + cellSize * 0.92);
          ctx.lineTo(mx + cellSize * 0.08, my + cellSize / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.rect(mx, my, cellSize + 0.3, cellSize + 0.3);
          ctx.fill();
        }
      }
    }
  }

  // Draw Finder Pattern Eyes
  drawEyeCanvas(
    ctx,
    qrOffsetX + marginModules * cellSize,
    qrOffsetY + marginModules * cellSize,
    cellSize,
    eyeShape,
    eyeInnerShape,
    dataFill,
    opts.bg,
  );

  drawEyeCanvas(
    ctx,
    qrOffsetX + (marginModules + count - 7) * cellSize,
    qrOffsetY + marginModules * cellSize,
    cellSize,
    eyeShape,
    eyeInnerShape,
    dataFill,
    opts.bg,
  );

  drawEyeCanvas(
    ctx,
    qrOffsetX + marginModules * cellSize,
    qrOffsetY + (marginModules + count - 7) * cellSize,
    cellSize,
    eyeShape,
    eyeInnerShape,
    dataFill,
    opts.bg,
  );

  // Draw Center Logo
  if (opts.logo) {
    try {
      const img = await loadImage(opts.logo);
      const logoPixSize = Math.round(qrFullSize * logoScale);
      const lx = qrOffsetX + (qrFullSize - logoPixSize) / 2;
      const ly = qrOffsetY + (qrFullSize - logoPixSize) / 2;
      const pad = Math.round(logoPixSize * 0.12);

      if (opts.logoBg !== false) {
        ctx.fillStyle = opts.logoBgColor ?? opts.bg;
        ctx.beginPath();
        ctx.roundRect(lx - pad, ly - pad, logoPixSize + pad * 2, logoPixSize + pad * 2, pad * 1.5);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.drawImage(img, lx, ly, logoPixSize, logoPixSize);
    } catch (e) {
      console.warn("Failed to draw logo onto canvas:", e);
    }
  }

  // Draw Frame
  if (frame !== "none") {
    ctx.save();
    if (frame === "scan-me" || frame === "bottom-bar") {
      const badgeH = cellSize * 4.5;
      const badgeW = qrFullSize * 0.75;
      const bx = qrOffsetX + (qrFullSize - badgeW) / 2;
      const by = qrOffsetY + qrFullSize - cellSize * 1.5;

      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
      ctx.fill();

      ctx.fillStyle = frameTextColor;
      ctx.font = `bold ${Math.round(badgeH * 0.44)}px "DM Sans", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText.toUpperCase(), bx + badgeW / 2, by + badgeH / 2);
    } else if (frame === "top-badge") {
      const badgeH = cellSize * 4;
      const badgeW = qrFullSize * 0.75;
      const bx = qrOffsetX + (qrFullSize - badgeW) / 2;
      const by = cellSize * 1;

      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
      ctx.fill();

      ctx.fillStyle = frameTextColor;
      ctx.font = `bold ${Math.round(badgeH * 0.45)}px "DM Sans", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText.toUpperCase(), bx + badgeW / 2, by + badgeH / 2);
    } else if (frame === "polaroid") {
      const by = qrOffsetY + qrFullSize + cellSize * 1.5;
      ctx.fillStyle = opts.fg;
      ctx.font = `600 ${Math.round(cellSize * 3)}px "Space Grotesk", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText, canvas.width / 2, by);
    }
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

/** Generate an SVG string representation */
export async function renderSvg(opts: QrOptions): Promise<string> {
  const text = opts.text.trim();
  if (!text) return "";

  const marginModules = opts.margin ?? 3;
  const dotStyle = opts.dotStyle ?? "rounded";
  const eyeShape = opts.eyeShape ?? "rounded";
  const eyeInnerShape = opts.eyeInnerShape ?? "dot";
  const frame = opts.frame ?? "none";
  const frameText = opts.frameText ?? "SCAN ME";
  const frameColor = opts.frameColor ?? opts.fg;
  const frameTextColor = opts.frameTextColor ?? "#ffffff";

  const qr = QRCode.create(text, { errorCorrectionLevel: opts.level });
  const count = qr.modules.size;
  const rawQrSize = opts.size;
  const cellSize = rawQrSize / (count + marginModules * 2);
  const qrFullSize = cellSize * (count + marginModules * 2);

  let canvasW = qrFullSize;
  let canvasH = qrFullSize;
  let qrOffsetY = 0;
  let qrOffsetX = 0;

  if (frame === "scan-me" || frame === "bottom-bar") {
    canvasH += cellSize * 6;
  } else if (frame === "top-badge") {
    canvasH += cellSize * 6;
    qrOffsetY = cellSize * 5;
  } else if (frame === "polaroid") {
    canvasH += cellSize * 8;
    canvasW += cellSize * 2;
    qrOffsetX = cellSize;
  }

  let defs = "";
  let dataFillId = opts.fg;
  if (opts.colorMode === "gradient" && opts.gradientColor2) {
    dataFillId = "url(#qr-gradient)";
    if (opts.gradientType === "radial") {
      defs += `
        <radialGradient id="qr-gradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="${opts.fg}" />
          <stop offset="100%" stop-color="${opts.gradientColor2}" />
        </radialGradient>
      `;
    } else {
      const angle = opts.gradientAngle ?? 45;
      defs += `
        <linearGradient id="qr-gradient" gradientTransform="rotate(${angle})">
          <stop offset="0%" stop-color="${opts.fg}" />
          <stop offset="100%" stop-color="${opts.gradientColor2}" />
        </linearGradient>
      `;
    }
  }

  const logoScale = opts.logoScale ?? 0.22;
  const logoBoxMod = opts.logo ? Math.ceil(count * logoScale) : 0;
  const centerMod = count / 2;
  const logoModHalf = logoBoxMod / 2;

  let modulesSvg = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isFinderPattern(r, c, count)) continue;

      if (
        opts.logo &&
        Math.abs(r - centerMod + 0.5) < logoModHalf &&
        Math.abs(c - centerMod + 0.5) < logoModHalf
      ) {
        continue;
      }

      if (qr.modules.get(r, c)) {
        const mx = qrOffsetX + (marginModules + c) * cellSize;
        const my = qrOffsetY + (marginModules + r) * cellSize;

        if (dotStyle === "dots") {
          modulesSvg += `<circle cx="${(mx + cellSize / 2).toFixed(2)}" cy="${(my + cellSize / 2).toFixed(2)}" r="${(cellSize * 0.46).toFixed(2)}" fill="${dataFillId}" />`;
        } else if (dotStyle === "rounded") {
          modulesSvg += `<rect x="${(mx + cellSize * 0.06).toFixed(2)}" y="${(my + cellSize * 0.06).toFixed(2)}" width="${(cellSize * 0.88).toFixed(2)}" height="${(cellSize * 0.88).toFixed(2)}" rx="${(cellSize * 0.35).toFixed(2)}" fill="${dataFillId}" />`;
        } else if (dotStyle === "classy") {
          modulesSvg += `<polygon points="${(mx + cellSize / 2).toFixed(2)},${my.toFixed(2)} ${(mx + cellSize).toFixed(2)},${(my + cellSize / 2).toFixed(2)} ${(mx + cellSize / 2).toFixed(2)},${(my + cellSize).toFixed(2)} ${mx.toFixed(2)},${(my + cellSize / 2).toFixed(2)}" fill="${dataFillId}" />`;
        } else {
          modulesSvg += `<rect x="${mx.toFixed(2)}" y="${my.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${dataFillId}" />`;
        }
      }
    }
  }

  function renderSvgEye(x: number, y: number): string {
    const outerSize = 7 * cellSize;
    const strokeW = cellSize;
    const innerSize = 3 * cellSize;
    const ix = x + 2 * cellSize;
    const iy = y + 2 * cellSize;

    let outerSvg = "";
    if (eyeShape === "circle") {
      const rOuter = outerSize / 2;
      const rInner = (5 * cellSize) / 2;
      outerSvg = `
        <path fill-rule="evenodd" fill="${dataFillId}" d="
          M ${x + rOuter} ${y}
          A ${rOuter} ${rOuter} 0 1 0 ${x + rOuter} ${y + outerSize}
          A ${rOuter} ${rOuter} 0 1 0 ${x + rOuter} ${y}
          Z
          M ${x + rOuter} ${y + strokeW}
          A ${rInner} ${rInner} 0 1 1 ${x + rOuter} ${y + outerSize - strokeW}
          A ${rInner} ${rInner} 0 1 1 ${x + rOuter} ${y + strokeW}
          Z
        " />
      `;
    } else if (eyeShape === "rounded") {
      outerSvg = `<rect x="${(x + strokeW / 2).toFixed(2)}" y="${(y + strokeW / 2).toFixed(2)}" width="${(outerSize - strokeW).toFixed(2)}" height="${(outerSize - strokeW).toFixed(2)}" rx="${(cellSize * 2).toFixed(2)}" fill="none" stroke="${dataFillId}" stroke-width="${strokeW.toFixed(2)}" />`;
    } else if (eyeShape === "leaf") {
      const rad = cellSize * 2.5;
      outerSvg = `<rect x="${(x + strokeW / 2).toFixed(2)}" y="${(y + strokeW / 2).toFixed(2)}" width="${(outerSize - strokeW).toFixed(2)}" height="${(outerSize - strokeW).toFixed(2)}" rx="${rad.toFixed(2)}" fill="none" stroke="${dataFillId}" stroke-width="${strokeW.toFixed(2)}" />`;
    } else {
      outerSvg = `<rect x="${(x + strokeW / 2).toFixed(2)}" y="${(y + strokeW / 2).toFixed(2)}" width="${(outerSize - strokeW).toFixed(2)}" height="${(outerSize - strokeW).toFixed(2)}" fill="none" stroke="${dataFillId}" stroke-width="${strokeW.toFixed(2)}" />`;
    }

    let innerSvg = "";
    if (eyeInnerShape === "dot") {
      innerSvg = `<circle cx="${(ix + innerSize / 2).toFixed(2)}" cy="${(iy + innerSize / 2).toFixed(2)}" r="${(innerSize / 2).toFixed(2)}" fill="${dataFillId}" />`;
    } else if (eyeInnerShape === "diamond") {
      innerSvg = `<polygon points="${(ix + innerSize / 2).toFixed(2)},${iy.toFixed(2)} ${(ix + innerSize).toFixed(2)},${(iy + innerSize / 2).toFixed(2)} ${(ix + innerSize / 2).toFixed(2)},${(iy + innerSize).toFixed(2)} ${ix.toFixed(2)},${(iy + innerSize / 2).toFixed(2)}" fill="${dataFillId}" />`;
    } else {
      const rad = eyeShape === "square" ? 0 : cellSize * 0.8;
      innerSvg = `<rect x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${rad.toFixed(2)}" fill="${dataFillId}" />`;
    }

    return outerSvg + innerSvg;
  }

  const eyesSvg =
    renderSvgEye(qrOffsetX + marginModules * cellSize, qrOffsetY + marginModules * cellSize) +
    renderSvgEye(
      qrOffsetX + (marginModules + count - 7) * cellSize,
      qrOffsetY + marginModules * cellSize,
    ) +
    renderSvgEye(
      qrOffsetX + marginModules * cellSize,
      qrOffsetY + (marginModules + count - 7) * cellSize,
    );

  let logoSvg = "";
  if (opts.logo) {
    const logoPixSize = Math.round(qrFullSize * logoScale);
    const lx = qrOffsetX + (qrFullSize - logoPixSize) / 2;
    const ly = qrOffsetY + (qrFullSize - logoPixSize) / 2;
    const pad = Math.round(logoPixSize * 0.12);

    if (opts.logoBg !== false) {
      logoSvg += `<rect x="${(lx - pad).toFixed(2)}" y="${(ly - pad).toFixed(2)}" width="${(logoPixSize + pad * 2).toFixed(2)}" height="${(logoPixSize + pad * 2).toFixed(2)}" rx="${(pad * 1.5).toFixed(2)}" fill="${opts.logoBgColor ?? opts.bg}" stroke="rgba(0,0,0,0.06)" stroke-width="1" />`;
    }
    logoSvg += `<image href="${opts.logo}" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" width="${logoPixSize.toFixed(2)}" height="${logoPixSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`;
  }

  let frameSvg = "";
  if (frame === "scan-me" || frame === "bottom-bar") {
    const badgeH = cellSize * 4.5;
    const badgeW = qrFullSize * 0.75;
    const bx = qrOffsetX + (qrFullSize - badgeW) / 2;
    const by = qrOffsetY + qrFullSize - cellSize * 1.5;
    frameSvg = `
      <rect x="${bx.toFixed(2)}" y="${by.toFixed(2)}" width="${badgeW.toFixed(2)}" height="${badgeH.toFixed(2)}" rx="${(badgeH / 2).toFixed(2)}" fill="${frameColor}" />
      <text x="${(bx + badgeW / 2).toFixed(2)}" y="${(by + badgeH / 2 + 1).toFixed(2)}" fill="${frameTextColor}" font-family="DM Sans, system-ui, sans-serif" font-weight="bold" font-size="${(badgeH * 0.44).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1.5">${frameText.toUpperCase()}</text>
    `;
  } else if (frame === "top-badge") {
    const badgeH = cellSize * 4;
    const badgeW = qrFullSize * 0.75;
    const bx = qrOffsetX + (qrFullSize - badgeW) / 2;
    const by = cellSize * 1;
    frameSvg = `
      <rect x="${bx.toFixed(2)}" y="${by.toFixed(2)}" width="${badgeW.toFixed(2)}" height="${badgeH.toFixed(2)}" rx="${(badgeH / 2).toFixed(2)}" fill="${frameColor}" />
      <text x="${(bx + badgeW / 2).toFixed(2)}" y="${(by + badgeH / 2 + 1).toFixed(2)}" fill="${frameTextColor}" font-family="DM Sans, system-ui, sans-serif" font-weight="bold" font-size="${(badgeH * 0.45).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1.5">${frameText.toUpperCase()}</text>
    `;
  } else if (frame === "polaroid") {
    const by = qrOffsetY + qrFullSize + cellSize * 1.5;
    frameSvg = `
      <text x="${(canvasW / 2).toFixed(2)}" y="${by.toFixed(2)}" fill="${opts.fg}" font-family="Space Grotesk, system-ui, sans-serif" font-weight="600" font-size="${(cellSize * 3).toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${frameText}</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW.toFixed(2)} ${canvasH.toFixed(2)}" width="${canvasW}" height="${canvasH}">
      <defs>${defs}</defs>
      <rect width="100%" height="100%" fill="${opts.bg}" />
      ${modulesSvg}
      ${eyesSvg}
      ${logoSvg}
      ${frameSvg}
    </svg>
  `.trim();
}

/** Decode QR Code from an Image file or data URL */
export async function decodeQrImage(fileOrUrl: File | string): Promise<{
  text: string;
  detectedType: string;
  parsed?: Record<string, unknown>;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas for QR decoding"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code || !code.data) {
        reject(
          new Error("No QR code found in this image. Make sure the image is clear and well-lit."),
        );
        return;
      }

      const raw = code.data;
      const detected = detectContentType(raw);
      resolve({
        text: raw,
        detectedType: detected.type,
        ...(detected.parsed ? { parsed: detected.parsed } : {}),
      });
    };
    img.onerror = () => reject(new Error("Failed to load image for scanning"));

    if (typeof fileOrUrl === "string") {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => (img.src = String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(fileOrUrl);
    }
  });
}

/** Detect content format from decoded string */
export function detectContentType(raw: string): {
  type: string;
  parsed?: Record<string, unknown>;
} {
  const str = raw.trim();
  if (str.startsWith("WIFI:")) {
    const ssidMatch = /S:([^;]*)/.exec(str);
    const passMatch = /P:([^;]*)/.exec(str);
    const encMatch = /T:([^;]*)/.exec(str);
    const hiddenMatch = /H:([^;]*)/.exec(str);
    return {
      type: "wifi",
      parsed: {
        ssid: ssidMatch ? ssidMatch[1] : "",
        password: passMatch ? passMatch[1] : "",
        encryption: encMatch ? encMatch[1] : "WPA",
        hidden: hiddenMatch ? hiddenMatch[1] === "true" : false,
      },
    };
  }

  if (str.startsWith("BEGIN:VCARD")) {
    const fnMatch = /FN:(.*?)(\r?\n|$)/i.exec(str);
    const telMatch = /TEL[^:]*:(.*?)(\r?\n|$)/i.exec(str);
    const emailMatch = /EMAIL[^:]*:(.*?)(\r?\n|$)/i.exec(str);
    const orgMatch = /ORG:(.*?)(\r?\n|$)/i.exec(str);
    const urlMatch = /URL:(.*?)(\r?\n|$)/i.exec(str);
    return {
      type: "vcard",
      parsed: {
        name: fnMatch && fnMatch[1] ? fnMatch[1].trim() : "",
        phone: telMatch && telMatch[1] ? telMatch[1].trim() : "",
        email: emailMatch && emailMatch[1] ? emailMatch[1].trim() : "",
        org: orgMatch && orgMatch[1] ? orgMatch[1].trim() : "",
        url: urlMatch && urlMatch[1] ? urlMatch[1].trim() : "",
      },
    };
  }

  if (str.startsWith("mailto:")) {
    const mail = str.replace(/^mailto:/i, "");
    const parts = mail.split("?");
    const email = parts[0];
    const params = new URLSearchParams(parts[1] || "");
    return {
      type: "email",
      parsed: {
        email,
        subject: params.get("subject") || "",
        body: params.get("body") || "",
      },
    };
  }

  if (str.startsWith("tel:")) {
    return {
      type: "phone",
      parsed: { phone: str.replace(/^tel:/i, "") },
    };
  }

  if (str.startsWith("smsto:") || str.startsWith("sms:")) {
    const clean = str.replace(/^(smsto|sms):/i, "");
    const parts = clean.split(":");
    return {
      type: "sms",
      parsed: {
        phone: parts[0] || "",
        message: parts[1] || "",
      },
    };
  }

  if (str.startsWith("https://wa.me/")) {
    const clean = str.replace("https://wa.me/", "");
    const parts = clean.split("?text=");
    return {
      type: "whatsapp",
      parsed: {
        phone: parts[0] || "",
        message: parts[1] ? decodeURIComponent(parts[1]) : "",
      },
    };
  }

  if (str.startsWith("upi://pay")) {
    try {
      const u = new URL(str);
      return {
        type: "upi",
        parsed: {
          pa: u.searchParams.get("pa") || "",
          pn: u.searchParams.get("pn") || "",
          am: u.searchParams.get("am") || "",
        },
      };
    } catch {
      return { type: "upi" };
    }
  }

  if (str.startsWith("geo:") || str.includes("maps.google.com") || str.includes("goo.gl/maps")) {
    return { type: "location", parsed: { query: str } };
  }

  if (str.startsWith("BEGIN:VCALENDAR") || str.startsWith("BEGIN:VEVENT")) {
    const summaryMatch = /SUMMARY:(.*?)(\r?\n|$)/i.exec(str);
    const locMatch = /LOCATION:(.*?)(\r?\n|$)/i.exec(str);
    return {
      type: "event",
      parsed: {
        title: summaryMatch && summaryMatch[1] ? summaryMatch[1].trim() : "Event",
        location: locMatch && locMatch[1] ? locMatch[1].trim() : "",
      },
    };
  }

  if (
    str.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i) ||
    str.startsWith("data:image/")
  ) {
    return { type: "image", parsed: { url: str } };
  }

  if (str.startsWith("http://") || str.startsWith("https://")) {
    return { type: "url", parsed: { url: str } };
  }

  return { type: "text", parsed: { text: str } };
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

/** Download text content as a file (e.g. .vcf, .ics) */
export function downloadTextFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
