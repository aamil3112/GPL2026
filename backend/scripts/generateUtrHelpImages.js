// One-off asset generator: creates illustrative "where's my UTR number"
// help images for PhonePe, Google Pay and Paytm, bilingual (EN/HI).
// Run: node scripts/generateUtrHelpImages.js
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const W = 1000;
const PHONE_H = 1130;
const CAPTION_H = 260;
const H = PHONE_H + CAPTION_H;
const OUT_DIR = path.join(__dirname, "..", "..", "frontend", "public");

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function calloutArrow(x, y, toX, toY) {
  return `<path d="M${x} ${y} L${toX} ${toY}" stroke="#e63946" stroke-width="6" marker-end="url(#arrowhead)"/>`;
}

function captionBlock(captionEn, captionHi) {
  return `
    <rect x="0" y="${PHONE_H}" width="${W}" height="${CAPTION_H}" fill="#0a0a0a"/>
    <text x="${W / 2}" y="${PHONE_H + 70}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#f4d35e">${esc(
      captionEn
    )}</text>
    <text x="${W / 2}" y="${PHONE_H + 130}" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="34" font-weight="700" fill="#f4d35e">${esc(
      captionHi
    )}</text>
    <text x="${W / 2}" y="${PHONE_H + 190}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff88">Example number shown — use the UTR from YOUR payment</text>
    <text x="${W / 2}" y="${PHONE_H + 230}" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="24" fill="#ffffff88">यह उदाहरण संख्या है — अपने भुगतान का असली UTR भरें</text>
  `;
}

function defsArrowhead() {
  return `
    <defs>
      <marker id="arrowhead" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
        <polygon points="0 0, 12 5, 0 10" fill="#e63946"/>
      </marker>
    </defs>
  `;
}

function highlightBox(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="#e63946" stroke-width="6"/>`;
}

// ---------- PhonePe ----------
function phonePeSvg() {
  const purple = "#5f259f";
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${defsArrowhead()}
    <rect width="${W}" height="${H}" fill="#f5f5f5"/>
    <rect x="0" y="0" width="${W}" height="230" fill="${purple}"/>
    <text x="${W / 2}" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#ffffffcc">PhonePe</text>
    <text x="${W / 2}" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">Transaction Successful</text>

    <rect x="60" y="290" width="${W - 120}" height="220" rx="18" fill="#ffffff"/>
    <text x="100" y="345" font-family="Arial, sans-serif" font-size="26" fill="#666">Paid to</text>
    <text x="100" y="400" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111">Sagar Super Series 2026</text>
    <text x="100" y="445" font-family="Arial, sans-serif" font-size="26" fill="#888">7509023894-2@ybl</text>
    <text x="${W - 100}" y="400" text-anchor="end" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#111">₹400</text>

    <rect x="60" y="540" width="${W - 120}" height="420" rx="18" fill="#ffffff"/>
    <text x="100" y="600" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111">Payment Details</text>

    <text x="100" y="670" font-family="Arial, sans-serif" font-size="24" fill="#888">PhonePe Transaction ID</text>
    <text x="100" y="710" font-family="Arial, sans-serif" font-size="28" fill="#333">T2607XXXXXXXXXXXXXXXX</text>

    ${highlightBox(80, 760, W - 160, 130)}
    <text x="100" y="810" font-family="Arial, sans-serif" font-size="24" fill="#888">UTR</text>
    <text x="100" y="855" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111">123456789012</text>

    ${calloutArrow(W - 220, 1050, W - 300, 890)}
    <text x="${W - 480}" y="1010" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">This is your UTR</text>
    <text x="${W - 480}" y="1050" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">यही आपका UTR है</text>

    ${captionBlock("PhonePe: Tap Payment Details to see your UTR", "PhonePe: UTR देखने के लिए 'Payment Details' पर टैप करें")}
  </svg>`;
}

