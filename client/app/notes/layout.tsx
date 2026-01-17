'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-neutral-50 text-neutral-600'>
        <Image
          src='/mnemonic.svg'
          alt='Mnemonic Logo'
          width={100}
          height={100}
          className='animate-pulse'
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='flex h-screen w-screen overflow-hidden text-neutral-100 changa'>
      <main className='flex-1 h-full w-full overflow-y-auto '>{children}</main>
    </div>
  );
}
