import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';
import { sanitize } from '@/lib/sanitize';
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

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const tag = searchParams.get('tag');
  const userId = searchParams.get('userId');

  let query = {};
  if (tag) query.tags = tag;
  if (userId) query.author = userId;
  if (search) {
    query.$or = [
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const posts = await Post.find(query)
    .populate('author', 'username highSchool currentCity targetUniv avatar')
    .populate({
        path: 'comments.author',
        select: 'username avatar',
        strictPopulate: false
    })
    .sort({ createdAt: -1 });

  return NextResponse.json(posts);
}

export async function POST(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content, tags, images, captcha } = await req.json();

    const captchaToken = req.cookies.get('captcha_token')?.value;
    if (!captchaToken) {
      return NextResponse.json({ error: '验证码已过期' }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
      if (decoded.text !== captcha) {
        return NextResponse.json({ error: '验证码错误' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: '验证码验证失败' }, { status: 400 });
    }

    const sanitizedContent = sanitize(content);
    const plainText = sanitizedContent.replace(/<[^>]*>?/gm, '');
    if (filter.isProfane(plainText)) {
      return NextResponse.json({ error: '内容包含不当词汇，请检查。' }, { status: 400 });
    }

    const post = await Post.create({ 
      author: userId, 
      content: sanitizedContent, 
      tags: tags || [], 
      images: images || [] 
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
