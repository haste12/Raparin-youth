import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readActivities, writeActivities, getActivityById } from '@/lib/activities';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const activity = await getActivityById(id);
    if (!activity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(activity);
  } catch {
    return NextResponse.json({ error: 'Failed to read activity' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { titleEn, titleKu, date, shortDescEn, shortDescKu, contentEn, contentKu, coverImage, images, icon, color, youtubeUrl } = body;

    if (!titleEn || !date || !shortDescEn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await readActivities();
    const idx = data.activities.findIndex((a) => a.id === String(id));
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    data.activities[idx] = {
      ...data.activities[idx],
      titleEn: String(titleEn).trim(),
      titleKu: String(titleKu || '').trim(),
      date: String(date),
      shortDescEn: String(shortDescEn).trim(),
      shortDescKu: String(shortDescKu || '').trim(),
      contentEn: String(contentEn || '').trim(),
      contentKu: String(contentKu || '').trim(),
      coverImage: coverImage || null,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      icon: icon || data.activities[idx].icon || '📌',
      color: color || data.activities[idx].color || '#33AAFF',
      youtubeUrl: String(youtubeUrl || '').trim(),
      updatedAt: new Date().toISOString(),
    };

    await writeActivities(data);
    revalidatePath('/activities');
    return NextResponse.json(data.activities[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await readActivities();
    const idx = data.activities.findIndex((a) => a.id === String(id));
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    data.activities.splice(idx, 1);
    await writeActivities(data);
    revalidatePath('/activities');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
