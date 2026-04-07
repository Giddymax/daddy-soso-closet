"use client";
import { useState, FormEvent } from "react";

interface Service {
  name: string;
  priceDisplay: string;
}

interface BookingFormProps {
  services: Service[];
  phone: string;
  whatsappNumber: string; // e.g. "233594299293"
}

const timeSlots = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
];

export default function BookingForm({ services, phone, whatsappNumber }: BookingFormProps) {
  const [name, setName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      `*New Appointment Request — Daddy SoSo Closet Salon*`,
      ``,
      `*Name:* ${name}`,
      `*Phone:* ${clientPhone}`,
      `*Service:* ${service}`,
      `*Date:* ${date}`,
      `*Time:* ${time}`,
      notes ? `*Notes:* ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Abena Mensah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder={`e.g. ${phone}`}
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">
          Service <span className="text-red-500">*</span>
        </label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition bg-white"
          required
        >
          <option value="" disabled>Select a service…</option>
          {services.map((sv) => (
            <option key={sv.name} value={sv.name}>
              {sv.name} — {sv.priceDisplay}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition bg-white"
            required
          >
            <option value="" disabled>Pick a time…</option>
            {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#023E8A] mb-1.5">Additional Notes</label>
        <textarea
          rows={3}
          placeholder="Any special requests or details about your hair…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-[#023E8A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0077B6] transition-colors duration-300 shadow-lg"
        >
          Confirm via WhatsApp
        </button>
        <p className="text-center text-gray-400 text-xs mt-3">
          Or call us at{" "}
          <a href={`tel:${phone}`} className="text-[#0077B6] font-semibold hover:underline">{phone}</a>
          {" "}or{" "}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#25D366] font-semibold hover:underline"
          >
            WhatsApp us
          </a>
        </p>
      </div>
    </form>
  );
}
