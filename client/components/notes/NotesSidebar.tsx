'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Hash,
  FileText,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotesSidebar() {
  return (
    <div className='p-4 space-y-6'>
      {/* Views Section */}
      <SidebarSection title='Views' defaultOpen>
        <SidebarItem
          label='All Notes'
          icon={FileText}
          href='/dashboard/all-notes'
        />
        <SidebarItem
          label='Daily Notes'
          icon={Calendar}
          href='/dashboard/daily'
        />
      </SidebarSection>

      {/* Tags Section */}
      <SidebarSection title='Tags'>
        <SidebarItem
          label='work'
          icon={Hash}
          href='/dashboard/all-notes?tag=work'
        />
        <SidebarItem
          label='personal'
          icon={Hash}
          href='/dashboard/all-notes?tag=personal'
        />
        <SidebarItem
          label='ideas'
          icon={Hash}
          href='/dashboard/all-notes?tag=ideas'
        />
      </SidebarSection>
    </div>
  );
}

function SidebarSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className='flex items-center gap-2 w-full text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors'>
        {isOpen ? (
          <ChevronDown className='h-3 w-3' />
        ) : (
          <ChevronRight className='h-3 w-3' />
        )}
        {title}
      </CollapsibleTrigger>

      <CollapsibleContent className='mt-2 space-y-1'>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItem({
  label,
  icon: Icon,
  href,
}: {
  label: string;
  icon?: any;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.includes(`tag=${label}`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </Link>
  );
}
