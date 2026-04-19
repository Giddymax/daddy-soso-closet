import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

interface FooterProps {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  phone?: string;
  email?: string;
  tagline?: string;
  theme?: "default" | "pink" | "emerald";
  showSalonLink?: boolean;
}

export default function Footer({
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  phone = "0594299293",
  email = "daddysosocloset@gmail.com",
  tagline = "Fashion. Style. Elegance. Your premier boutique destination in Eastern Region, Ghana.",
  theme = "default",
  showSalonLink = true,
}: FooterProps) {
  const bg          = theme === "pink" ? "bg-[#500724]" : theme === "emerald" ? "bg-[#022c22]" : "bg-[#1C1208]";
  const accent      = theme === "pink" ? "text-[#EC4899]" : theme === "emerald" ? "text-[#10B981]" : "text-[#C4954A]";
  const accentBg    = theme === "pink" ? "hover:bg-[#EC4899]" : theme === "emerald" ? "hover:bg-[#10B981]" : "hover:bg-[#C4954A]";
  const hoverAccent = theme === "pink" ? "hover:text-[#EC4899]" : theme === "emerald" ? "hover:text-[#10B981]" : "hover:text-[#C4954A]";

  return (
    <footer className={`${bg} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className={`font-playfair text-2xl font-bold ${accent} mb-3`}>
              Daddy SoSo Closet
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{tagline}</p>
            <div className="flex gap-3 mt-4">
              <a href={instagramUrl || "#"} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center ${accentBg} transition-colors`}>
                <Instagram size={16} />
              </a>
              <a href={facebookUrl || "#"} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center ${accentBg} transition-colors`}>
                <Facebook size={16} />
              </a>
              {tiktokUrl && (
                <a href={tiktokUrl} aria-label="TikTok" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center ${accentBg} transition-colors`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                  </svg>
                </a>
              )}
              <a href={`https://wa.me/233${phone.replace(/^0/, "")}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold ${accent} mb-3`}>Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/tweapease" className={`${hoverAccent} transition-colors`}>Tweapease Branch</Link></li>
              <li><Link href="/abaam" className={`${hoverAccent} transition-colors`}>Abaam Branch</Link></li>
              {showSalonLink && <li><Link href="/salon" className={`${hoverAccent} transition-colors`}>Salon</Link></li>}
              <li><Link href="/#products" className={`${hoverAccent} transition-colors`}>Our Products</Link></li>
              <li><Link href="/#contact" className={`${hoverAccent} transition-colors`}>Contact Us</Link></li>
              <li><Link href="/auth/login" className={`${hoverAccent} transition-colors`}>Staff Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-semibold ${accent} mb-3`}>Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone size={14} className={`${accent} shrink-0`} />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className={`${accent} shrink-0`} />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors text-xs">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className={`${accent} shrink-0 mt-0.5`} />
                <span>Tweapease &amp; Abaam, Kwaebibirim Municipal, Eastern Region, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} Daddy SoSo Closet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
