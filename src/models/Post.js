import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, 
  images: [{ type: String }],
  tags: [{ type: String }],
  comments: [CommentSchema],
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
