import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import posterImg from "../assets/POSTER.jpeg";
import { TOURNAMENT, CONTACT, SOCIALS, FEES } from "../data/tournament";

const REG_CARDS = [
  {
    type: "junior",
    title: "Junior Player",
    desc: "Open to junior-age players. Showcase your talent at the auction.",
    icon: "🏏",
  },
  {
    type: "senior",
    title: "Senior Player",
    desc: "Open to senior players ready to be picked in the grand auction.",
    icon: "🔥",
  },
  {
    type: "team",
    title: "Team Entry",
    desc: "Register your franchise for the 16-team auction battle.",
    icon: "🏆",
  },
];

const INFO_ITEMS = [
  { label: "Format", value: `${TOURNAMENT.teams} Teams` },
  { label: "Ball Type", value: "Rubber Ball" },
  { label: "Tournament Type", value: "Auction Based" },
  { label: "Month", value: TOURNAMENT.month },
  { label: "Location", value: TOURNAMENT.location },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gold/20 px-4 py-14 text-center sm:px-6 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson-light sm:text-sm sm:tracking-[0.3em]">
            {TOURNAMENT.type}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-gradient-gold sm:text-5xl lg:text-6xl">
            {TOURNAMENT.name}
          </h1>
          <p className="mt-4 text-lg font-medium text-gold-light sm:text-2xl">{TOURNAMENT.tagline}</p>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
            <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-4 shadow-xl shadow-black/40 sm:p-5">
              <p className="text-[10px] uppercase tracking-widest text-white/50 sm:text-xs">
                First Prize
              </p>
              <p className="mt-1 text-xl font-black text-gradient-gold sm:text-3xl">
                {TOURNAMENT.firstPrize}
              </p>
            </div>
            <div className="rounded-2xl border border-crimson/40 bg-charcoal/80 p-4 shadow-xl shadow-black/40 sm:p-5">
              <p className="text-[10px] uppercase tracking-widest text-white/50 sm:text-xs">
                Second Prize
              </p>
              <p className="mt-1 text-xl font-black text-crimson-light sm:text-3xl">
                {TOURNAMENT.secondPrize}
              </p>
            </div>
          </div>

          <a
            href="#register"
            className="mt-8 inline-block w-full rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-base font-bold text-ink shadow-lg shadow-gold/30 transition hover:brightness-110 sm:mt-10 sm:w-auto sm:text-lg"
          >
            Register Now
          </a>
        </div>
      </section>

      {/* Official poster */}
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-lg">
          <img
            src={posterImg}
            alt="Sagar Super Series 2026 official tournament poster"
            className="w-full rounded-2xl border border-gold/30 shadow-xl shadow-black/40"
            loading="lazy"
          />
        </div>
      </section>

      {/* Registration cards */}
      <section id="register" className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-black text-gradient-gold sm:text-4xl">
            Choose Your Registration
          </h2>
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3 sm:gap-6">
            {REG_CARDS.map((card) => (
              <div
                key={card.type}
                className="flex flex-col rounded-2xl border border-gold/20 bg-charcoal p-6 text-center shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-gold/50"
              >
                <span className="text-4xl">{card.icon}</span>
                <h3 className="mt-4 text-xl font-bold text-gold-light">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm text-white/60">{card.desc}</p>
                <p className="mt-4 text-3xl font-black text-white">
                  ₹{FEES[card.type].amount.toLocaleString("en-IN")}
                </p>
                <Link
                  to={`/register?type=${card.type}`}
                  className="mt-6 rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-3 font-bold text-ink transition hover:brightness-110"
                >
                  Register Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament info */}
      <section className="border-y border-gold/20 bg-charcoal/60 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-black text-gradient-gold sm:text-4xl">
            Tournament Info
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-5 sm:gap-4">
            {INFO_ITEMS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gold/20 bg-ink p-3 text-center sm:p-4"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 sm:text-xs">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-bold text-gold-light sm:text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + streaming */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 sm:gap-8">
          <div className="rounded-2xl border border-gold/20 bg-charcoal p-6 text-center sm:p-8">
            <h3 className="text-xl font-bold text-gold-light sm:text-2xl">Contact Organizer</h3>
            <p className="mt-3 text-lg font-semibold">{CONTACT.name}</p>
            <a
              href={`tel:+91${CONTACT.phone}`}
              className="mt-1 block text-2xl font-black text-gradient-gold"
            >
              {CONTACT.phone}
            </a>
          </div>
          <div className="rounded-2xl border border-crimson/30 bg-charcoal p-6 text-center sm:p-8">
            <h3 className="text-xl font-bold text-crimson-light sm:text-2xl">Live Streaming</h3>
            <p className="mt-3 text-lg font-semibold">{SOCIALS.brand}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-semibold sm:gap-4">
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-3 py-2 hover:border-gold hover:text-gold sm:px-4"
              >
                YouTube
              </a>
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-3 py-2 hover:border-gold hover:text-gold sm:px-4"
              >
                Facebook
              </a>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-3 py-2 hover:border-gold hover:text-gold sm:px-4"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
