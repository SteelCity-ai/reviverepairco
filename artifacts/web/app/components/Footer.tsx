import Image from "next/image";

const serviceAreas = ["Harrisburg", "Mechanicsburg", "Hershey", "Camp Hill", "Carlisle", "Lancaster"];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-primary)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white/8 p-2">
              <Image src="/images/logo-color-primary.png" alt="Revive Roof Repair logo" fill className="object-contain p-2" />
            </div>
            <div>
              <p className="text-lg font-bold">Revive Roof Repair</p>
              <p className="text-sm text-white/65">Roof repair & replacement in Central Pennsylvania</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/68">
            Premium local roofing with strong communication, emergency responsiveness, and a clear path to a free inspection.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)]">Contact</h3>
          <div className="mt-5 space-y-3 text-sm text-white/74">
            <p><a href="tel:+17175001434" className="transition hover:text-white">(717) 500-1434</a></p>
            <p>Serving Harrisburg and surrounding Central PA communities</p>
            <p>Licensed & insured roofing contractor</p>
            <p>Fast estimate requests and emergency response availability</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)]">Service areas</h3>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/74">
            {serviceAreas.map((area) => (
              <p key={area}>{area}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-white/52 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Revive Roof Repair. All rights reserved.</p>
          <p>Phase 2 homepage redesign foundation for reviveroofrepair.com</p>
        </div>
      </div>
    </footer>
  );
}
