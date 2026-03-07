import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const USE_BLOB = !!(process.env.BLOB_READ_WRITE_TOKEN);

/** Detect image MIME type from magic bytes — authoritative regardless of browser-reported type */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61) return 'image/gif';
  return null;
}

export async function POST(request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file     = formData.get('file');

    // ── Basic validation ───────────────────────────────────────────────────
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 });
    }

    // ── Magic bytes check — detect real type from content ─────────────────
    const buffer      = Buffer.from(await file.arrayBuffer());
    const detectedType = detectImageType(buffer);
    if (!detectedType) {
      return NextResponse.json(
        { error: 'Invalid file. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    const ext      = getExt(detectedType);
    // Safe filename — no user-controlled path components
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    if (USE_BLOB) {
      // ── Vercel Blob (production) ─────────────────────────────────────────
      const { put } = await import('@vercel/blob');
      const blob    = await put(`uploads/${filename}`, buffer, {
        access:      'public',
        contentType: detectedType,
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // ── Local filesystem (development) ───────────────────────────────────
      const fs   = await import('fs');
      const path = await import('path');
      const uploadDir = path.default.join(process.cwd(), 'public', 'uploads');
      if (!fs.default.existsSync(uploadDir)) {
        fs.default.mkdirSync(uploadDir, { recursive: true });
      }
      fs.default.writeFileSync(path.default.join(uploadDir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    }
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

function getExt(type) {
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg';
  if (type === 'image/png')  return 'png';
  if (type === 'image/webp') return 'webp';
  return 'gif';
}
