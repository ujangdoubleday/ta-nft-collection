import { UserDashboardContent } from '@/components/features/user/dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Dashboard | NFT Marketplace',
  description: 'Manage your NFT collections and account settings',
};

export default function UserDashboardPage() {
  return <UserDashboardContent />;
}
