import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = { title: 'Admin Dashboard – Raparin Youth' };

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!verifyToken(token)) {
    redirect('/admin');
  }

  return <AdminDashboardClient />;
}
