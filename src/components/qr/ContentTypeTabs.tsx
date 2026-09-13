import { useState, useEffect, useRef } from "react";
import {
  Link as LinkIcon,
  Image as ImageIcon,
  UserSquare2,
  Wifi,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  Share2,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Download,
  Copy,
  ExternalLink,
  Check,
  Building,
  Briefcase,
  Globe,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadTextFile } from "@/lib/qr";
import {
  ContentCategory,
  ImageData,
  LocationData,
  CalendarData,
  WifiData,
  VCardData,
  WhatsAppData,
  EmailData,
  PhoneData,
  SmsData,
  UpiData,
  CryptoData,
  SocialData,
} from "./types";

interface ContentTypeTabsProps {
  value: string;
  category: ContentCategory;
  onChangeCategory: (cat: ContentCategory) => void;
  onChangeText: (text: string) => void;
}

const SAMPLE_IMAGES = [
  {
    name: "🍽️ Restaurant Menu",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    caption: "Le Bistro — Seasonal Dinner & Wine Menu",
  },
  {
    name: "🎨 Artwork Showcase",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    caption: "Modernist Abstract Gallery — Original Canvas",
  },
  {
    name: "🎉 Event Poster",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    caption: "Summer Music Festival 2026 — Main Stage Lineup",
  },
  {
    name: "📸 Creator Portfolio",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    caption: "Photography & Creative Direction Portfolio",
  },
];

