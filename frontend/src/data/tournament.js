export const TOURNAMENT = {
  name: "Garhakota Premier League (GPL)",
  tagline: "",
  slogan: "Play Hard, Win Big",
  type: "Auction Base Tournament",
  teams: 8,
  month: "September 2026",
  location: "Garhakota, Sagar, Madhya Pradesh",
  firstPrize: "₹51,000",
  secondPrize: "₹25,000",
};

export const CONTACT = {
  name: "Arbaj Khan",
  phone: "8349547662",
};

export const SOCIALS = {
  brand: "",
  youtube: "",
  facebook: "",
  instagram: "",
  whatsappGroup: "",
};

export const FEES = {
  junior: { label: "Junior Player", amount: 300 },
  senior: { label: "Senior Player", amount: 400 },
  team: { label: "Team Entry", amount: 11000 },
};

export const PAYMENT_DETAILS = {
  accountName: "Arbaj Khan",
  upiId: "8349547662-2@ibl",
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
