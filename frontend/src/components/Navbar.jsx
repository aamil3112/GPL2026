import { Link } from "react-router-dom";
import { TOURNAMENT } from "../data/tournament";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="min-w-0 flex-1">
          <span className="block truncate text-base font-black tracking-tight text-gradient-gold sm:text-2xl">
            {TOURNAMENT.name}
          </span>
        </Link>
        <a
          href="/#register"
          className="flex-shrink-0 rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-2 text-xs font-bold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110 sm:px-5 sm:text-sm"
        >
          Register
        </a>
      </div>
    </header>
  );
}
