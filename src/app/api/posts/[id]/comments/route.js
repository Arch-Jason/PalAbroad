import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Filter } from 'bad-words';

const filter = new Filter();

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

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content, images } = await req.json();
    const plainText = content.replace(/<[^>]*>?/gm, '');
    if (filter.isProfane(plainText)) {
      return NextResponse.json({ error: '评论包含不当词汇。' }, { status: 400 });
    }

    const post = await Post.findById(params.id);
    if (!post) return NextResponse.json({ error: '动态未找到' }, { status: 404 });

    post.comments.push({
      author: userId,
      content,
      images: images || []
    });

    await post.save();
    
    // Return the updated comments list or just the new comment
    const updatedPost = await Post.findById(params.id).populate({
        path: 'comments.author',
        select: 'username avatar',
        strictPopulate: false
    });
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
