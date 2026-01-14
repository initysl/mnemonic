import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className='bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          href='/'
          className='flex items-center gap-2 self-center font-medium'
        >
          <div className='shadow-sm flex size-6 items-center justify-center rounded-md'>
            <Image src='/mnemonic.svg' alt='Mnemonic' width={20} height={20} />
          </div>
          Mnemonic
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
