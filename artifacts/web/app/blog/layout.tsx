import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Revive Roof Repair Blog — Central PA Roofing Guides",
  description:
    "Expert roofing tips, storm damage guides, and Pennsylvania homeowner advice from Revive Roof Repair.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      {/* Minimal blog header */}
      <div className="border-b border-gray-100 bg-white sticky top-[76px] z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a202c] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Revive Roof Repair
            </Link>
            <Link
              href="/#contact-form"
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Get a Free Quote →
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