// ---------- Google Pay ----------
function googlePaySvg() {
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${defsArrowhead()}
    <rect width="${W}" height="${H}" fill="#f5f5f5"/>
    <rect x="0" y="0" width="${W}" height="230" fill="#ffffff"/>
    <circle cx="${W / 2}" cy="100" r="55" fill="#e6f4ea"/>
    <path d="M${W / 2 - 25} 100 l18 18 l32 -36" stroke="#188038" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${W / 2}" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#111">₹400 paid</text>

    <rect x="60" y="270" width="${W - 120}" height="200" rx="18" fill="#ffffff"/>
    <text x="100" y="330" font-family="Arial, sans-serif" font-size="26" fill="#666">To Sagar Super Series 2026</text>
    <text x="100" y="380" font-family="Arial, sans-serif" font-size="26" fill="#888">7509023894-2@ybl</text>
    <text x="100" y="425" font-family="Arial, sans-serif" font-size="26" fill="#188038" font-weight="700">Completed</text>

    <rect x="60" y="500" width="${W - 120}" height="460" rx="18" fill="#ffffff"/>
    <text x="100" y="560" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111">Transaction details</text>

    <text x="100" y="630" font-family="Arial, sans-serif" font-size="24" fill="#888">Google transaction ID</text>
    <text x="100" y="670" font-family="Arial, sans-serif" font-size="26" fill="#333">CICAgXXXXXXXXXXXXXXXX</text>

    ${highlightBox(80, 720, W - 160, 140)}
    <text x="100" y="775" font-family="Arial, sans-serif" font-size="24" fill="#888">UPI transaction ID</text>
    <text x="100" y="820" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111">123456789012</text>

    ${calloutArrow(W - 220, 1050, W - 300, 850)}
    <text x="${W - 480}" y="1010" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">This is your UTR</text>
    <text x="${W - 480}" y="1050" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">यही आपका UTR है</text>

    ${captionBlock("Google Pay: 'UPI transaction ID' is your UTR", "Google Pay: 'UPI transaction ID' ही आपका UTR है")}
  </svg>`;
}

// ---------- Paytm ----------
function paytmSvg() {
  const blue = "#00baf2";
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${defsArrowhead()}
    <rect width="${W}" height="${H}" fill="#f5f5f5"/>
    <rect x="0" y="0" width="${W}" height="230" fill="${blue}"/>
    <text x="${W / 2}" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#ffffffdd">Paytm</text>
    <text x="${W / 2}" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">Payment Successful</text>

    <rect x="60" y="290" width="${W - 120}" height="200" rx="18" fill="#ffffff"/>
    <text x="100" y="345" font-family="Arial, sans-serif" font-size="26" fill="#666">Paid to</text>
    <text x="100" y="395" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111">Sagar Super Series 2026</text>
    <text x="${W - 100}" y="395" text-anchor="end" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#111">₹400</text>
    <text x="100" y="440" font-family="Arial, sans-serif" font-size="26" fill="#888">7509023894-2@ybl</text>

    <rect x="60" y="520" width="${W - 120}" height="440" rx="18" fill="#ffffff"/>
    <text x="100" y="580" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111">Transaction Details</text>

    <text x="100" y="650" font-family="Arial, sans-serif" font-size="24" fill="#888">Order ID</text>
    <text x="100" y="690" font-family="Arial, sans-serif" font-size="26" fill="#333">OD1102607XXXXXXXXXX</text>

    ${highlightBox(80, 740, W - 160, 140)}
    <text x="100" y="795" font-family="Arial, sans-serif" font-size="24" fill="#888">UPI Ref No.</text>
    <text x="100" y="840" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111">123456789012</text>

    ${calloutArrow(W - 220, 1050, W - 300, 870)}
    <text x="${W - 480}" y="1010" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">This is your UTR</text>
    <text x="${W - 480}" y="1050" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="30" font-weight="700" fill="#e63946">यही आपका UTR है</text>

    ${captionBlock("Paytm: 'UPI Ref No.' is your UTR", "Paytm: 'UPI Ref No.' ही आपका UTR है")}
  </svg>`;
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error("Output dir not found:", OUT_DIR);
    process.exit(1);
  }

  const jobs = [
    ["utr-help-phonepe.png", phonePeSvg()],
    ["utr-help-googlepay.png", googlePaySvg()],
    ["utr-help-paytm.png", paytmSvg()],
  ];

  for (const [filename, svg] of jobs) {
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
    console.log("Wrote", filename, buffer.length, "bytes");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
