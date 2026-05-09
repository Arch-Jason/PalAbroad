import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

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
