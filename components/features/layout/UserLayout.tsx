'use client';

import { Container } from '@/components/core/layout/container';
import UserNavbar from '@/components/features/user/layout/UserNavbar';
import { UserFooter } from '@/components/features/user/layout/UserFooter';
import { UserAuthGuard } from '@/components/features/user/auth';

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <>
      <UserNavbar />
      <Container className="py-6 flex-grow">
        <UserAuthGuard>{children}</UserAuthGuard>
      </Container>
      <UserFooter />
    </>
  );
}
