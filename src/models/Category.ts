import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  slug: String,
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);