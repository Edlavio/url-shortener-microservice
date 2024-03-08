import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, min: 1, required: true, unique: true },
});

export const Url = mongoose.model('Url', schema);
