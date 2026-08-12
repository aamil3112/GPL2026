const express = require("express");
const Registration = require("../models/Registration");
const ActivityLog = require("../models/ActivityLog");
const requireAdmin = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const { toCsv } = require("../utils/csv");
const { generateTicketBuffer } = require("../utils/generateTicket");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [total, approved, pending, rejected, individual, team, revenueAgg, filesAgg] =
      await Promise.all([
        Registration.countDocuments(),
        Registration.countDocuments({ status: "approved" }),
        Registration.countDocuments({ status: "pending" }),
        Registration.countDocuments({ status: "rejected" }),
        Registration.countDocuments({ type: "player" }),
        Registration.countDocuments({ type: "team" }),
        Registration.aggregate([
          { $match: { status: { $ne: "rejected" } } },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ]),
        Registration.aggregate([
          {
            $project: {
              fileCount: {
                $add: [
                  { $cond: [{ $ifNull: ["$profilePhoto.url", false] }, 1, 0] },
                  { $cond: [{ $ifNull: ["$aadhaarPhoto.url", false] }, 1, 0] },
                  { $cond: [{ $ifNull: ["$teamLogo.url", false] }, 1, 0] },
                  { $cond: [{ $ifNull: ["$ownerAadhaar.url", false] }, 1, 0] },
                  { $cond: [{ $ifNull: ["$paymentScreenshot.url", false] }, 1, 0] },
                  { $cond: [{ $ifNull: ["$ticket.url", false] }, 1, 0] },
                ],
              },
            },
          },
          { $group: { _id: null, sum: { $sum: "$fileCount" } } },
        ]),
      ]);

    res.json({
      total,
      approved,
      pending,
      rejected,
      individual,
      team,
      estimatedRevenue: revenueAgg[0]?.sum || 0,
      filesOnCloudinary: filesAgg[0]?.sum || 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// GET /api/admin/registrations?search=&type=&status=&city=
router.get("/registrations", async (req, res) => {
  try {
    const { search, type, status, city } = req.query;
    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (status && status !== "all") filter.status = status;
    if (city && city !== "all") filter.city = new RegExp(`^${city}$`, "i");

    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ fullName: re }, { teamName: re }, { ownerName: re }, { phone: re }];
    }

    const registrations = await Registration.find(filter).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    console.error("List registrations error:", err);
    res.status(500).json({ message: "Failed to load registrations" });
  }
});

// GET /api/admin/registrations/:id
router.get("/registrations/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ message: "Failed to load registration" });
  }
});

function displayName(reg) {
  return reg.type === "team" ? reg.teamName : reg.fullName;
}

// PATCH /api/admin/registrations/:id/approve
router.patch("/registrations/:id/approve", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    registration.status = "approved";

    if (!registration.ticket?.url) {
      try {
        const ticketBuffer = await generateTicketBuffer(registration);
        registration.ticket = await uploadBufferToCloudinary(ticketBuffer, "tickets");
      } catch (ticketErr) {
        console.error("Ticket generation failed:", ticketErr);
      }
    }

    await registration.save();

    await ActivityLog.create({
      adminUsername: req.admin.username,
      action: "approve",
      registration: registration._id,
      registrationName: displayName(registration),
    });

    res.json({ message: "Registration approved", registration });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Failed to approve registration" });
  }
});

