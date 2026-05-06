"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to a backend or service like Roofr
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-gray-600">
          We&apos;ve received your request and will contact you within 2 hours.
        </p>
        <p className="text-[#e63946] font-semibold mt-4">
          Need immediate assistance? Call:{" "}
          <a href="tel:+17175001434" className="underline">
            (717) 500-1434
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6 lg:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Get Your Free Estimate
      </h3>
      <p className="text-gray-600 mb-6">
        Fill out the form below and we&apos;ll get back to you within 2 hours.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all"
            placeholder="(717) 555-1234"
          />
        </div>

        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Service Type
          </label>
          <select
            id="serviceType"
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="">Select a service...</option>
            <option value="emergency">Emergency Repair</option>
            <option value="leak">Roof Leak</option>
            <option value="storm">Storm Damage</option>
            <option value="replacement">Roof Replacement</option>
            <option value="inspection">Roof Inspection</option>
            <option value="commercial">Commercial Roofing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tell us about your project
          </label>
          <textarea
            id="message"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all resize-none"
            placeholder="Briefly describe what's going on with your roof..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#e63946] hover:bg-[#c5303c] text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          GET MY FREE ESTIMATE
        </button>

        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Your information is secure and never shared.
        </p>
      </div>
    </form>
  );
}
