import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const post = await Post.findById(params.id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Validate ownership
    if (post.author.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Post.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
