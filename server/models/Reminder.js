const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  message:  { type: String, required: true },
  type:     { type: String, enum: ['payment', 'followup', 'hotel', 'transport', 'document', 'custom'], default: 'custom' },
  dueDate:  { type: Date, required: true },
  isDone:   { type: Boolean, default: false },
  doneAt:   { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  linkedTo: {
    model: { type: String, enum: ['Lead', 'Booking'] },
    id:    { type: mongoose.Schema.Types.ObjectId },
    label: String,
  },
  assignedTo:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ReminderSchema.index({ dueDate: 1, isDone: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema);
