import { useLocation, Link, Navigate } from "react-router-dom";
import { TOURNAMENT, SOCIALS } from "../data/tournament";

export default function Success() {
  const location = useLocation();
  const tokenNumber = location.state?.tokenNumber;

  if (!tokenNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-white">
      <div className="w-full max-w-lg rounded-2xl border border-gold/30 bg-charcoal p-6 shadow-xl shadow-black/40 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-3xl sm:h-16 sm:w-16 sm:text-4xl">
          ✅
        </div>
        <h1 className="mt-6 text-xl font-black text-gradient-gold sm:text-3xl">
          Your application has been submitted!
        </h1>
        <p className="mt-4 text-sm text-white/50">Your Token Number is</p>
        <p className="mt-1 break-words text-3xl font-black tracking-wider text-gold-light sm:text-4xl">
          {tokenNumber}
        </p>
        <p className="mt-6 text-sm text-white/70">
          Please wait 24–48 hours for your ticket confirmation. You will be contacted on your
          registered phone number once approved.
        </p>
        <p className="mt-2 text-xs text-white/40">{TOURNAMENT.name}</p>

        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-400">
            Join our WhatsApp group for tournament updates
          </p>
          <a
            href={SOCIALS.whatsappGroup}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block w-full rounded-full bg-emerald-500 px-6 py-3 font-bold text-ink transition hover:brightness-110 sm:w-auto"
          >
            Join WhatsApp Group
          </a>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block w-full rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3 font-bold text-ink transition hover:brightness-110 sm:w-auto"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
