const mongoose = require('mongoose');

const TrialRecordSchema = new mongoose.Schema(
  {
    emailHash: {
      type: String,
      required: true,
      unique: true, // ensures the same email isn't recorded multiple times
      index: true
    },
    trialUsed: {
      type: Boolean,
      default: true, // Since a record is only created when the trial is used
    },
    deletedAt: {
      type: Date,
      default: Date.now // stores the deletion time
    }
  },
  { timestamps: true } // adds createdAt and updatedAt fields
);

module.exports = mongoose.model('TrialRecord', TrialRecordSchema);