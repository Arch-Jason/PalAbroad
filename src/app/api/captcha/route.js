import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sharp from 'sharp';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function secureRandomText(length = 6) {
    const bytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += CAPTCHA_CHARS[bytes[i] % CAPTCHA_CHARS.length];
    }

    return result;
}

function random(min, max) {
    return crypto.randomInt(min, max);
}

function generateCaptchaSvg(text) {
    const chars = text.split('');

    const textElements = chars.map((char, i) => {
        const x = 12 + i * 14;
        const y = random(24, 34);
        const rotate = random(-20, 20);

        return `
            <text
                x="${x}"
                y="${y}"
                transform="rotate(${rotate} ${x} ${y})"
                font-size="24"
                font-family="monospace"
                fill="#222"
            >${char}</text>
        `;
    }).join('');

    const noiseLines = Array.from({ length: 6 }).map(() => {
        return `
            <line
                x1="${random(0, 120)}"
                y1="${random(0, 40)}"
                x2="${random(0, 120)}"
                y2="${random(0, 40)}"
                stroke="#999"
                stroke-width="1"
            />
        `;
    }).join('');

    const noiseDots = Array.from({ length: 40 }).map(() => {
        return `
            <circle
                cx="${random(0, 120)}"
                cy="${random(0, 40)}"
                r="1"
                fill="#bbb"
            />
        `;
    }).join('');

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        ${noiseLines}
        ${noiseDots}
        ${textElements}
    </svg>
    `;
}

export async function GET() {
    const text = secureRandomText(6);

    const svg = generateCaptchaSvg(text);

    // SVG -> PNG
    const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

    // PNG -> base64
    const base64 =
        `data:image/png;base64,${pngBuffer.toString('base64')}`;

    const token = jwt.sign(
        { text },
        process.env.JWT_SECRET,
        {
            expiresIn: '5m',
        }
    );

    const response = NextResponse.json({
        image: base64,
    });

    response.cookies.set('captcha_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 300,
    });

    return response;
}