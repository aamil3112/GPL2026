export const TOURNAMENT = {
  name: "Sagar Super Series 2026",
  tagline: "आपका मंच, आपकी पहचान!",
  slogan: "One Tournament. One Champion.",
  type: "Auction Base Tournament — Rubber Ball",
  teams: 16,
  month: "August 2026",
  location: "Sagar, Madhya Pradesh",
  firstPrize: "₹1,21,000",
  secondPrize: "₹61,000",
};

export const CONTACT = {
  name: "Pavan Kurmi RSP",
  phone: "7509023894",
};

export const SOCIALS = {
  brand: "AP Sports Sagar",
  youtube: "https://youtube.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  whatsappGroup: "https://chat.whatsapp.com/E7twh2YYvjNE5YdHC1T5iV?s=cl&p=i&mlu=0",
};

export const FEES = {
  junior: { label: "Junior Player", amount: 400 },
  senior: { label: "Senior Player", amount: 500 },
  team: { label: "Team Entry", amount: 20000 },
};

export const PAYMENT_DETAILS = {
  accountName: "Pavan Kurmi",
  upiId: "7509023894-2@ybl",
  mobileNumber: CONTACT.phone,
  qrImage: "/payment-qr.png",
};

export const PLAYER_ROLES = ["Batsman", "Bowler", "All-rounder"];
export const BATTING_STYLES = ["Right-Handed", "Left-Handed"];
export const BOWLING_STYLES = ["Fast", "Medium", "Spin"];
export const BATTING_ORDER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Age eligibility is evaluated as of the tournament start date, not "today",
// so a player's category doesn't drift as the registration window progresses.
export const AGE_CUTOFF_DATE = new Date(2026, 7, 1); // 1 Aug 2026
export const JUNIOR_MAX_AGE = 21;
