import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    req,
    { params }
) {
    const { name } = await params;

    const filePath = path.join(process.cwd(), 'public', 'uploads', name);

    if (!fs.existsSync(filePath)) {
        return new Response('Not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name}"`,
        },
    });
}