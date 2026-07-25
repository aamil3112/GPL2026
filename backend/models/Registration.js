const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    url: { type: String },
    publicId: { type: String },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true },
    tokenNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["junior", "senior", "team"],
      required: true,
    },

    // Individual (junior/senior) fields
    fullName: { type: String, trim: true },
    dob: { type: Date },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-rounder"],
    },
    battingStyle: { type: String, enum: ["Right-Handed", "Left-Handed"] },
    bowlingStyle: { type: String, enum: ["Fast", "Medium", "Spin"] },
    battingOrder: { type: Number, min: 1, max: 11 },
    profilePhoto: fileSchema,
    aadhaarPhoto: fileSchema,

    // Team fields
    teamName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    teamLogo: fileSchema,
    ownerAadhaar: fileSchema,

    // Shared contact fields (phone/email hold owner's info for teams)
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    // Payment
    amount: { type: Number, required: true },
    utr: { type: String, required: true, trim: true },
    paymentScreenshot: fileSchema,
    agreedToTerms: { type: Boolean, required: true, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Generated after approval
    ticket: fileSchema,
  },
  { timestamps: true }
);

registrationSchema.index({ fullName: "text", teamName: "text" });

module.exports = mongoose.model("Registration", registrationSchema);
