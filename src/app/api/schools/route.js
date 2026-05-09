import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'universities' or 'highschools'

  let fileName = '';
  if (type === 'universities') {
    fileName = 'Universities.csv';
  } else if (type === 'highschools') {
    fileName = 'HighSchools.csv';
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    // Skip header
    const data = lines.slice(1).map(line => {
      // Basic CSV parsing, handle potential BOM
      const cleanLine = line.replace(/^\uFEFF/, '');
      const parts = cleanLine.split(';');
      const name = parts[0]?.trim();
      const subName = parts[1]?.trim();
      return { name, subName };
    }).filter(item => item.name);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading schools file:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
