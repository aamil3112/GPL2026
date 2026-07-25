const sharp = require("sharp");

const WIDTH = 1080;
const HEIGHT = 1350;
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f4d35e";
const CRIMSON = "#b31217";
const INK = "#0a0a0a";
const CHARCOAL = "#1a1a1a";
const PHOTO_SIZE = 320;
const PHOTO_CENTER_Y = 450;

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function circularImage(buffer, size) {
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
  const resized = await sharp(buffer)
    .resize(size, size, { fit: "cover" })
    .toBuffer();
  return sharp(resized)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

function fieldBlock(label, value, x, y) {
  return `
    <text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="22" fill="#ffffff88" letter-spacing="2">${escapeXml(
      String(label).toUpperCase()
    )}</text>
    <text x="${x}" y="${y + 40}" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${escapeXml(
      String(value ?? "")
    )}</text>
  `;
}

function baseCardSvg({ badgeLabel, subtitle }) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${INK}"/>
        <stop offset="1" stop-color="${CHARCOAL}"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${GOLD_LIGHT}"/>
        <stop offset="1" stop-color="${GOLD}"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <rect x="0" y="0" width="${WIDTH}" height="14" fill="url(#gold)"/>
    <rect x="0" y="${HEIGHT - 14}" width="${WIDTH}" height="14" fill="${CRIMSON}"/>

    <text x="${WIDTH / 2}" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="900" fill="url(#gold)">SAGAR SUPER SERIES 2026</text>
    <text x="${WIDTH / 2}" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#ffffffcc">${escapeXml(
      subtitle
    )}</text>

    <rect x="${WIDTH / 2 - 160}" y="190" width="320" height="50" rx="25" fill="${CRIMSON}"/>
    <text x="${WIDTH / 2}" y="223" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" letter-spacing="2">${escapeXml(
      badgeLabel
    )}</text>

    <circle cx="${WIDTH / 2}" cy="${PHOTO_CENTER_Y}" r="${
      PHOTO_SIZE / 2 + 10
    }" fill="none" stroke="url(#gold)" stroke-width="6"/>

    <text x="${WIDTH / 2}" y="1200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${GOLD}">One Tournament. One Champion.</text>
    <text x="${WIDTH / 2}" y="1240" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#ffffff66">Organizer: Pavan Kurmi RSP &#8226; 7509023894</text>
  `;
}

async function compositePhoto(card, photoUrl) {
  const photoBuffer = await fetchImageBuffer(photoUrl);
  if (!photoBuffer) return card;
  const circlePhoto = await circularImage(photoBuffer, PHOTO_SIZE);
  return card.composite([
    {
      input: circlePhoto,
      left: Math.round(WIDTH / 2 - PHOTO_SIZE / 2),
      top: PHOTO_CENTER_Y - Math.round(PHOTO_SIZE / 2),
    },
  ]);
}

async function generatePlayerTicket(r) {
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${baseCardSvg({
        badgeLabel: "APPROVED PLAYER",
        subtitle: "Auction Base Tournament • Rubber Ball",
      })}

      <text x="${WIDTH / 2}" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${escapeXml(
        r.fullName
      )}</text>
      <text x="${WIDTH / 2}" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#ffffff99">${escapeXml(
        r.city
      )} • ${r.type === "junior" ? "Junior" : "Senior"} Category</text>

      ${fieldBlock("Token Number", r.tokenNumber, 120, 830)}
      ${fieldBlock("Player Role", r.role, 590, 830)}
      ${fieldBlock("Batting Style", r.battingStyle, 120, 930)}
      ${fieldBlock("Bowling Style", r.bowlingStyle, 590, 930)}
      ${fieldBlock("Preferred Batting Order", r.battingOrder, 120, 1030)}
    </svg>
  `;

  const card = sharp(Buffer.from(svg));
  const composited = await compositePhoto(card, r.profilePhoto?.url);
  return composited.png().toBuffer();
}

async function generateTeamTicket(r) {
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${baseCardSvg({
        badgeLabel: "TEAM REGISTERED",
        subtitle: "Auction Base Tournament • 16 Teams",
      })}

      <text x="${WIDTH / 2}" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${escapeXml(
        r.teamName
      )}</text>
      <text x="${WIDTH / 2}" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#ffffff99">${escapeXml(
        r.city
      )} • Owner: ${escapeXml(r.ownerName)}</text>

      ${fieldBlock("Token Number", r.tokenNumber, 120, 900)}
      ${fieldBlock("City", r.city, 590, 900)}
    </svg>
  `;

  const card = sharp(Buffer.from(svg));
  const composited = await compositePhoto(card, r.teamLogo?.url);
  return composited.png().toBuffer();
}

async function generateTicketBuffer(registration) {
  return registration.type === "team"
    ? generateTeamTicket(registration)
    : generatePlayerTicket(registration);
}

module.exports = { generateTicketBuffer };
