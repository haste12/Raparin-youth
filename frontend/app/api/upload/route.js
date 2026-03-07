import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { verifyImageMagicBytes } from '@/lib/sanitize';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE      = 5 * 1024 * 1024; // 5 MB
const USE_BLOB      = !!(process.env.BLOB_READ_WRITE_TOKEN);

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 });
    }

    // ── Magic bytes check ──────────────────────────────────────────────────
    // Read the first 12 bytes to verify the real file type regardless of
    // what the browser claims in the Content-Type field.
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!verifyImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match the declared type. Upload rejected.' },
        { status: 400 }
      );
    }

    const ext      = getExt(file.type);
    // Safe filename — no user-controlled path components
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    if (USE_BLOB) {
      // ── Vercel Blob (production) ─────────────────────────────────────────
      const { put } = await import('@vercel/blob');
      const blob    = await put(`uploads/${filename}`, buffer, {
        access:      'public',
        contentType: file.type,
        // Prevent the browser from executing the file even if served directly
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