// PATCH /api/admin/registrations/:id/reject
router.patch("/registrations/:id/reject", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    const publicIds = [
      registration.profilePhoto?.publicId,
      registration.aadhaarPhoto?.publicId,
      registration.teamLogo?.publicId,
      registration.ownerAadhaar?.publicId,
      registration.paymentScreenshot?.publicId,
      registration.ticket?.publicId,
    ].filter(Boolean);

    let deletionDetails = {};
    let deletionSuccess = true;

    if (publicIds.length > 0) {
      const results = await Promise.allSettled(
        publicIds.map((id) => cloudinary.uploader.destroy(id))
      );
      results.forEach((result, i) => {
        const id = publicIds[i];
        if (result.status === "fulfilled") {
          deletionDetails[id] = result.value.result;
          if (result.value.result !== "ok" && result.value.result !== "not found") {
            deletionSuccess = false;
          }
        } else {
          deletionDetails[id] = `error: ${result.reason?.message || "unknown"}`;
          deletionSuccess = false;
        }
      });
      console.log(
        `Cloudinary deletion for registration ${registration.registrationId}:`,
        deletionDetails
      );
    }

    registration.status = "rejected";
    await registration.save();

    await ActivityLog.create({
      adminUsername: req.admin.username,
      action: "reject",
      registration: registration._id,
      registrationName: displayName(registration),
      cloudinaryDeletion: {
        attempted: publicIds.length > 0,
        success: deletionSuccess,
        details: deletionDetails,
      },
    });

    res.json({
      message: "Registration rejected",
      registration,
      cloudinaryDeletion: { success: deletionSuccess, details: deletionDetails },
    });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Failed to reject registration" });
  }
});

// DELETE /api/admin/registrations/:id (rejected registrations only)
router.delete("/registrations/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    if (registration.status !== "rejected") {
      return res
        .status(400)
        .json({ message: "Only rejected registrations can be deleted" });
    }

    // Defensive cleanup in case any files survived the reject step's Cloudinary deletion
    const publicIds = [
      registration.profilePhoto?.publicId,
      registration.aadhaarPhoto?.publicId,
      registration.teamLogo?.publicId,
      registration.ownerAadhaar?.publicId,
      registration.paymentScreenshot?.publicId,
      registration.ticket?.publicId,
    ].filter(Boolean);

    if (publicIds.length > 0) {
      await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));
    }

    const name = displayName(registration);
    await Registration.deleteOne({ _id: registration._id });

    await ActivityLog.create({
      adminUsername: req.admin.username,
      action: "delete",
      registrationName: name,
    });

    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete registration" });
  }
});

// GET /api/admin/activity-log
router.get("/activity-log", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load activity log" });
  }
});

const csvColumns = [
  { label: "Token Number", value: (r) => r.tokenNumber },
  { label: "Name", value: (r) => displayName(r) },
  { label: "Type", value: (r) => r.type },
  { label: "Phone", value: (r) => r.phone },
  { label: "WhatsApp", value: (r) => r.whatsapp || "" },
  { label: "Email", value: (r) => r.email || "" },
  { label: "City", value: (r) => r.city },
  { label: "Address", value: (r) => r.address || "" },
  { label: "Role", value: (r) => r.role || (r.type === "team" ? "Team Owner" : "") },
  { label: "Batting Style", value: (r) => r.battingStyle || "" },
  { label: "Bowling Style", value: (r) => r.bowlingStyle || "" },
  { label: "Batting Order", value: (r) => r.battingOrder || "" },
  { label: "Amount", value: (r) => r.amount },
  { label: "UTR", value: (r) => r.utr },
  { label: "Status", value: (r) => r.status },
  { label: "Registration Date", value: (r) => r.createdAt.toISOString() },
];

// GET /api/admin/export/csv?status=all|approved|pending
router.get("/export/csv", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const registrations = await Registration.find(filter).sort({ createdAt: -1 });

    const csv = toCsv(csvColumns, registrations);
    const filename = `registrations-${status || "all"}-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
});

// GET /api/admin/export/json (approved only, includes Cloudinary URLs)
router.get("/export/json", async (req, res) => {
  try {
    const registrations = await Registration.find({ status: "approved" }).sort({
      createdAt: -1,
    });
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="approved-registrations-${Date.now()}.json"`
    );
    res.send(JSON.stringify(registrations, null, 2));
  } catch (err) {
    console.error("JSON export error:", err);
    res.status(500).json({ message: "Failed to export JSON" });
  }
});

module.exports = router;
