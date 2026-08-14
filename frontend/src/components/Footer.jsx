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
        {(SOCIALS.youtube || SOCIALS.facebook || SOCIALS.instagram) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-white/60 sm:gap-x-4">
            {SOCIALS.youtube && (
              <a href={SOCIALS.youtube} target="_blank" rel="noreferrer" className="hover:text-gold">
                YouTube
              </a>
            )}
            {SOCIALS.facebook && (
              <a href={SOCIALS.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook
              </a>
            )}
            {SOCIALS.instagram && (
              <a href={SOCIALS.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                Instagram
              </a>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-white/50">
          यह वेबसाइट Aamil Works द्वारा बनाई गई है। यदि आप भी वेबसाइट बनवाना चाहते हैं तो संपर्क करें:{" "}
          <a href="tel:+919516081609" className="text-gold hover:underline font-semibold">
            9516081609
          </a>
        </p>
        <p className="mt-4 text-xs text-white/30">
          © {new Date().getFullYear()} {TOURNAMENT.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
