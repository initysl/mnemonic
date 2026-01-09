'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen w-screen overflow-hidden text-neutral-100 changa'>
      <main className='flex-1 h-full w-full overflow-y-auto '>{children}</main>
    </div>
  );
}
