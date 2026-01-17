import LandingPage from '@/components/landing/LandingPage';
import { auth0 } from '@/lib/auth0';

export default async function Page() {
  const session = await auth0.getSession();

  return <LandingPage user={session?.user ?? null} />;
}
