import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { username, password, captcha } = await req.json();

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

    const user = await User.findOne({ username, password });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    response.cookies.set('token', token, { httpOnly: true });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
