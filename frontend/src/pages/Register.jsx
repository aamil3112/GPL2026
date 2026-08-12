import { useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FileInput from "../components/FileInput";
import CopyableValue from "../components/CopyableValue";
import api from "../api/client";
import {
  FEES,
  PAYMENT_DETAILS,
  PLAYER_ROLES,
  BATTING_STYLES,
  BOWLING_STYLES,
  BATTING_ORDER_OPTIONS,
  CONTACT,
} from "../data/tournament";

const TYPES = ["player", "team"];
const PHONE_REGEX = /^[6-9]\d{9}$/;
const UTR_REGEX = /^\d{6,12}$/;

const UTR_HELP_APPS = [
  { name: "PhonePe", image: "/utr-help-phonepe.png" },
  { name: "Google Pay", image: "/utr-help-googlepay.png" },
  { name: "Paytm", image: "/utr-help-paytm.png" },
];

const TEAM_FIELD_ORDER = [
  "teamName",
  "ownerName",
  "ownerPhone",
  "whatsapp",
  "city",
  "address",
  "ownerAadhaar",
];
const INDIVIDUAL_FIELD_ORDER = [
  "fullName",
  "dob",
  "phone",
  "whatsapp",
  "city",
  "address",
  "role",
  "battingStyle",
  "bowlingStyle",
  "battingOrder",
  "profilePhoto",
  "aadhaarPhoto",
];
const STEP2_FIELD_ORDER = ["utr", "paymentScreenshot", "agreedToTerms"];

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawType = searchParams.get("type");
  const type = TYPES.includes(rawType) ? rawType : "player";
  const isTeam = type === "team";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  const fieldRefs = useRef({});
  const setFieldRef = (key) => (el) => {
    fieldRefs.current[key] = el;
  };

  const [fields, setFields] = useState({
    fullName: "",
    dob: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    address: "",
    role: "",
    battingStyle: "",
    bowlingStyle: "",
    battingOrder: "",
    teamName: "",
    ownerName: "",
    ownerPhone: "",
    ownerWhatsapp: "",
    ownerEmail: "",
    utr: "",
    agreedToTerms: false,
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarPhoto: null,
    teamLogo: null,
    ownerAadhaar: null,
    paymentScreenshot: null,
  });

  const primaryPhone = isTeam ? fields.ownerPhone : fields.phone;
  const effectiveWhatsapp = whatsappSame ? primaryPhone : isTeam ? fields.ownerWhatsapp : fields.whatsapp;

  function setType(newType) {
    setSearchParams({ type: newType });
    setStep(1);
    setErrors({});
  }

  function updateField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function updateFile(key, file) {
    setFiles((f) => ({ ...f, [key]: file }));
  }

  function scrollToFirstError(errs, order) {
    const firstKey = order.find((k) => errs[k]);
    const node = firstKey && fieldRefs.current[firstKey];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = node.querySelector?.("input, select, textarea") || node;
      focusable.focus?.({ preventScroll: true });
    }
  }

  function validateStep1() {
    const errs = {};
    if (!fields.city.trim()) errs.city = "City is required";
    if (!fields.address.trim()) errs.address = "Address is required";

    if (!PHONE_REGEX.test(effectiveWhatsapp || "")) {
      errs.whatsapp = "Enter a valid 10-digit WhatsApp number";
    }

    if (isTeam) {
      if (!fields.teamName.trim()) errs.teamName = "Team name is required";
      if (!fields.ownerName.trim()) errs.ownerName = "Owner name is required";
      if (!PHONE_REGEX.test(fields.ownerPhone)) errs.ownerPhone = "Enter a valid 10-digit phone number";
      if (!files.ownerAadhaar) errs.ownerAadhaar = "Owner Aadhaar photo is required";
    } else {
      if (!fields.fullName.trim()) errs.fullName = "Full name is required";
      if (!fields.dob) errs.dob = "Date of birth is required";
      if (!PHONE_REGEX.test(fields.phone)) errs.phone = "Enter a valid 10-digit phone number";
      if (!fields.role) errs.role = "Select a player role";
      if (!fields.battingStyle) errs.battingStyle = "Select a batting style";
      if (!fields.bowlingStyle) errs.bowlingStyle = "Select a bowling style";
      if (!fields.battingOrder) errs.battingOrder = "Select preferred batting order";
      if (!files.profilePhoto) errs.profilePhoto = "Profile photo is required";
      if (!files.aadhaarPhoto) errs.aadhaarPhoto = "Aadhaar photo is required";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs, isTeam ? TEAM_FIELD_ORDER : INDIVIDUAL_FIELD_ORDER);
    }
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = {};
    if (!UTR_REGEX.test(fields.utr)) errs.utr = "UTR must be 6-12 digits";
    if (!files.paymentScreenshot) errs.paymentScreenshot = "Payment screenshot is required";
    if (!fields.agreedToTerms) errs.agreedToTerms = "You must agree to the terms";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs, STEP2_FIELD_ORDER);
    }
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep2()) return;

    setSubmitting(true);
    setServerError("");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("city", fields.city);
    formData.append("address", fields.address);
    formData.append("utr", fields.utr);
    formData.append("agreedToTerms", fields.agreedToTerms);

    if (isTeam) {
      formData.append("teamName", fields.teamName);
      formData.append("ownerName", fields.ownerName);
      formData.append("ownerPhone", fields.ownerPhone);
      formData.append("ownerWhatsapp", effectiveWhatsapp);
      formData.append("ownerEmail", fields.ownerEmail);
      if (files.teamLogo) formData.append("teamLogo", files.teamLogo);
      formData.append("ownerAadhaar", files.ownerAadhaar);
    } else {
      formData.append("fullName", fields.fullName);
      formData.append("dob", fields.dob);
      formData.append("phone", fields.phone);
      formData.append("whatsapp", effectiveWhatsapp);
      formData.append("email", fields.email);
      formData.append("role", fields.role);
      formData.append("battingStyle", fields.battingStyle);
      formData.append("bowlingStyle", fields.bowlingStyle);
      formData.append("battingOrder", fields.battingOrder);
      formData.append("profilePhoto", files.profilePhoto);
      formData.append("aadhaarPhoto", files.aadhaarPhoto);
    }
    formData.append("paymentScreenshot", files.paymentScreenshot);

    try {
      const res = await api.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/success", {
        state: { tokenNumber: res.data.tokenNumber, registrationId: res.data.registrationId },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  const baseFieldClass =
    "w-full rounded-lg border bg-charcoal px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-gold";
  function fieldClass(key) {
    return `${baseFieldClass} ${errors[key] ? "border-crimson" : "border-gold/20"}`;
  }
  const inputClass = `${baseFieldClass} border-gold/20`;
  const labelClass = "mb-1 block text-sm font-semibold text-white/80";
  const errorClass = "mt-1 text-xs text-crimson-light";
  const errorCount = Object.keys(errors).length;

  function ErrorSummary() {
    if (errorCount === 0) return null;
    return (
      <div className="flex items-center gap-2 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 text-sm font-semibold text-crimson-light">
        <span className="text-lg leading-none">⚠</span>
        <span>
          Please fix the {errorCount} field{errorCount > 1 ? "s" : ""} marked in red above before
          continuing.
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-center text-2xl font-black text-gradient-gold sm:text-4xl">
          Registration
        </h1>

        {/* Type selector */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2.5 text-xs font-bold capitalize leading-tight transition sm:rounded-full sm:text-sm ${
                type === t
                  ? "bg-gradient-to-r from-gold-light to-gold text-ink"
                  : "border border-white/20 text-white/60 hover:border-gold"
              }`}
            >
              <span>{t}</span>
              <span className="font-normal opacity-80">₹{FEES[t].amount.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-white/60">
          {isTeam ? "Team Entry Fee" : `${FEES[type].label} Fee`}:{" "}
          <span className="font-bold text-gold-light">
            ₹{FEES[type].amount.toLocaleString("en-IN")}
          </span>
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold">
          <span className={step === 1 ? "text-gold-light" : "text-white/40"}>1. Details</span>
          <span className="text-white/20">→</span>
          <span className={step === 2 ? "text-gold-light" : "text-white/40"}>2. Payment</span>
        </div>

        {serverError && (
          <div className="mt-6 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 text-sm text-crimson-light">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {step === 1 && (
            <>
              {isTeam ? (
                <>
                  <div ref={setFieldRef("teamName")}>
                    <label className={labelClass}>
                      Team Name <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("teamName")}
                      value={fields.teamName}
                      onChange={(e) => updateField("teamName", e.target.value)}
                    />
                    {errors.teamName && <p className={errorClass}>{errors.teamName}</p>}
                  </div>
                  <div ref={setFieldRef("ownerName")}>
                    <label className={labelClass}>
                      Owner Full Name <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("ownerName")}
                      value={fields.ownerName}
                      onChange={(e) => updateField("ownerName", e.target.value)}
                    />
                    {errors.ownerName && <p className={errorClass}>{errors.ownerName}</p>}
                  </div>
                  <div ref={setFieldRef("ownerPhone")}>
                    <label className={labelClass}>
                      Owner Phone <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("ownerPhone")}
                      value={fields.ownerPhone}
                      maxLength={10}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) => updateField("ownerPhone", e.target.value.replace(/\D/g, ""))}
                    />
                    {errors.ownerPhone && <p className={errorClass}>{errors.ownerPhone}</p>}
                  </div>
                  <div ref={setFieldRef("whatsapp")}>
                    <label className={labelClass}>
                      Owner WhatsApp Number <span className="text-crimson-light">*</span>
                    </label>
                    <label className="mb-2 flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-gold"
                        checked={whatsappSame}
                        onChange={(e) => setWhatsappSame(e.target.checked)}
                      />
                      Same as owner phone number
                    </label>
                    {!whatsappSame && (
                      <input
                        className={fieldClass("whatsapp")}
                        value={fields.ownerWhatsapp}
                        maxLength={10}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => updateField("ownerWhatsapp", e.target.value.replace(/\D/g, ""))}
                      />
                    )}
                    {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Owner Email (optional)</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={fields.ownerEmail}
                      onChange={(e) => updateField("ownerEmail", e.target.value)}
                    />
                  </div>
                  <div ref={setFieldRef("city")}>
                    <label className={labelClass}>
                      City <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("city")}
                      value={fields.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                    {errors.city && <p className={errorClass}>{errors.city}</p>}
                  </div>
                  <div ref={setFieldRef("address")}>
                    <label className={labelClass}>
                      Address <span className="text-crimson-light">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className={`${fieldClass("address")} resize-none`}
                      value={fields.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                  </div>
                  <FileInput
                    label="Team Logo (optional)"
                    onChange={(f) => updateFile("teamLogo", f)}
                  />
                  <div ref={setFieldRef("ownerAadhaar")}>
                    <FileInput
                      label="Owner Aadhaar Card Photo"
                      required
                      onChange={(f) => updateFile("ownerAadhaar", f)}
                      error={errors.ownerAadhaar}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div ref={setFieldRef("fullName")}>
                    <label className={labelClass}>
                      Full Name <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("fullName")}
                      value={fields.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                    {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
                  </div>
                  <div ref={setFieldRef("dob")}>
                    <label className={labelClass}>
                      Date of Birth <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      type="date"
                      className={fieldClass("dob")}
                      value={fields.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                    />
                    {errors.dob && <p className={errorClass}>{errors.dob}</p>}
                  </div>
                  <div ref={setFieldRef("phone")}>
                    <label className={labelClass}>
                      Phone Number <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("phone")}
                      value={fields.phone}
                      maxLength={10}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                  </div>
                  <div ref={setFieldRef("whatsapp")}>
                    <label className={labelClass}>
                      WhatsApp Number <span className="text-crimson-light">*</span>
                    </label>
                    <label className="mb-2 flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-gold"
                        checked={whatsappSame}
                        onChange={(e) => setWhatsappSame(e.target.checked)}
                      />
                      Same as phone number
                    </label>
                    {!whatsappSame && (
                      <input
                        className={fieldClass("whatsapp")}
                        value={fields.whatsapp}
                        maxLength={10}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => updateField("whatsapp", e.target.value.replace(/\D/g, ""))}
                      />
                    )}
                    {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email (optional)</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={fields.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div ref={setFieldRef("city")}>
                    <label className={labelClass}>
                      City <span className="text-crimson-light">*</span>
                    </label>
                    <input
                      className={fieldClass("city")}
                      value={fields.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                    {errors.city && <p className={errorClass}>{errors.city}</p>}
                  </div>
                  <div ref={setFieldRef("address")}>
                    <label className={labelClass}>
                      Address <span className="text-crimson-light">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className={`${fieldClass("address")} resize-none`}
                      value={fields.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                  </div>
                  <div ref={setFieldRef("role")}>
                    <label className={labelClass}>
                      Player Role <span className="text-crimson-light">*</span>
                    </label>
                    <select
                      className={fieldClass("role")}
                      value={fields.role}
                      onChange={(e) => updateField("role", e.target.value)}
                    >
                      <option value="">Select role</option>
                      {PLAYER_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {errors.role && <p className={errorClass}>{errors.role}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div ref={setFieldRef("battingStyle")}>
                      <label className={labelClass}>
                        Batting Style <span className="text-crimson-light">*</span>
                      </label>
                      <select
                        className={fieldClass("battingStyle")}
                        value={fields.battingStyle}
                        onChange={(e) => updateField("battingStyle", e.target.value)}
                      >
                        <option value="">Select</option>
                        {BATTING_STYLES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.battingStyle && <p className={errorClass}>{errors.battingStyle}</p>}
                    </div>
                    <div ref={setFieldRef("bowlingStyle")}>
                      <label className={labelClass}>
                        Bowling Style <span className="text-crimson-light">*</span>
                      </label>
                      <select
                        className={fieldClass("bowlingStyle")}
                        value={fields.bowlingStyle}
                        onChange={(e) => updateField("bowlingStyle", e.target.value)}
                      >
                        <option value="">Select</option>
                        {BOWLING_STYLES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.bowlingStyle && <p className={errorClass}>{errors.bowlingStyle}</p>}
                    </div>
                  </div>
                  <div ref={setFieldRef("battingOrder")}>
                    <label className={labelClass}>
                      Preferred Batting Order <span className="text-crimson-light">*</span>
                    </label>
                    <select
                      className={fieldClass("battingOrder")}
                      value={fields.battingOrder}
                      onChange={(e) => updateField("battingOrder", e.target.value)}
                    >
                      <option value="">Select position</option>
                      {BATTING_ORDER_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {errors.battingOrder && <p className={errorClass}>{errors.battingOrder}</p>}
                  </div>
                  <div ref={setFieldRef("profilePhoto")}>
                    <FileInput
                      label="Profile Photo"
                      required
                      onChange={(f) => updateFile("profilePhoto", f)}
                      error={errors.profilePhoto}
                    />
                  </div>
                  <div ref={setFieldRef("aadhaarPhoto")}>
                    <FileInput
                      label="Aadhaar Card Photo"
                      required
                      onChange={(f) => updateFile("aadhaarPhoto", f)}
                      error={errors.aadhaarPhoto}
                    />
                  </div>
                </>
              )}

              <ErrorSummary />

              <button
                type="button"
                onClick={goNext}
                className="w-full rounded-full bg-gradient-to-r from-gold-light to-gold py-3 font-bold text-ink transition hover:brightness-110"
              >
                Continue to Payment
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="rounded-2xl border border-gold/30 bg-charcoal p-6 text-center">
                <h3 className="text-lg font-bold text-gold-light">Pay via UPI</h3>
                <p className="mt-1 text-sm text-white/50">
                  Amount to pay:{" "}
                  <span className="font-bold text-gold-light">
                    ₹{FEES[type].amount.toLocaleString("en-IN")}
                  </span>
                </p>

                <div className="mt-5 flex flex-col items-center gap-2">
                  <img
                    src={PAYMENT_DETAILS.qrImage}
                    alt="Payment QR Code"
                    className="h-52 w-52 rounded-xl border border-gold/30 bg-white p-2"
                  />
                  <p className="text-xs text-white/40">Scan with any UPI app to pay</p>
                </div>

                <dl className="mx-auto mt-6 max-w-xs space-y-3 text-left text-sm">
                  <div className="rounded-lg bg-ink/60 px-4 py-3">
                    <dt className="text-xs uppercase tracking-widest text-white/40">UPI ID</dt>
                    <dd className="mt-0.5">
                      <CopyableValue value={PAYMENT_DETAILS.upiId} />
                    </dd>
                  </div>
                  <div className="rounded-lg bg-ink/60 px-4 py-3">
                    <dt className="text-xs uppercase tracking-widest text-white/40">
                      Mobile Number (UPI / GPay / PhonePe)
                    </dt>
                    <dd className="mt-0.5">
                      <CopyableValue value={PAYMENT_DETAILS.mobileNumber} />
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 text-xs text-white/50">
                  Payee: {PAYMENT_DETAILS.accountName} &middot; Queries: {CONTACT.name} —{" "}
                  {CONTACT.phone}
                </p>
              </div>

              <div ref={setFieldRef("utr")}>
                <label className={labelClass}>
                  UTR / Transaction Reference Number <span className="text-crimson-light">*</span>
                </label>
                <input
                  className={fieldClass("utr")}
                  value={fields.utr}
                  maxLength={12}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="6-12 digit UTR number"
                  onChange={(e) => updateField("utr", e.target.value.replace(/\D/g, ""))}
                />
                {errors.utr && <p className={errorClass}>{errors.utr}</p>}

                <button
                  type="button"
                  onClick={() => setShowUtrHelp((s) => !s)}
                  className="mt-2 text-xs font-semibold text-gold hover:underline"
                >
                  {showUtrHelp ? "Hide" : "Don't know your UTR? / UTR नहीं पता? — यहाँ देखें"}
                </button>

                {showUtrHelp && (
                  <div className="mt-3 rounded-xl border border-gold/20 bg-ink/60 p-3">
                    <p className="text-xs text-white/60">
                      The UTR (also called UPI Ref No. / Transaction ID) is on your payment app's
                      success screen. Tap your app below to see where.
                      <br />
                      UTR (जिसे UPI Ref No. / Transaction ID भी कहते हैं) आपके पेमेंट ऐप की success
                      स्क्रीन पर होता है।
                    </p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {UTR_HELP_APPS.map((app) => (
                        <a
                          key={app.name}
                          href={app.image}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0"
                        >
                          <img
                            src={app.image}
                            alt={`Where to find UTR in ${app.name}`}
                            className="h-40 w-28 rounded-lg border border-white/10 object-cover object-top"
                          />
                          <p className="mt-1 text-center text-[11px] text-white/50">{app.name}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div ref={setFieldRef("paymentScreenshot")}>
                <FileInput
                  label="Payment Screenshot"
                  required
                  onChange={(f) => updateFile("paymentScreenshot", f)}
                  error={errors.paymentScreenshot}
                />
              </div>

              <div ref={setFieldRef("agreedToTerms")}>
                <label className="flex items-start gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-gold"
                    checked={fields.agreedToTerms}
                    onChange={(e) => updateField("agreedToTerms", e.target.checked)}
                  />
                  I have read and agree to the terms of payment and withdrawal policy
                </label>
                {errors.agreedToTerms && <p className={errorClass}>{errors.agreedToTerms}</p>}
              </div>

              <ErrorSummary />

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-white/20 py-3 font-bold text-white/70 hover:border-gold hover:text-gold sm:w-1/3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50 sm:w-2/3 sm:text-base"
                >
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-white/50 hover:text-gold">
            ← Back to home
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
}
