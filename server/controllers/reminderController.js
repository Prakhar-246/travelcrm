const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res, next) => {
  try {
    const { isDone, priority, type } = req.query;
    const query = { assignedTo: req.user.id };
    if (isDone  !== undefined) query.isDone   = isDone === 'true';
    if (priority) query.priority = priority;
    if (type)     query.type     = type;
    const reminders = await Reminder.find(query).sort({ dueDate: 1 });
    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (err) { next(err); }
};

exports.createReminder = async (req, res, next) => {
  try {
    req.body.createdBy  = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;
    const reminder = await Reminder.create(req.body);
    res.status(201).json({ success: true, data: reminder });
  } catch (err) { next(err); }
};

exports.updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) return res.status(404).json({ success: false, error: 'Reminder not found' });
    res.json({ success: true, data: reminder });
  } catch (err) { next(err); }
};

exports.markDone = async (req, res, next) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { isDone: true, doneAt: new Date() },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ success: false, error: 'Reminder not found' });
    res.json({ success: true, data: reminder });
  } catch (err) { next(err); }
};

exports.deleteReminder = async (req, res, next) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
