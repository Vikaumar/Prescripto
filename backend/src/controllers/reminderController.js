import Reminder from "../models/Reminder.js";
import DoseLog from "../models/DoseLog.js";
import mongoose from "mongoose";

/**
 * Create a new reminder
 * POST /api/reminders
 */
export const createReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      prescriptionId,
      familyMemberId,
      medicineName,
      dosage,
      instructions,
      frequency,
      times,
      daysOfWeek,
      startDate,
      endDate,
      notificationSettings,
      color,
      notes
    } = req.body;

    // Validate required fields
    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required"
      });
    }

    if (!times || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one reminder time is required"
      });
    }

    // Create reminder
    const reminder = await Reminder.create({
      userId,
      prescriptionId,
      familyMemberId,
      medicineName,
      dosage,
      instructions,
      frequency: frequency || "once_daily",
      times,
      daysOfWeek,
      startDate: startDate || new Date(),
      endDate,
      notificationSettings,
      color,
      notes
    });

    // Create initial dose logs for today
    await createDoseLogsForDay(reminder, new Date());

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reminder"
    });
  }
};

/**
 * Get all reminders for current user
 * GET /api/reminders
 */
export const getReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { active, familyMemberId } = req.query;

    const query = { userId };
    
    if (active === "true") {
      query.isActive = true;
      query.isPaused = false;
    }
    
    if (familyMemberId) {
      query.familyMemberId = familyMemberId;
    }

    const reminders = await Reminder.find(query)
      .populate("prescriptionId", "imagePath")
      .populate("familyMemberId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    console.error("Get reminders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminders"
    });
  }
};

/**
 * Get single reminder by ID
 * GET /api/reminders/:id
 */
export const getReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await Reminder.findOne({ _id: id, userId })
      .populate("prescriptionId")
      .populate("familyMemberId");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error("Get reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminder"
    });
  }
};

/**
 * Update a reminder
 * PUT /api/reminders/:id
 */
export const updateReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      "medicineName", "dosage", "instructions", "frequency",
      "times", "daysOfWeek", "startDate", "endDate",
      "isActive", "isPaused", "notificationSettings", "color", "notes"
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Update reminder error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update reminder"
    });
  }
};

/**
 * Delete a reminder
 * DELETE /api/reminders/:id
 */
export const deleteReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    // Also delete associated dose logs
    await DoseLog.deleteMany({ reminderId: id });

    res.json({
      success: true,
      message: "Reminder deleted successfully"
    });
  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reminder"
    });
  }
};

/**
 * Toggle reminder active/paused state
 * PATCH /api/reminders/:id/toggle
 */
export const toggleReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { field } = req.body; // 'isActive' or 'isPaused'

    if (!["isActive", "isPaused"].includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid toggle field"
      });
    }

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    reminder[field] = !reminder[field];
    await reminder.save();

    res.json({
      success: true,
      message: `Reminder ${field} set to ${reminder[field]}`,
      data: reminder
    });
  } catch (error) {
    console.error("Toggle reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle reminder"
    });
  }
};

/**
 * Log a dose (mark as taken, skipped, or snoozed)
 * POST /api/reminders/:id/log
 */
export const logDose = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { doseLogId, status, notes, snoozeDuration } = req.body;

    if (!["taken", "skipped", "snoozed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'taken', 'skipped', or 'snoozed'"
      });
    }

    // Find the dose log
    let doseLog;
    if (doseLogId) {
      doseLog = await DoseLog.findOne({ _id: doseLogId, userId });
    } else {
      // Find the most recent pending dose for this reminder
      doseLog = await DoseLog.findOne({
        reminderId: id,
        userId,
        status: "pending"
      }).sort({ scheduledTime: -1 });
    }

    if (!doseLog) {
      return res.status(404).json({
        success: false,
        message: "Dose log not found"
      });
    }

    // Update the dose log
    doseLog.status = status;
    if (notes) doseLog.notes = notes;

    if (status === "taken") {
      doseLog.takenAt = new Date();
    } else if (status === "snoozed") {
      const snoozeMinutes = snoozeDuration || 15;
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + snoozeMinutes);
      doseLog.snoozedUntil = snoozeUntil;
      doseLog.snoozeCount += 1;
      doseLog.status = "pending"; // Keep as pending until taken/skipped
    }

    await doseLog.save();

    res.json({
      success: true,
      message: `Dose marked as ${status}`,
      data: doseLog
    });
  } catch (error) {
    console.error("Log dose error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log dose"
    });
  }
};

