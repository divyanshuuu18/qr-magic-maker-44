import { DotStyle, EyeShape, EyeInnerShape, FrameStyle, ErrorLevel } from "@/lib/qr";

export type ContentCategory =
  | "url"
  | "image"
  | "vcard"
  | "wifi"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "location"
  | "event"
  | "upi"
  | "crypto"
  | "social";

export interface ImageData {
  url: string;
  caption: string;
  previewUrl?: string;
  fileSize?: string;
  isUpload?: boolean;
  isCloudHosted?: boolean;
  mode?: "cloud" | "compressed" | "direct";
}

export interface LocationData {
  address: string;
  latitude: string;
  longitude: string;
  label: string;
}

export interface CalendarData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  org: string;
  title: string;
  phone: string;
  workPhone: string;
  email: string;
  url: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  note: string;
}

export interface WhatsAppData {
  countryCode: string;
  phone: string;
  message: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phone: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface UpiData {
  vpa: string;
  payeeName: string;
  amount: string;
  note: string;
}

export interface CryptoData {
  coin: "bitcoin" | "ethereum" | "solana";
  address: string;
  amount: string;
}

export interface SocialData {
  platform: "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok" | "github";
  username: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  fg: string;
  bg: string;
  isGradient?: boolean;
  gradType?: "linear" | "radial";
  gradColor2?: string;
  gradAngle?: number;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "classic-dark",
    name: "Classic Slate",
    fg: "#0f172a",
    bg: "#ffffff",
  },
  {
    id: "cyber-teal",
    name: "Cyber Neon",
    fg: "#06b6d4",
    bg: "#090d16",
    isGradient: true,
    gradType: "linear",
    gradColor2: "#3b82f6",
    gradAngle: 135,
  },
  {
    id: "aurora-violet",
    name: "Aurora Violet",
    fg: "#8b5cf6",
    bg: "#0b0816",
    isGradient: true,
    gradType: "linear",
    gradColor2: "#ec4899",
    gradAngle: 120,
  },
  {
    id: "emerald-lux",
    name: "Royal Emerald",
    fg: "#059669",
    bg: "#f0fdf4",
    isGradient: true,
    gradType: "linear",
    gradColor2: "#10b981",
    gradAngle: 45,
  },
  {
    id: "sunset-fire",
    name: "Sunset Crimson",
    fg: "#f43f5e",
    bg: "#fff1f2",
    isGradient: true,
    gradType: "linear",
    gradColor2: "#f97316",
    gradAngle: 90,
  },
  {
    id: "deep-midnight",
    name: "Deep Obsidian",
    fg: "#38bdf8",
    bg: "#020617",
    isGradient: true,
    gradType: "radial",
    gradColor2: "#818cf8",
  },
  {
    id: "monochrome-clean",
    name: "Pure White",
    fg: "#ffffff",
    bg: "#111827",
  },
];

export interface LogoPreset {
  id: string;
  name: string;
  svgDataUri: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: "wifi",
    name: "WiFi",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2325D366"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.06 16.27C4.24 14.97 3.8 13.46 3.8 11.92C3.8 7.37 7.5 3.67 12.05 3.67C16.6 3.67 20.3 7.37 20.3 11.92C20.29 16.47 16.59 20.15 12.05 20.15M16.57 14.33C16.32 14.2 15.1 13.6 14.87 13.52C14.65 13.43 14.48 13.39 14.32 13.64C14.15 13.88 13.67 14.45 13.52 14.62C13.38 14.78 13.23 14.81 12.98 14.68C12.74 14.56 11.94 14.3 11 13.46C10.26 12.8 9.77 12 9.63 11.75C9.48 11.5 9.62 11.37 9.74 11.24C9.85 11.13 10 10.95 10.12 10.81C10.24 10.66 10.28 10.56 10.36 10.4C10.45 10.23 10.4 10.09 10.34 9.97C10.28 9.84 9.78 8.62 9.58 8.13C9.38 7.65 9.18 7.72 9.03 7.71C8.89 7.7 8.72 7.7 8.56 7.7C8.4 7.7 8.13 7.76 7.9 8.01C7.68 8.25 7.05 8.84 7.05 10.05C7.05 11.26 7.93 12.43 8.06 12.59C8.18 12.76 9.8 15.26 12.27 16.32C12.86 16.57 13.32 16.73 13.67 16.84C14.26 17.03 14.8 17 15.23 16.94C15.7 16.87 16.69 16.34 16.9 15.75C17.1 15.17 17.1 14.67 17.04 14.57C16.98 14.47 16.82 14.45 16.57 14.33Z"/></svg>`,
  },
  {
    id: "instagram",
    name: "Instagram",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E1306C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  },
  {
    id: "github",
    name: "GitHub",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2324292e"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%230A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z"/></svg>`,
  },
  {
    id: "youtube",
    name: "YouTube",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    id: "image",
    name: "Photo/Image",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%238B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  },
  {
    id: "contact",
    name: "Contact",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2306B6D4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`,
  },
  {
    id: "email",
    name: "Email",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%233B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  },
  {
    id: "star",
    name: "Star",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
];

export interface QrHistoryItem {
  id: string;
  title: string;
  category: ContentCategory;
  rawText: string;
  pngDataUrl: string;
  createdAt: number;
  fg: string;
  bg: string;
}
