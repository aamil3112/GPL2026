const path = require("path");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

// Fonts are bundled via @fontsource/inter (npm dependency) and registered
// explicitly here rather than relying on system fonts — the deploy target
// (e.g. Railway's minimal container) has no fonts installed by default,
// which previously rendered every glyph as a blank tofu box.
GlobalFonts.registerFromPath(
  path.join(__dirname, "..", "node_modules", "@fontsource", "inter", "files", "inter-latin-400-normal.woff2"),
  "TicketSans"
);
GlobalFonts.registerFromPath(
  path.join(__dirname, "..", "node_modules", "@fontsource", "inter", "files", "inter-latin-700-normal.woff2"),
  "TicketSansBold"
);
GlobalFonts.registerFromPath(
  path.join(__dirname, "..", "node_modules", "@fontsource", "inter", "files", "inter-latin-900-normal.woff2"),
  "TicketSansBlack"
);

const WIDTH = 1080;
const HEIGHT = 1350;
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f4d35e";
const CRIMSON = "#b31217";
const INK = "#0a0a0a";
const CHARCOAL = "#1a1a1a";
const PHOTO_SIZE = 320;
const PHOTO_CENTER_Y = 450;

async function fetchImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return await loadImage(buffer);
  } catch {
    return null;
  }
}

function drawBase(ctx, { badgeLabel, subtitle }) {
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, INK);
  bg.addColorStop(1, CHARCOAL);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const goldBar = ctx.createLinearGradient(0, 0, WIDTH, 0);
  goldBar.addColorStop(0, GOLD_LIGHT);
  goldBar.addColorStop(1, GOLD);
  ctx.fillStyle = goldBar;
  ctx.fillRect(0, 0, WIDTH, 14);
  ctx.fillStyle = CRIMSON;
  ctx.fillRect(0, HEIGHT - 14, WIDTH, 14);

  ctx.textAlign = "center";

  const titleGrad = ctx.createLinearGradient(WIDTH / 2 - 300, 0, WIDTH / 2 + 300, 0);
  titleGrad.addColorStop(0, GOLD_LIGHT);
  titleGrad.addColorStop(1, GOLD);
  ctx.fillStyle = titleGrad;
  ctx.font = "46px TicketSansBlack";
  ctx.fillText("SAGAR SUPER SERIES 2026", WIDTH / 2, 110);

  ctx.fillStyle = "#ffffffcc";
  ctx.font = "26px TicketSans";
  ctx.fillText(subtitle, WIDTH / 2, 155);

  ctx.fillStyle = CRIMSON;
  ctx.beginPath();
  ctx.roundRect(WIDTH / 2 - 160, 190, 320, 50, 25);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px TicketSansBold";
  ctx.fillText(badgeLabel, WIDTH / 2, 223);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(WIDTH / 2, PHOTO_CENTER_Y, PHOTO_SIZE / 2 + 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = "700 24px TicketSansBold";
  ctx.fillText("One Tournament. One Champion.", WIDTH / 2, 1200);
  ctx.fillStyle = "#ffffff66";
  ctx.font = "20px TicketSans";
  ctx.fillText("Organizer: Pavan Kurmi RSP • 7509023894", WIDTH / 2, 1240);
}

async function drawPhoto(ctx, url) {
  const img = await fetchImage(url);
  if (!img) return;

  const left = WIDTH / 2 - PHOTO_SIZE / 2;
  const top = PHOTO_CENTER_Y - PHOTO_SIZE / 2;

  // Cover-fit the source image into the circle, same as object-fit: cover
  const scale = Math.max(PHOTO_SIZE / img.width, PHOTO_SIZE / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = left + (PHOTO_SIZE - drawW) / 2;
  const dy = top + (PHOTO_SIZE - drawH) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(WIDTH / 2, PHOTO_CENTER_Y, PHOTO_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

function fieldBlock(ctx, label, value, x, y) {
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff88";
  ctx.font = "22px TicketSans";
  ctx.fillText(String(label).toUpperCase(), x, y);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 32px TicketSansBold";
  ctx.fillText(String(value ?? ""), x, y + 40);
}

async function generatePlayerTicket(r) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  drawBase(ctx, {
    badgeLabel: "APPROVED PLAYER",
    subtitle: "Auction Base Tournament • Rubber Ball",
  });
  await drawPhoto(ctx, r.profilePhoto?.url);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px TicketSansBlack";
  ctx.fillText(r.fullName, WIDTH / 2, 660);
  ctx.fillStyle = "#ffffff99";
  ctx.font = "26px TicketSans";
  ctx.fillText(`${r.city} • ${r.type === "junior" ? "Junior" : "Senior"} Category`, WIDTH / 2, 705);

  fieldBlock(ctx, "Token Number", r.tokenNumber, 120, 830);
  fieldBlock(ctx, "Player Role", r.role, 590, 830);
  fieldBlock(ctx, "Batting Style", r.battingStyle, 120, 930);
  fieldBlock(ctx, "Bowling Style", r.bowlingStyle, 590, 930);
  fieldBlock(ctx, "Preferred Batting Order", r.battingOrder, 120, 1030);

  return canvas.toBuffer("image/png");
}

async function generateTeamTicket(r) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  drawBase(ctx, {
    badgeLabel: "TEAM REGISTERED",
    subtitle: "Auction Base Tournament • 16 Teams",
  });
  await drawPhoto(ctx, r.teamLogo?.url);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px TicketSansBlack";
  ctx.fillText(r.teamName, WIDTH / 2, 660);
  ctx.fillStyle = "#ffffff99";
  ctx.font = "26px TicketSans";
  ctx.fillText(`${r.city} • Owner: ${r.ownerName}`, WIDTH / 2, 705);

  fieldBlock(ctx, "Token Number", r.tokenNumber, 120, 900);
  fieldBlock(ctx, "City", r.city, 590, 900);

  return canvas.toBuffer("image/png");
}

async function generateTicketBuffer(registration) {
  return registration.type === "team"
    ? generateTeamTicket(registration)
    : generatePlayerTicket(registration);
}

module.exports = { generateTicketBuffer };
