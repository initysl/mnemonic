'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Auth0Provider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Auth0Provider>
    </ThemeProvider>
  );
}
