'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

const ShinyButton = forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',

          // Shiny animation
          'overflow-hidden bg-size-[200%_100%] bg-no-repeat',
          'animate-[bg-shine_2.1s_linear_infinite]',

          // Light mode gradient
          'bg-[linear-gradient(110deg,#FFF,45%,#E4E4E7,55%,#FFF)]',
          'text-zinc-800 border border-zinc-300 shadow',

          // Dark mode gradient
          'dark:bg-[linear-gradient(110deg,#09090B,45%,#27272A,55%,#09090B)]',
          'dark:text-zinc-200 dark:border-zinc-800',

          className
        )}
        style={{
          animation: 'bg-shine 2.1s linear infinite',
        }}
      >
        <style jsx>{`
          @keyframes bg-shine {
            from {
              background-position: 0 0;
            }
            to {
              background-position: -200% 0;
            }
          }
        `}</style>
        {children}
      </button>
    );
  }
);

ShinyButton.displayName = 'ShinyButton';

export default ShinyButton;
