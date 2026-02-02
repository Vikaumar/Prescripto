import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription"
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember"
    },
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      enum: ["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "weekly", "custom"],
      required: true,
      default: "once_daily"
    },
    // Specific times for reminders (24h format, e.g., "08:00", "14:00", "20:00")
    times: [{
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"]
    }],
    // For weekly reminders, which days (0=Sunday, 6=Saturday)
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    // Date range
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    // Notification settings
    notificationSettings: {
      pushEnabled: {
        type: Boolean,
        default: true
      },
      emailEnabled: {
        type: Boolean,
        default: false
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      // Minutes before scheduled time to send reminder
      reminderOffset: {
        type: Number,
        default: 0
      }
    },
    // Push subscription for this reminder (for web push)
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed
    },
    // Tracking
    lastNotificationSent: {
      type: Date
    },
    // Color coding for UI
    color: {
      type: String,
      default: "#6366f1"
    },
    // Notes/Special instructions
    notes: {
      type: String,
      maxLength: 500
    }
  },
  {
    timestamps: true
  }
);

// Index for finding due reminders efficiently
reminderSchema.index({ isActive: 1, isPaused: 1, times: 1 });
reminderSchema.index({ userId: 1, isActive: 1 });

// Virtual to check if reminder is currently active
reminderSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const isWithinDateRange =
    (!this.startDate || now >= this.startDate) &&
    (!this.endDate || now <= this.endDate);
  return this.isActive && !this.isPaused && isWithinDateRange;
});

// Method to get next occurrence of this reminder
reminderSchema.methods.getNextOccurrence = function () {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  // Find the next time today or tomorrow
  for (const time of this.times.sort()) {
    if (time > currentTime) {
      const [hours, minutes] = time.split(":").map(Number);
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      return next;
    }
  }
  
  // All times have passed today, return first time tomorrow
  if (this.times.length > 0) {
    const [hours, minutes] = this.times[0].split(":").map(Number);
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(hours, minutes, 0, 0);
    return next;
  }
  
  return null;
};

// Ensure virtual fields are included in JSON output
reminderSchema.set("toJSON", { virtuals: true });
reminderSchema.set("toObject", { virtuals: true });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
