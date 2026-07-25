import { TOURNAMENT, CONTACT, SOCIALS } from "../data/tournament";

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-charcoal">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-10">
        <p className="text-xl font-black text-gradient-gold sm:text-2xl">{TOURNAMENT.slogan}</p>
        <p className="mt-3 text-sm text-white/60">
          {TOURNAMENT.name} &middot; {TOURNAMENT.location} &middot; {TOURNAMENT.month}
        </p>
        <p className="mt-2 text-sm text-white/60">
          Organizer: {CONTACT.name} &middot;{" "}
          <a href={`tel:+91${CONTACT.phone}`} className="text-gold hover:underline">
            {CONTACT.phone}
          </a>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-white/60 sm:gap-x-4">
          <a href={SOCIALS.youtube} target="_blank" rel="noreferrer" className="hover:text-gold">
            YouTube
          </a>
          <span className="text-white/20">|</span>
          <a href={SOCIALS.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">
            Facebook
          </a>
          <span className="text-white/20">|</span>
          <a href={SOCIALS.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
            Instagram
          </a>
        </div>
        <p className="mt-6 text-xs text-white/30">
          © {new Date().getFullYear()} {TOURNAMENT.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
