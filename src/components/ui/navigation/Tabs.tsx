'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * Onglets accessibles basés sur Radix. À utiliser pour organiser des surfaces
 * denses sans faire porter la logique métier au composant d'interface.
 */
export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.List
            ref={ref}
            className={cn(
                'flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-muted p-1 text-sm shadow-soft',
                '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                className,
            )}
            {...props}
        />
    ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                'inline-flex min-h-11 min-w-fit cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold text-muted-foreground transition-colors',
                'hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                'disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-soft',
                className,
            )}
            {...props}
        />
    ),
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.Content
            ref={ref}
            className={cn('mt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:mt-6', className)}
            {...props}
        />
    ),
);
TabsContent.displayName = TabsPrimitive.Content.displayName;
