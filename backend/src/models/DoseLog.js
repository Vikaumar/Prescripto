import mongoose from "mongoose";

const doseLogSchema = new mongoose.Schema(
  {
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember"
    },
    medicineName: {
      type: String,
      required: true
    },
    dosage: {
      type: String
    },
    // The scheduled time for this dose
    scheduledTime: {
      type: Date,
      required: true,
      index: true
    },
    // Status of the dose
    status: {
      type: String,
      enum: ["pending", "taken", "skipped", "snoozed", "missed"],
      default: "pending",
      index: true
    },
    // When the user actually took the medicine
    takenAt: {
      type: Date
    },
    // When the user snoozed (to reschedule notification)
    snoozedUntil: {
      type: Date
    },
    // How many times snoozed
    snoozeCount: {
      type: Number,
      default: 0
    },
    // Optional notes from user
    notes: {
      type: String,
      maxLength: 200
    },
    // Was notification sent?
    notificationSent: {
      type: Boolean,
      default: false
    },
    notificationSentAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
doseLogSchema.index({ userId: 1, scheduledTime: -1 });
doseLogSchema.index({ userId: 1, status: 1, scheduledTime: -1 });
doseLogSchema.index({ reminderId: 1, scheduledTime: -1 });

// Static method to get adherence stats for a user
doseLogSchema.statics.getAdherenceStats = async function (userId, startDate, endDate) {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    scheduledTime: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        taken: {
          $sum: { $cond: [{ $eq: ["$status", "taken"] }, 1, 0] }
        },
        skipped: {
          $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] }
        },
        missed: {
          $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      total: 0,
      taken: 0,
      skipped: 0,
      missed: 0,
      pending: 0,
      adherenceRate: 0
    };
  }

  const result = stats[0];
  const completedDoses = result.taken + result.skipped + result.missed;
  result.adherenceRate = completedDoses > 0 
    ? Math.round((result.taken / completedDoses) * 100) 
    : 0;

  return result;
};

// Static method to get daily adherence for a date range
doseLogSchema.statics.getDailyAdherence = async function (userId, startDate, endDate) {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    scheduledTime: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const dailyStats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$scheduledTime" }
        },
        total: { $sum: 1 },
        taken: {
          $sum: { $cond: [{ $eq: ["$status", "taken"] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return dailyStats.map(day => ({
    date: day._id,
    total: day.total,
    taken: day.taken,
    adherenceRate: day.total > 0 ? Math.round((day.taken / day.total) * 100) : 0
  }));
};

// Method to check if dose is late
doseLogSchema.methods.isLate = function () {
  if (this.status !== "pending") return false;
  const now = new Date();
  // Consider late if more than 30 minutes past scheduled time
  const lateThreshold = new Date(this.scheduledTime);
  lateThreshold.setMinutes(lateThreshold.getMinutes() + 30);
  return now > lateThreshold;
};

const DoseLog = mongoose.model("DoseLog", doseLogSchema);

export default DoseLog;
