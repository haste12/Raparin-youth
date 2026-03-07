import { notFound } from 'next/navigation';
import { getActivityById } from '@/lib/activities';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ActivityDetailClient from './ActivityDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) return { title: 'Activity Not Found' };
  return {
    title: `${activity.titleKu || activity.titleEn} | Raparin Youth`,
    description: activity.shortDescKu || activity.shortDescEn,
  };
}

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  return (
    <main>
      <Navbar activeSection="activities" />
      <ActivityDetailClient activity={activity} />
      <Footer />
    </main>
  );
}
