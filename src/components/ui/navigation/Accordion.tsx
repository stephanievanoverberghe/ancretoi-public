'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * Accordéon accessible basé sur Radix pour FAQ et contenus repliables.
 */
export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
    ElementRef<typeof AccordionPrimitive.Item>,
    ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn(
            'overflow-hidden rounded-3xl border border-border bg-surface text-foreground shadow-soft transition-colors',
            'data-[state=open]:border-primary/25 data-[state=open]:bg-surface-raised',
            className,
        )}
        {...props}
    />
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

export const AccordionTrigger = forwardRef<
    ElementRef<typeof AccordionPrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                'group flex min-h-16 w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left',
                'text-base font-semibold leading-snug text-foreground transition-colors',
                'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                'sm:px-6 sm:py-5',
                className,
            )}
            {...props}
        >
            <span className="min-w-0 pt-1">{children}</span>
            <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-primary transition-transform group-data-[state=open]:rotate-180"
                aria-hidden="true"
            >
                <ChevronDown className="h-4 w-4" />
            </span>
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = forwardRef<
    ElementRef<typeof AccordionPrimitive.Content>,
    ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn(
            'overflow-hidden text-sm leading-relaxed text-muted-foreground',
            className,
        )}
        {...props}
    >
        <div className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
