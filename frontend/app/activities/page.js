import { readActivities } from '@/lib/activities';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivitiesPageContent from './ActivitiesPageContent';
import ActivitiesScrollTop from './ActivitiesScrollTop';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Activities | Raparin Youth Organization',
  description: 'Discover the programs and events run by the Raparin Youth Organization.',
};

export default async function ActivitiesPage() {
  const data = await readActivities();
  const activities = data.activities;

  return (
    <main>
      <Navbar activeSection="activities" />
      <ActivitiesPageContent activities={activities} />
      <Footer />
      <ActivitiesScrollTop />
    </main>
  );
}
