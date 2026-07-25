import { useState } from "react";
import StatusBadge from "./StatusBadge";

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-0.5 font-semibold text-white">{value}</p>
    </div>
  );
}

function Thumb({ label, file, onOpen }) {
  if (!file?.url) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(file.url)}
      className="group text-left"
    >
      <p className="mb-1 text-xs uppercase tracking-widest text-white/40">{label}</p>
      <img
        src={file.url}
        alt={label}
        className="h-20 w-20 rounded-lg border border-white/10 object-cover transition group-hover:border-gold sm:h-28 sm:w-28"
      />
    </button>
  );
}

async function shareTicket(ticketUrl, caption) {
  try {
    const res = await fetch(ticketUrl);
    const blob = await res.blob();
    const file = new File([blob], "sss-2026-ticket.png", { type: blob.type || "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Sagar Super Series 2026", text: caption });
      return;
    }
  } catch {
    // fall through to opening the image directly
  }
  window.open(ticketUrl, "_blank");
}

export default function ReviewModal({
  registration,
  onClose,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
}) {
  const [lightbox, setLightbox] = useState(null);
  const [sharing, setSharing] = useState(false);
  if (!registration) return null;
  const r = registration;
  const isTeam = r.type === "team";

  async function handleShare() {
    setSharing(true);
    const name = isTeam ? r.teamName : r.fullName;
    await shareTicket(r.ticket.url, `${name} — Approved! Token ${r.tokenNumber} — Sagar Super Series 2026`);
    setSharing(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold/30 bg-charcoal p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-gold-light sm:text-xl">
              {isTeam ? r.teamName : r.fullName}
            </h2>
            <p className="text-xs text-white/40">
              Token: <span className="font-bold text-gold-light">{r.tokenNumber}</span> &middot;{" "}
              {r.registrationId}
            </p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-2xl text-white/50 hover:text-white">
            &times;
          </button>
        </div>

        <div className="mt-4">
          <StatusBadge status={r.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isTeam ? (
            <>
              <Field label="Team Name" value={r.teamName} />
              <Field label="Owner Name" value={r.ownerName} />
            </>
          ) : (
            <>
              <Field label="Full Name" value={r.fullName} />
              <Field label="Date of Birth" value={r.dob ? new Date(r.dob).toLocaleDateString("en-IN") : null} />
              <Field label="Player Role" value={r.role} />
              <Field label="Batting Style" value={r.battingStyle} />
              <Field label="Bowling Style" value={r.bowlingStyle} />
              <Field label="Preferred Batting Order" value={r.battingOrder} />
            </>
          )}
          <Field label="Phone" value={r.phone} />
          <Field label="WhatsApp" value={r.whatsapp} />
          <Field label="Email" value={r.email} />
          <Field label="City" value={r.city} />
          <Field label="Address" value={r.address} />
          <Field label="Type" value={r.type} />
          <Field label="Amount" value={`₹${r.amount?.toLocaleString("en-IN")}`} />
          <Field
            label="Registered On"
            value={r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : null}
          />
        </div>

        <div className="mt-6 rounded-xl border border-gold/30 bg-ink/60 p-4">
          <p className="text-xs uppercase tracking-widest text-white/40">UTR / Transaction Ref</p>
          <p className="mt-1 text-lg font-black tracking-wider text-gold-light">{r.utr}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 sm:gap-6">
          {!isTeam && <Thumb label="Profile Photo" file={r.profilePhoto} onOpen={setLightbox} />}
          {!isTeam && <Thumb label="Aadhaar Photo" file={r.aadhaarPhoto} onOpen={setLightbox} />}
          {isTeam && <Thumb label="Team Logo" file={r.teamLogo} onOpen={setLightbox} />}
          {isTeam && <Thumb label="Owner Aadhaar" file={r.ownerAadhaar} onOpen={setLightbox} />}
          <Thumb label="Payment Screenshot" file={r.paymentScreenshot} onOpen={setLightbox} />
        </div>

        {r.status === "approved" && r.ticket?.url && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-400">Ticket generated</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setLightbox(r.ticket.url)}>
                <img
                  src={r.ticket.url}
                  alt="Generated ticket"
                  className="h-28 w-24 rounded-lg border border-white/10 object-cover object-top"
                />
              </button>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <a
                  href={r.ticket.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-bold hover:border-gold hover:text-gold"
                >
                  Download Ticket
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
                >
                  {sharing ? "Preparing..." : "Share to WhatsApp Group"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            disabled={actionLoading || r.status === "approved"}
            onClick={() => onApprove(r._id)}
            className="flex-1 rounded-full bg-emerald-500 py-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-40"
          >
            Approve
          </button>
          {r.status === "rejected" ? (
            <button
              disabled={actionLoading}
              onClick={() => onDelete(r._id)}
              className="flex-1 rounded-full border-2 border-crimson py-3 font-bold text-crimson-light transition hover:bg-crimson/10 disabled:opacity-40"
            >
              Delete Entry
            </button>
          ) : (
            <button
              disabled={actionLoading}
              onClick={() => onReject(r._id)}
              className="flex-1 rounded-full bg-crimson py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-40"
            >
              Reject
            </button>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Full preview" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
