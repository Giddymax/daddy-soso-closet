import { Phone, Mail, MapPin } from "lucide-react";

interface ContactSectionProps {
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
}

export default function ContactSection({
  phone = "0594299293",
  email = "zmdsosobadoo@gmail.com",
  mapEmbedUrl,
}: ContactSectionProps) {
  return (
    <section id="contact" className="bg-[#023E8A] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-widest mb-2">
            Get In Touch
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            Visit Us Today
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Phone */}
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-colors">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={20} className="text-[#023E8A]" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <a href={`tel:${phone}`} className="text-[#D4AF37] hover:underline text-lg font-bold">
              {phone}
            </a>
          </div>

          {/* Email */}
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-colors">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={20} className="text-[#023E8A]" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <a href={`mailto:${email}`} className="text-[#D4AF37] hover:underline text-sm">
              {email}
            </a>
          </div>

          {/* Locations */}
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-colors">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={20} className="text-[#023E8A]" />
            </div>
            <h3 className="font-semibold mb-2">Find Us</h3>
            <p className="text-white/70 text-sm">
              Tweapease &amp; Abaam,
              <br />
              Kwaebibirim Municipal, Eastern Region, Ghana
            </p>
          </div>
        </div>

        {/* Map */}
        {mapEmbedUrl && (
          <div className="rounded-2xl overflow-hidden h-64 border border-white/10">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Daddy SoSo Closet Location"
            />
          </div>
        )}
      </div>
    </section>
  );
}
