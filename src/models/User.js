import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '/uploads/akari.jpeg' },
  highSchool: { type: String, default: '' },
  currentCity: { type: String, default: '' },
  targetUniv: { type: String, default: '' },
  gender: { type: String, default: '' },
  age: { type: Number, default: 18 },
  bio: { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
