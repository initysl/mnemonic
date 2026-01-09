'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export default function AppSidebar() {
  return (
    <aside className='p-5 w-64 border-r border-neutral-800 bg-neutral-900 text-white'>
      <div className='text-lg font-semibold'>Mnemonic</div>

      <nav className='space-y-1 p-5'>
        <SidebarItem label='All Notes' />
        <SidebarItem label='Search' />

        {/* Nested Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-neutral-800 rounded'>
            Tags
            <ChevronDown size={14} />
          </CollapsibleTrigger>

          <CollapsibleContent className='pl-4 space-y-1'>
            <SidebarItem label='Work' />
            <SidebarItem label='Personal' />
            <SidebarItem label='Ideas' />
          </CollapsibleContent>
        </Collapsible>

        <SidebarItem label='Settings' />
      </nav>
    </aside>
  );
}

function SidebarItem({ label }: { label: string }) {
  return (
    <div className='px-3 py-2 rounded text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer'>
      {label}
    </div>
  );
}
