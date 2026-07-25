const Counter = require("../models/Counter");

async function generateTokenNumber() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const key = `${dd}${mm}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `${key}${String(counter.seq).padStart(2, "0")}`;
}

module.exports = { generateTokenNumber };
