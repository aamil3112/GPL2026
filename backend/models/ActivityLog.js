const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    adminUsername: { type: String, required: true },
    action: { type: String, enum: ["approve", "reject", "delete"], required: true },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    registrationName: { type: String, required: true },
    cloudinaryDeletion: {
      attempted: { type: Boolean, default: false },
      success: { type: Boolean, default: false },
      details: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
