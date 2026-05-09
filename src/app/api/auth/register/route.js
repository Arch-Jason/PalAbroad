import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { username, password, captcha } = await req.json();

    // Note: In a real app, verify captcha here using the logic from react-simple-captcha
    // For this boilerplate, we assume captcha is handled on frontend or basic validation.

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const user = await User.create({ username, password }); // In production, hash the password!
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    const response = NextResponse.json({ message: 'User registered successfully', userId: user._id }, { status: 201 });
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
