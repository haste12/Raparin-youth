import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readActivities, writeActivities } from '@/lib/activities';
import { verifyAdminToken } from '@/lib/auth';

export async function GET() {
  try {
    const data = await readActivities();
    return NextResponse.json(data.activities);
  } catch {
    return NextResponse.json({ error: 'Failed to read activities' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { titleEn, titleKu, date, shortDescEn, shortDescKu, contentEn, contentKu, coverImage, images, icon, color, youtubeUrl } = body;

    if (!titleEn || !date || !shortDescEn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await readActivities();
    const newActivity = {
      id: Date.now().toString(),
      titleEn: String(titleEn).trim(),
      titleKu: String(titleKu || '').trim(),
      date: String(date),
      shortDescEn: String(shortDescEn).trim(),
      shortDescKu: String(shortDescKu || '').trim(),
      contentEn: String(contentEn || '').trim(),
      contentKu: String(contentKu || '').trim(),
      coverImage: coverImage || null,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      icon: icon || '📌',
      color: color || '#33AAFF',
      youtubeUrl: String(youtubeUrl || '').trim(),
      createdAt: new Date().toISOString(),
    };

    data.activities.unshift(newActivity);
    await writeActivities(data);
    revalidatePath('/activities');
    return NextResponse.json(newActivity, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