export function ContentTypeTabs({
  value,
  category,
  onChangeCategory,
  onChangeText,
}: ContentTypeTabsProps) {
  // Category states
  const [url, setUrl] = useState("https://lovable.dev");

  // Image category state
  const [imageData, setImageData] = useState<ImageData>({
    url: SAMPLE_IMAGES[0]?.url ?? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    caption: SAMPLE_IMAGES[0]?.caption ?? "Restaurant Menu",
    previewUrl: SAMPLE_IMAGES[0]?.url ?? "",
    fileSize: "~180 KB",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WiFi state
  const [wifi, setWifi] = useState<WifiData>({
    ssid: "Cafe_Guest_5G",
    password: "coffeepassword2026",
    encryption: "WPA",
    hidden: false,
  });
  const [showWifiPass, setShowWifiPass] = useState(false);

  // vCard state
  const [vcard, setVcard] = useState<VCardData>({
    firstName: "Alex",
    lastName: "Morgan",
    org: "Innovate Labs",
    title: "Chief Product Officer",
    phone: "+1 (555) 234-5678",
    workPhone: "+1 (555) 890-1234",
    email: "alex.morgan@innovatelabs.io",
    url: "https://innovatelabs.io",
    street: "500 Silicon Way, Suite 400",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "USA",
    note: "Looking forward to collaborating on high-impact projects!",
  });

  // Plain text state
  const [rawText, setRawText] = useState(
    "Welcome to QR Studio Pro! Scan this QR code to access your exclusive content.",
  );

  // Email state
  const [email, setEmail] = useState<EmailData>({
    email: "hello@company.com",
    subject: "Inquiry from QR Code",
    body: "Hi Team,\n\nI scanned your QR code and would love to connect.",
  });

  // Phone state
  const [phone, setPhone] = useState<PhoneData>({
    phone: "+1 (800) 555-0199",
  });

  // SMS state
  const [sms, setSms] = useState<SmsData>({
    phone: "+1 (555) 987-6543",
    message: "Hello! Inquiring about your product lineup.",
  });

  // WhatsApp state
  const [whatsapp, setWhatsapp] = useState<WhatsAppData>({
    countryCode: "1",
    phone: "5551234567",
    message: "Hi! I scanned your QR code and would like to chat.",
  });

  // Location state
  const [location, setLocation] = useState<LocationData>({
    address: "Times Square, New York, NY 10036",
    latitude: "40.7580",
    longitude: "-73.9855",
    label: "Times Square Flagship Store",
  });

  // Calendar Event state
  const [calendar, setCalendar] = useState<CalendarData>({
    title: "Global Tech Summit 2026",
    location: "Convention Center & Online Stream",
    startDate: "2026-10-15T09:00",
    endDate: "2026-10-15T18:00",
    description: "Annual keynote speeches, product showcases, and networking.",
  });

  // Payment UPI state
  const [upi, setUpi] = useState<UpiData>({
    vpa: "merchant@bank",
    payeeName: "Artisan Cafe",
    amount: "25.00",
    note: "Order #4082",
  });

  // Crypto state
  const [crypto, setCrypto] = useState<CryptoData>({
    coin: "bitcoin",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    amount: "0.005",
  });

  // Social state
  const [social, setSocial] = useState<SocialData>({
    platform: "instagram",
    username: "creativestudio",
  });

  // Copy feedback state
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const copyToClipboard = (str: string, label: string) => {
    navigator.clipboard.writeText(str);
    setCopiedAction(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  // Sync category state to raw text payload
  useEffect(() => {
    let payload = "";

    switch (category) {
      case "url": {
        payload = url.trim();
        break;
      }
      case "image": {
        payload = imageData.url.trim();
        break;
      }
      case "wifi": {
        const enc = wifi.encryption === "nopass" ? "nopass" : wifi.encryption;
        const pass = wifi.encryption === "nopass" ? "" : wifi.password;
        payload = `WIFI:T:${enc};S:${wifi.ssid};P:${pass};H:${wifi.hidden ? "true" : "false"};;`;
        break;
      }
      case "vcard": {
        payload = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vcard.lastName};${vcard.firstName};;;`,
          `FN:${vcard.firstName} ${vcard.lastName}`.trim(),
          vcard.org ? `ORG:${vcard.org}` : null,
          vcard.title ? `TITLE:${vcard.title}` : null,
          vcard.phone ? `TEL;TYPE=CELL:${vcard.phone}` : null,
          vcard.workPhone ? `TEL;TYPE=WORK:${vcard.workPhone}` : null,
          vcard.email ? `EMAIL:${vcard.email}` : null,
          vcard.url ? `URL:${vcard.url}` : null,
          vcard.street || vcard.city
            ? `ADR;TYPE=WORK:;;${vcard.street || ""};${vcard.city || ""};${vcard.state || ""};${vcard.zip || ""};${vcard.country || ""}`
            : null,
          vcard.note ? `NOTE:${vcard.note}` : null,
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n");
        break;
      }
      case "text": {
        payload = rawText;
        break;
      }
      case "email": {
        const params = new URLSearchParams();
        if (email.subject) params.set("subject", email.subject);
        if (email.body) params.set("body", email.body);
        const q = params.toString();
        payload = `mailto:${email.email}${q ? `?${q}` : ""}`;
        break;
      }
      case "phone": {
        payload = `tel:${phone.phone.replace(/\s+/g, "")}`;
        break;
      }
      case "sms": {
        payload = `smsto:${sms.phone.replace(/\s+/g, "")}:${sms.message}`;
        break;
      }
      case "whatsapp": {
        const cleanNum = (whatsapp.countryCode + whatsapp.phone).replace(/\D/g, "");
        const textParam = whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : "";
        payload = `https://wa.me/${cleanNum}${textParam}`;
        break;
      }
      case "location": {
        if (location.latitude && location.longitude) {
          payload = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
        } else {
          payload = `https://maps.google.com/?q=${encodeURIComponent(location.address)}`;
        }
        break;
      }
      case "event": {
        const formatIcsDate = (dateStr: string) => {
          if (!dateStr) return "";
          return dateStr.replace(/[-:]/g, "").replace("T", "T") + "00Z";
        };
        payload = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//QR Studio Pro//EN",
          "BEGIN:VEVENT",
          `SUMMARY:${calendar.title}`,
          calendar.location ? `LOCATION:${calendar.location}` : null,
          calendar.description ? `DESCRIPTION:${calendar.description}` : null,
          calendar.startDate ? `DTSTART:${formatIcsDate(calendar.startDate)}` : null,
          calendar.endDate ? `DTEND:${formatIcsDate(calendar.endDate)}` : null,
          "END:VEVENT",
          "END:VCALENDAR",
        ]
          .filter(Boolean)
          .join("\n");
        break;
      }
      case "upi": {
        const params = new URLSearchParams();
        params.set("pa", upi.vpa);
        if (upi.payeeName) params.set("pn", upi.payeeName);
        if (upi.amount) params.set("am", upi.amount);
        if (upi.note) params.set("tn", upi.note);
        payload = `upi://pay?${params.toString()}`;
        break;
      }
      case "crypto": {
        if (crypto.coin === "bitcoin") {
          payload = `bitcoin:${crypto.address}${crypto.amount ? `?amount=${crypto.amount}` : ""}`;
        } else if (crypto.coin === "ethereum") {
          payload = `ethereum:${crypto.address}${crypto.amount ? `?value=${crypto.amount}` : ""}`;
        } else {
          payload = `solana:${crypto.address}`;
        }
        break;
      }
      case "social": {
        const u = social.username.replace("@", "").trim();
        switch (social.platform) {
          case "instagram":
            payload = `https://instagram.com/${u}`;
            break;
          case "twitter":
            payload = `https://x.com/${u}`;
            break;
          case "linkedin":
            payload = `https://linkedin.com/in/${u}`;
            break;
          case "youtube":
            payload = `https://youtube.com/@${u}`;
            break;
          case "tiktok":
            payload = `https://tiktok.com/@${u}`;
            break;
          case "github":
            payload = `https://github.com/${u}`;
            break;
        }
        break;
      }
      default:
        payload = rawText;
        break;
    }

    onChangeText(payload);
  }, [
    category,
    url,
    imageData,
    wifi,
    vcard,
    rawText,
    email,
    phone,
    sms,
    whatsapp,
    location,
    calendar,
    upi,
    crypto,
    social,
    onChangeText,
  ]);

  // Handle local image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    const sizeKb = (file.size / 1024).toFixed(1);
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result);
      setImageData({
        url: dataUrl,
        previewUrl: dataUrl,
        caption: file.name,
        fileSize: `${sizeKb} KB`,
        isUpload: true,
      });
      toast.success(`Image "${file.name}" uploaded successfully!`);
    };

    reader.readAsDataURL(file);
  };

  // Categories list with badges and icons
  const categories: {
    id: ContentCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }[] = [
    { id: "url", label: "Link / Web", icon: LinkIcon },
    { id: "image", label: "Image / Photo", icon: ImageIcon, tag: "New" },
    { id: "vcard", label: "Contact (vCard)", icon: UserSquare2, tag: "Add to Phone" },
    { id: "wifi", label: "WiFi Access", icon: Wifi, tag: "Instant Connect" },
    { id: "text", label: "Plain Text", icon: FileText },
    { id: "email", label: "Email", icon: Mail },
    { id: "phone", label: "Call", icon: Phone },
    { id: "sms", label: "SMS Text", icon: MessageSquare },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "location", label: "Location / Map", icon: MapPin },
    { id: "event", label: "Calendar Event", icon: Calendar },
    { id: "upi", label: "UPI Pay", icon: CreditCard },
    { id: "crypto", label: "Crypto", icon: Coins },
    { id: "social", label: "Social", icon: Share2 },
  ];

  return (
    <div className="space-y-4">
      {/* Category selector pill tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select QR Content Type
          </span>
          <span className="text-[11px] text-primary font-medium">14 Format Types</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChangeCategory(cat.id)}
                className={`relative flex items-center gap-2.5 p-2.5 text-xs font-medium rounded-xl border transition-all text-left group ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 font-semibold"
                    : "bg-card/70 text-muted-foreground border-border/60 hover:text-foreground hover:bg-card hover:border-primary/40"
                }`}
              >
                <div
                  className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted/70 text-foreground group-hover:text-primary group-hover:bg-primary/10"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{cat.label}</div>
                  {cat.tag && (
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold block truncate ${
                        isActive ? "text-primary-foreground/80" : "text-primary"
                      }`}
                    >
                      {cat.tag}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic wizard fields based on chosen category */}
      <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-5 space-y-4 shadow-sm">
        {/* ===================== URL CATEGORY ===================== */}
        {category === "url" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="url-input" className="text-sm font-semibold flex items-center gap-1.5">
                <LinkIcon className="size-4 text-primary" /> Target Website URL
              </Label>
              <Input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="font-mono text-sm"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Sparkles className="size-3 text-primary" /> Popular presets:
              </span>
              {[
                { name: "Portfolio / Bio", link: "https://myportfolio.design" },
                { name: "Lovable.dev", link: "https://lovable.dev" },
                { name: "GitHub Profile", link: "https://github.com" },
                { name: "Google Review", link: "https://g.page/r/review" },
                { name: "Linktree", link: "https://linktr.ee/yourname" },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setUrl(p.link)}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs hover:bg-muted transition-colors font-medium text-foreground"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Test Action */}
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs border border-border/40">
              <span className="text-muted-foreground">Test destination URL in new tab:</span>
              <a
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <span>Visit Link</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}

        {/* ===================== IMAGE / PHOTO CATEGORY ===================== */}
        {category === "image" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <ImageIcon className="size-4 text-purple-500" /> Image / Photo Destination
              </Label>
              <span className="text-[11px] text-muted-foreground">Direct link or file upload</span>
            </div>

            {/* Image URL input */}
            <div className="space-y-1.5">
              <Label htmlFor="image-url-input" className="text-xs text-muted-foreground">
                Direct Image Link (Web / CDN / Cloud URL)
              </Label>
              <Input
                id="image-url-input"
                type="url"
                value={imageData.url.startsWith("data:") ? "Local File Uploaded" : imageData.url}
                onChange={(e) =>
                  setImageData({
                    ...imageData,
                    url: e.target.value,
                    previewUrl: e.target.value,
                    isUpload: false,
                  })
                }
                placeholder="https://example.com/photo.jpg"
                disabled={imageData.url.startsWith("data:")}
                className="font-mono text-xs"
              />
            </div>

            {/* Upload File button & Presets */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed border-border/80 p-3 text-center bg-card/40 flex flex-col items-center justify-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 font-medium"
                >
                  <Upload className="size-3.5 text-primary" /> Upload Image File
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPG, WebP supported.
                </span>
              </div>

              {/* Sample image quick-select */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Choose Sample Photo</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() =>
                        setImageData({
                          url: img.url,
                          previewUrl: img.url,
                          caption: img.caption,
                          fileSize: "~150 KB",
                          isUpload: false,
                        })
                      }
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        imageData.caption === img.caption
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="truncate">{img.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Image Preview Card */}
            {imageData.previewUrl && (
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 flex items-center gap-4">
                <div className="relative size-20 rounded-xl overflow-hidden border border-border shrink-0 bg-neutral-900 flex items-center justify-center">
                  <img
                    src={imageData.previewUrl}
                    alt={imageData.caption || "Preview"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-semibold text-xs text-foreground truncate">
                    {imageData.caption || "Image Destination"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate font-mono">
                    {imageData.isUpload ? "Base64 Image Payload" : imageData.url}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={imageData.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <Eye className="size-3" /> View Full Image
                    </a>
                    <span className="text-border">•</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(imageData.url, "Image Link")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="size-3" /> Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== VCARD / CONTACT CATEGORY ===================== */}
        {category === "vcard" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <UserSquare2 className="size-4 text-cyan-500" /> Digital Contact Card (vCard 3.0)
              </Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const payload = [
                      "BEGIN:VCARD",
                      "VERSION:3.0",
                      `N:${vcard.lastName};${vcard.firstName};;;`,
                      `FN:${vcard.firstName} ${vcard.lastName}`.trim(),
                      vcard.org ? `ORG:${vcard.org}` : null,
                      vcard.title ? `TITLE:${vcard.title}` : null,
                      vcard.phone ? `TEL;TYPE=CELL:${vcard.phone}` : null,
                      vcard.workPhone ? `TEL;TYPE=WORK:${vcard.workPhone}` : null,
                      vcard.email ? `EMAIL:${vcard.email}` : null,
                      vcard.url ? `URL:${vcard.url}` : null,
                      vcard.street
                        ? `ADR;TYPE=WORK:;;${vcard.street};${vcard.city || ""};${vcard.state || ""};${vcard.zip || ""};${vcard.country || ""}`
                        : null,
                      vcard.note ? `NOTE:${vcard.note}` : null,
                      "END:VCARD",
                    ]
                      .filter(Boolean)
                      .join("\n");
                    downloadTextFile(
                      payload,
                      `${vcard.firstName || "contact"}_${vcard.lastName || "card"}.vcf`,
                      "text/vcard",
                    );
                    toast.success("Downloaded .vcf file! Double-click to add directly to Contacts.");
                  }}
                  className="text-xs h-7 gap-1 font-semibold"
                >
                  <Download className="size-3 text-cyan-500" />
                  <span>Download .VCF</span>
                </Button>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Fill preset:</span>
              {[
                {
                  name: "Tech Founder",
                  fn: "Elena",
                  ln: "Rostova",
                  org: "Apex Robotics",
                  title: "Founder & CEO",
                  phone: "+1 (415) 555-8921",
                  email: "elena@apexrobotics.ai",
                  url: "https://apexrobotics.ai",
                },
                {
                  name: "Creative Director",
                  fn: "Marcus",
                  ln: "Vance",
                  org: "Studio Prism",
                  title: "Design Partner",
                  phone: "+1 (212) 555-0394",
                  email: "marcus@studioprism.co",
                  url: "https://studioprism.co",
                },
                {
                  name: "Doctor / Clinic",
                  fn: "Dr. Sarah",
                  ln: "Chen",
                  org: "Metro Health Center",
                  title: "Chief of Medicine",
                  phone: "+1 (800) 555-4321",
                  email: "appointments@metrohealth.org",
                  url: "https://metrohealth.org",
                },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setVcard({
                      ...vcard,
                      firstName: p.fn,
                      lastName: p.ln,
                      org: p.org,
                      title: p.title,
                      phone: p.phone,
                      email: p.email,
                      url: p.url,
                    })
                  }
                  className="rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] hover:bg-muted text-foreground font-medium"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vc-fn" className="text-xs">
                  First Name
                </Label>
                <Input
                  id="vc-fn"
                  value={vcard.firstName}
                  onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                  placeholder="Alex"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vc-ln" className="text-xs">
                  Last Name
                </Label>
                <Input
                  id="vc-ln"
                  value={vcard.lastName}
                  onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                  placeholder="Morgan"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vc-org" className="text-xs">
                  Company / Organization
                </Label>
                <Input
                  id="vc-org"
                  value={vcard.org}
                  onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                  placeholder="Innovate Labs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vc-title" className="text-xs">
                  Job Title
                </Label>
                <Input
                  id="vc-title"
                  value={vcard.title}
                  onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                  placeholder="Chief Product Officer"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vc-phone" className="text-xs">
                  Mobile Phone
                </Label>
                <Input
                  id="vc-phone"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vc-email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="vc-email"
                  type="email"
                  value={vcard.email}
                  onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                  placeholder="alex@innovatelabs.io"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vc-url" className="text-xs">
                  Website URL
                </Label>
                <Input
                  id="vc-url"
                  value={vcard.url}
                  onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                  placeholder="https://innovatelabs.io"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vc-city" className="text-xs">
                  City / Location
                </Label>
                <Input
                  id="vc-city"
                  value={vcard.city || ""}
                  onChange={(e) => setVcard({ ...vcard, city: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {/* Live Phone Contact Preview */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 flex items-center gap-3">
              <div className="size-11 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(vcard.firstName[0] || "A") + (vcard.lastName[0] || "M")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-foreground truncate">
                  {vcard.firstName} {vcard.lastName}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {vcard.title} {vcard.org ? `at ${vcard.org}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {vcard.phone && (
                  <a
                    href={`tel:${vcard.phone}`}
                    className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                    title="Test Call"
                  >
                    <Phone className="size-3.5" />
                  </a>
                )}
                {vcard.email && (
                  <a
                    href={`mailto:${vcard.email}`}
                    className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                    title="Test Email"
                  >
                    <Mail className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== WIFI CATEGORY ===================== */}
        {category === "wifi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Wifi className="size-4 text-emerald-500" /> WiFi Network Configuration
              </Label>
              <button
                type="button"
                onClick={() => copyToClipboard(wifi.password, "WiFi Password")}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Copy className="size-3" /> Copy Password
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  placeholder="e.g. CafeGuestWiFi"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Security Type</Label>
                <Select
                  value={wifi.encryption}
                  onValueChange={(val: "WPA" | "WEP" | "nopass") =>
                    setWifi({ ...wifi, encryption: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA / WPA2 / WPA3 (Default)</SelectItem>
                    <SelectItem value="WEP">WEP (Older)</SelectItem>
                    <SelectItem value="nopass">No Password (Open)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {wifi.encryption !== "nopass" && (
              <div className="space-y-1.5">
                <Label htmlFor="wifi-pass">Network Password</Label>
                <div className="relative">
                  <Input
                    id="wifi-pass"
                    type={showWifiPass ? "text" : "password"}
                    value={wifi.password}
                    onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    placeholder="WiFi Password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPass(!showWifiPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showWifiPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Label htmlFor="wifi-hidden" className="cursor-pointer text-xs text-muted-foreground">
                Hidden Network (SSID broadcast disabled)
              </Label>
              <Switch
                id="wifi-hidden"
                checked={wifi.hidden}
                onCheckedChange={(checked) => setWifi({ ...wifi, hidden: checked })}
              />
            </div>

            {/* Test Connection Banner */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-foreground font-medium">
                  When scanned by iOS / Android:
                </span>
                <span className="text-muted-foreground">"Join '{wifi.ssid}' Network"</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast.success(
                    `Simulating connection to "${wifi.ssid}"! Cameras decode this instantaneously.`,
                  );
                }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Test Join Prompt
              </button>
            </div>
          </div>
        )}

        {/* ===================== PLAIN TEXT CATEGORY ===================== */}
        {category === "text" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="raw-content" className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="size-4 text-amber-500" /> Plain Text & Multi-Line Notes
              </Label>
              <span className="font-mono text-xs text-muted-foreground">
                {rawText.length} characters ({rawText.trim().split(/\s+/).filter(Boolean).length} words)
              </span>
            </div>

            <Textarea
              id="raw-content"
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste any text, notes, instructions, discount codes, or custom payload..."
              className="font-mono text-sm resize-y"
            />

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Quick templates:</span>
              {[
                { label: "🎟️ 20% OFF Promo", text: "PROMO CODE: MAGIC20 — Valid for 20% off all orders." },
                { label: "📦 Table Order", text: "Table #14 • Dining Room • Priority Service" },
                { label: "🔐 Secret Note", text: "Access Key: AGY-9482-MAGIC — Authorized Personnel Only" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRawText(p.text)}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs hover:bg-muted text-foreground font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs border border-border/40">
              <span className="text-muted-foreground">
                Optimal scan distance: ~
                {Math.max(1, Math.min(5, Math.round(500 / Math.max(50, rawText.length))))} meters
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(rawText, "Plain Text")}
                className="font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Copy className="size-3" /> Copy Text
              </button>
            </div>
          </div>
        )}

        {/* ===================== EMAIL CATEGORY ===================== */}
        {category === "email" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Mail className="size-4 text-blue-500" /> Pre-filled Email (mailto:)
              </Label>
              <a
                href={`mailto:${email.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="size-3" /> Test Send (Mail App)
              </a>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="em-to" className="text-xs">
                Recipient Email
              </Label>
              <Input
                id="em-to"
                type="email"
                value={email.email}
                onChange={(e) => setEmail({ ...email, email: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="em-sub" className="text-xs">
                Subject Line
              </Label>
              <Input
                id="em-sub"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                placeholder="Inquiry regarding services"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="em-body" className="text-xs">
                Body Message
              </Label>
              <Textarea
                id="em-body"
                rows={3}
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                placeholder="Write your email body here..."
              />
            </div>
          </div>
        )}

        {/* ===================== PHONE CATEGORY ===================== */}
        {category === "phone" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ph-num" className="text-sm font-semibold flex items-center gap-1.5">
                <Phone className="size-4 text-emerald-500" /> Phone Call (tel:)
              </Label>
              <a
                href={`tel:${phone.phone}`}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Phone className="size-3" /> Test Call Prompt
              </a>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph-num" className="text-xs text-muted-foreground">
                Phone Number with Country Code
              </Label>
              <Input
                id="ph-num"
                type="tel"
                value={phone.phone}
                onChange={(e) => setPhone({ phone: e.target.value })}
                placeholder="+1 (800) 555-0199"
                className="text-base font-mono"
              />
            </div>
          </div>
        )}

        {/* ===================== SMS CATEGORY ===================== */}
        {category === "sms" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <MessageSquare className="size-4 text-indigo-500" /> Instant SMS Message
            </Label>
            <div className="space-y-1.5">
              <Label htmlFor="sms-phone" className="text-xs">
                Phone Number
              </Label>
              <Input
                id="sms-phone"
                type="tel"
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="+1 (555) 987-6543"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms-msg" className="text-xs">
                Prefilled Text Message
              </Label>
              <Textarea
                id="sms-msg"
                rows={2}
                value={sms.message}
                onChange={(e) => setSms({ ...sms, message: e.target.value })}
                placeholder="Hello! Checking in on..."
              />
            </div>
          </div>
        )}

        {/* ===================== WHATSAPP CATEGORY ===================== */}
        {category === "whatsapp" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <MessageCircle className="size-4 text-emerald-500" /> WhatsApp Direct Chat
              </Label>
              <a
                href={`https://wa.me/${(whatsapp.countryCode + whatsapp.phone).replace(/\D/g, "")}?text=${encodeURIComponent(whatsapp.message)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="size-3" /> Test WhatsApp Chat
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="wa-code" className="text-xs">
                  Country Code
                </Label>
                <Input
                  id="wa-code"
                  value={whatsapp.countryCode}
                  onChange={(e) => setWhatsapp({ ...whatsapp, countryCode: e.target.value })}
                  placeholder="1 (US), 44 (UK), 91 (IN)"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="wa-phone" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="wa-phone"
                  value={whatsapp.phone}
                  onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                  placeholder="5551234567"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-msg" className="text-xs">
                Pre-filled Chat Message
              </Label>
              <Textarea
                id="wa-msg"
                rows={2}
                value={whatsapp.message}
                onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                placeholder="Hi! I scanned your QR code and would like to connect."
              />
            </div>
          </div>
        )}

        {/* ===================== LOCATION / MAP CATEGORY ===================== */}
        {category === "location" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="size-4 text-rose-500" /> Location / Google Maps Navigation
              </Label>
              <a
                href={
                  location.latitude && location.longitude
                    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
                    : `https://maps.google.com/?q=${encodeURIComponent(location.address)}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="size-3" /> Open in Maps
              </a>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-address" className="text-xs">
                Physical Address or Place Name
              </Label>
              <Input
                id="loc-address"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                placeholder="e.g. 350 5th Ave, New York, NY 10118"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="loc-lat" className="text-xs">
                  Latitude (Optional)
                </Label>
                <Input
                  id="loc-lat"
                  value={location.latitude}
                  onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                  placeholder="40.7580"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc-lng" className="text-xs">
                  Longitude (Optional)
                </Label>
                <Input
                  id="loc-lng"
                  value={location.longitude}
                  onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                  placeholder="-73.9855"
                />
              </div>
            </div>

            {/* Location Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <span className="font-medium text-foreground">Famous landmarks:</span>
              {[
                { name: "Times Square, NYC", addr: "Times Square, New York, NY 10036", lat: "40.7580", lng: "-73.9855" },
                { name: "Eiffel Tower, Paris", addr: "Champ de Mars, 5 Av. Anatole France, 75007 Paris", lat: "48.8584", lng: "2.2945" },
                { name: "Tokyo Tower", addr: "4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011", lat: "35.6586", lng: "139.7454" },
              ].map((l) => (
                <button
                  key={l.name}
                  type="button"
                  onClick={() =>
                    setLocation({
                      address: l.addr,
                      latitude: l.lat,
                      longitude: l.lng,
                      label: l.name,
                    })
                  }
                  className="rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] hover:bg-muted text-foreground font-medium"
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================== CALENDAR EVENT CATEGORY ===================== */}
        {category === "event" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="size-4 text-violet-500" /> Calendar Event (iCal)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const formatIcsDate = (dateStr: string) => {
                    if (!dateStr) return "";
                    return dateStr.replace(/[-:]/g, "").replace("T", "T") + "00Z";
                  };
                  const payload = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "PRODID:-//QR Studio Pro//EN",
                    "BEGIN:VEVENT",
                    `SUMMARY:${calendar.title}`,
                    calendar.location ? `LOCATION:${calendar.location}` : null,
                    calendar.description ? `DESCRIPTION:${calendar.description}` : null,
                    calendar.startDate ? `DTSTART:${formatIcsDate(calendar.startDate)}` : null,
                    calendar.endDate ? `DTEND:${formatIcsDate(calendar.endDate)}` : null,
                    "END:VEVENT",
                    "END:VCALENDAR",
                  ]
                    .filter(Boolean)
                    .join("\n");
                  downloadTextFile(payload, `${calendar.title.replace(/\s+/g, "_") || "event"}.ics`, "text/calendar");
                  toast.success("Downloaded .ics event file! Double-click to add to Google/Apple Calendar.");
                }}
                className="text-xs h-7 gap-1 font-semibold"
              >
                <Download className="size-3 text-violet-500" /> Download .ICS
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-title" className="text-xs">
                Event Title
              </Label>
              <Input
                id="cal-title"
                value={calendar.title}
                onChange={(e) => setCalendar({ ...calendar, title: e.target.value })}
                placeholder="Product Launch 2026"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-loc" className="text-xs">
                Event Location / Meeting Link
              </Label>
              <Input
                id="cal-loc"
                value={calendar.location}
                onChange={(e) => setCalendar({ ...calendar, location: e.target.value })}
                placeholder="Main Auditorium or https://meet.google.com/xyz"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cal-start" className="text-xs">
                  Start Date & Time
                </Label>
                <Input
                  id="cal-start"
                  type="datetime-local"
                  value={calendar.startDate}
                  onChange={(e) => setCalendar({ ...calendar, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cal-end" className="text-xs">
                  End Date & Time
                </Label>
                <Input
                  id="cal-end"
                  type="datetime-local"
                  value={calendar.endDate}
                  onChange={(e) => setCalendar({ ...calendar, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-desc" className="text-xs">
                Description / Agenda
              </Label>
              <Textarea
                id="cal-desc"
                rows={2}
                value={calendar.description}
                onChange={(e) => setCalendar({ ...calendar, description: e.target.value })}
                placeholder="Keynote presentations and workshops..."
              />
            </div>
          </div>
        )}

        {/* ===================== UPI PAYMENTS CATEGORY ===================== */}
        {category === "upi" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <CreditCard className="size-4 text-emerald-500" /> UPI Instant Payment
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upi-vpa" className="text-xs">
                  UPI ID (VPA)
                </Label>
                <Input
                  id="upi-vpa"
                  value={upi.vpa}
                  onChange={(e) => setUpi({ ...upi, vpa: e.target.value })}
                  placeholder="e.g. merchant@okhdfcbank"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upi-name" className="text-xs">
                  Payee Name
                </Label>
                <Input
                  id="upi-name"
                  value={upi.payeeName}
                  onChange={(e) => setUpi({ ...upi, payeeName: e.target.value })}
                  placeholder="e.g. Artisan Cafe"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upi-amt" className="text-xs">
                  Amount (Optional)
                </Label>
                <Input
                  id="upi-amt"
                  value={upi.amount}
                  onChange={(e) => setUpi({ ...upi, amount: e.target.value })}
                  placeholder="e.g. 150.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upi-note" className="text-xs">
                  Payment Note
                </Label>
                <Input
                  id="upi-note"
                  value={upi.note}
                  onChange={(e) => setUpi({ ...upi, note: e.target.value })}
                  placeholder="e.g. Order #4892"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== CRYPTO CATEGORY ===================== */}
        {category === "crypto" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Coins className="size-4 text-amber-500" /> Cryptocurrency Wallet Transfer
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cryptocurrency</Label>
                <Select
                  value={crypto.coin}
                  onValueChange={(val: "bitcoin" | "ethereum" | "solana") =>
                    setCrypto({ ...crypto, coin: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    <SelectItem value="solana">Solana (SOL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cry-addr" className="text-xs">
                  Wallet Address
                </Label>
                <Input
                  id="cry-addr"
                  value={crypto.address}
                  onChange={(e) => setCrypto({ ...crypto, address: e.target.value })}
                  placeholder="0x... or bc1..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== SOCIAL CATEGORY ===================== */}
        {category === "social" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Share2 className="size-4 text-pink-500" /> Social Media Profile
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Platform</Label>
                <Select
                  value={social.platform}
                  onValueChange={(val: SocialData["platform"]) =>
                    setSocial({ ...social, platform: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">X / Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="soc-handle" className="text-xs">
                  Username / Handle
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    id="soc-handle"
                    value={social.username}
                    onChange={(e) => setSocial({ ...social, username: e.target.value })}
                    placeholder="username"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
