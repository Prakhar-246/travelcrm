const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Name required'], trim: true },
  email:    { type: String, required: [true, 'Email required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password required'], minlength: 6, select: false },
  role:     { type: String, enum: ['admin', 'sales', 'operations'], default: 'sales' },
  phone:    { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = mongoose.model('User', UserSchema);
