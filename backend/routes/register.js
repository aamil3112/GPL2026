const express = require("express");
const crypto = require("crypto");
const Registration = require("../models/Registration");
const upload = require("../middleware/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { generateTokenNumber } = require("../utils/tokenNumber");

const router = express.Router();

const FEES = { player: 470, team: 11550 };
const PHONE_REGEX = /^[6-9]\d{9}$/;
const UTR_REGEX = /^\d{6,12}$/;
const PLAYER_ROLES = ["Batsman", "Bowler", "All-rounder"];
const BATTING_STYLES = ["Right-Handed", "Left-Handed"];
const BOWLING_STYLES = ["Fast", "Medium", "Spin"];

function generateRegistrationId(type) {
  const prefix = type === "team" ? "GPL26-T" : "GPL26-P";
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

const uploadFields = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "aadhaarPhoto", maxCount: 1 },
  { name: "teamLogo", maxCount: 1 },
  { name: "ownerAadhaar", maxCount: 1 },
  { name: "paymentScreenshot", maxCount: 1 },
]);

function getFile(files, field) {
  return files[field]?.[0];
}

async function uploadIfPresent(file, folder) {
  if (!file) return undefined;
  return uploadBufferToCloudinary(file.buffer, folder);
}

// POST /api/register
router.post("/", uploadFields, async (req, res) => {
   console.log("Registration endpoint hit");
  try {
    const { type } = req.body;

    if (!["player", "team"].includes(type)) {
      return res.status(400).json({ message: "Invalid registration type" });
    }

    const files = req.files || {};
    const {
      fullName,
      dob,
      phone,
      whatsapp,
      email,
      city,
      address,
      role,
      battingStyle,
      bowlingStyle,
      battingOrder,
      teamName,
      ownerName,
      ownerPhone,
      ownerWhatsapp,
      ownerEmail,
      utr,
      agreedToTerms,
    } = req.body;

    if (!UTR_REGEX.test(utr || "")) {
      return res.status(400).json({ message: "UTR must be 6-12 digits" });
    }
    if (agreedToTerms !== "true" && agreedToTerms !== true) {
      return res.status(400).json({ message: "You must agree to the terms" });
    }
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const paymentScreenshotFile = getFile(files, "paymentScreenshot");
    if (!paymentScreenshotFile) {
      return res.status(400).json({ message: "Payment screenshot is required" });
    }

    let fields;
    if (type === "team") {
      const teamPhone = ownerPhone;
      if (!teamName || !ownerName) {
        return res.status(400).json({ message: "Team name and owner name are required" });
      }
      if (!PHONE_REGEX.test(teamPhone || "")) {
        return res.status(400).json({ message: "Valid 10-digit owner phone is required" });
      }
      if (!PHONE_REGEX.test(ownerWhatsapp || "")) {
        return res.status(400).json({ message: "Valid 10-digit owner WhatsApp number is required" });
      }
      const ownerAadhaarFile = getFile(files, "ownerAadhaar");
      if (!ownerAadhaarFile) {
        return res.status(400).json({ message: "Owner Aadhaar photo is required" });
      }
      fields = {
        teamPhone,
        teamWhatsapp: ownerWhatsapp,
        ownerAadhaarFile,
        teamLogoFile: getFile(files, "teamLogo"),
      };
    } else {
      if (!fullName || !dob || !role) {
        return res.status(400).json({ message: "Full name, date of birth and role are required" });
      }
      if (!PLAYER_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid player role" });
      }
      if (!BATTING_STYLES.includes(battingStyle)) {
        return res.status(400).json({ message: "Valid batting style is required" });
      }
      if (!BOWLING_STYLES.includes(bowlingStyle)) {
        return res.status(400).json({ message: "Valid bowling style is required" });
      }
      const battingOrderNum = Number(battingOrder);
      if (!Number.isInteger(battingOrderNum) || battingOrderNum < 1 || battingOrderNum > 11) {
        return res.status(400).json({ message: "Preferred batting order must be between 1 and 11" });
      }
      if (!PHONE_REGEX.test(phone || "")) {
        return res.status(400).json({ message: "Valid 10-digit phone number is required" });
      }
      if (!PHONE_REGEX.test(whatsapp || "")) {
        return res.status(400).json({ message: "Valid 10-digit WhatsApp number is required" });
      }

      const profilePhotoFile = getFile(files, "profilePhoto");
      const aadhaarPhotoFile = getFile(files, "aadhaarPhoto");
      if (!profilePhotoFile) {
        return res.status(400).json({ message: "Profile photo is required" });
      }
      if (!aadhaarPhotoFile) {
        return res.status(400).json({ message: "Aadhaar photo is required" });
      }
      fields = { profilePhotoFile, aadhaarPhotoFile, battingOrderNum };
    }

    // Upload all provided images to Cloudinary in parallel
    const [
      paymentScreenshot,
      profilePhoto,
      aadhaarPhoto,
      teamLogo,
      ownerAadhaar,
    ] = await Promise.all([
      uploadIfPresent(paymentScreenshotFile, "payment"),
      uploadIfPresent(fields.profilePhotoFile, "profile"),
      uploadIfPresent(fields.aadhaarPhotoFile, "aadhaar"),
      uploadIfPresent(fields.teamLogoFile, "team-logo"),
      uploadIfPresent(fields.ownerAadhaarFile, "aadhaar"),
    ]);

    const tokenNumber = await generateTokenNumber();

    let doc = {
      type,
      city,
      address,
      utr,
      amount: FEES[type],
      agreedToTerms: true,
      paymentScreenshot,
      registrationId: generateRegistrationId(type),
      tokenNumber,
    };

    if (type === "team") {
      doc = {
        ...doc,
        teamName,
        ownerName,
        phone: fields.teamPhone,
        whatsapp: fields.teamWhatsapp,
        email: ownerEmail,
        teamLogo,
        ownerAadhaar,
      };
    } else {
      doc = {
        ...doc,
        fullName,
        dob,
        role,
        battingStyle,
        bowlingStyle,
        battingOrder: fields.battingOrderNum,
        phone,
        whatsapp,
        email,
        profilePhoto,
        aadhaarPhoto,
      };
    }

    const registration = await Registration.create(doc);

    res.status(201).json({
      message: "Registration submitted successfully",
      registrationId: registration.registrationId,
      tokenNumber: registration.tokenNumber,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
