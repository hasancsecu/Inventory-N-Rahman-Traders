import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ChangePasswordClient } from './change-password-client';

export const metadata: Metadata = {
  title: 'পাসওয়ার্ড পরিবর্তন • Change Password • LUBRIFLOW ERP',
  description: 'Self-service account password update for authorized LUBRIFLOW ERP dealership staff.',
};

export default async function ChangePasswordPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return <ChangePasswordClient currentUser={currentUser} />;
}