/**
 * Get today's doses for current user
 * GET /api/reminders/today
 */
export const getTodaysDoses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { familyMemberId } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      userId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay }
    };

    if (familyMemberId) {
      query.familyMemberId = familyMemberId;
    }

    const doses = await DoseLog.find(query)
      .populate("reminderId", "color")
      .sort({ scheduledTime: 1 });

    // Group by time
    const groupedDoses = {};
    doses.forEach(dose => {
      const timeKey = dose.scheduledTime.toISOString();
      if (!groupedDoses[timeKey]) {
        groupedDoses[timeKey] = [];
      }
      groupedDoses[timeKey].push(dose);
    });

    res.json({
      success: true,
      count: doses.length,
      data: doses,
      grouped: groupedDoses
    });
  } catch (error) {
    console.error("Get today's doses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's doses"
    });
  }
};

/**
 * Get adherence statistics
 * GET /api/reminders/stats
 */
export const getAdherenceStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "week", familyMemberId } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get overall stats
    const overallStats = await DoseLog.getAdherenceStats(userId, startDate, endDate);

    // Get daily breakdown
    const dailyStats = await DoseLog.getDailyAdherence(userId, startDate, endDate);

    // Get per-medicine breakdown
    const medicineStats = await DoseLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          scheduledTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$medicineName",
          total: { $sum: 1 },
          taken: {
            $sum: { $cond: [{ $eq: ["$status", "taken"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          medicineName: "$_id",
          total: 1,
          taken: 1,
          adherenceRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$taken", "$total"] }, 100] }
            ]
          }
        }
      },
      { $sort: { adherenceRate: -1 } }
    ]);

    // Calculate streak
    let currentStreak = 0;
    const reversedDaily = [...dailyStats].reverse();
    for (const day of reversedDaily) {
      if (day.adherenceRate >= 80) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        period,
        overall: overallStats,
        daily: dailyStats,
        byMedicine: medicineStats,
        currentStreak
      }
    });
  } catch (error) {
    console.error("Get adherence stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch adherence statistics"
    });
  }
};

/**
 * Save push subscription for notifications
 * POST /api/reminders/subscribe
 */
export const savePushSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: "Push subscription is required"
      });
    }

    // Update all active reminders with this subscription
    await Reminder.updateMany(
      { userId, isActive: true },
      { pushSubscription: subscription }
    );

    res.json({
      success: true,
      message: "Push subscription saved"
    });
  } catch (error) {
    console.error("Save push subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save push subscription"
    });
  }
};

// ============ Helper Functions ============

/**
 * Create dose logs for a specific day based on reminder schedule
 */
async function createDoseLogsForDay(reminder, date) {
  const logs = [];

  for (const time of reminder.times) {
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Only create if scheduled time is in the future or today
    if (scheduledTime >= reminder.startDate) {
      // Check if log already exists
      const existing = await DoseLog.findOne({
        reminderId: reminder._id,
        scheduledTime
      });

      if (!existing) {
        const log = await DoseLog.create({
          reminderId: reminder._id,
          userId: reminder.userId,
          familyMemberId: reminder.familyMemberId,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
          scheduledTime,
          status: "pending"
        });
        logs.push(log);
      }
    }
  }

  return logs;
}

export default {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  logDose,
  getTodaysDoses,
  getAdherenceStats,
  savePushSubscription
};
