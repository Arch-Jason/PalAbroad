import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

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

function isValidSchool(type, schoolName) {
  if (!schoolName) return true; // Allow empty
  const fileName = type === 'universities' ? 'Universities.csv' : 'HighSchools.csv';
  try {
    const filePath = path.join(process.cwd(), fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    // Check if schoolName exists in the first column of any data line
    return lines.slice(1).some(line => {
      const cleanLine = line.replace(/^\uFEFF/, '');
      const [name] = cleanLine.split(';').map(s => s.trim());
      return name === schoolName;
    });
  } catch (err) {
    console.error('Error validating school:', err);
    return false;
  }
}

export async function GET(req) {
  await dbConnect();
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await User.findById(userId).select('-password');
  return NextResponse.json(user);
}

export async function PUT(req) {
  await dbConnect();
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Validate schools
  if (body.highSchool && !isValidSchool('highschools', body.highSchool)) {
    return NextResponse.json({ error: '请从列表选择有效的高中名称' }, { status: 400 });
  }
  if (body.targetUniv && !isValidSchool('universities', body.targetUniv)) {
    return NextResponse.json({ error: '请从列表选择有效的大学名称' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(userId, { ...body, isProfileComplete: true }, { new: true });
  return NextResponse.json(user);
}
