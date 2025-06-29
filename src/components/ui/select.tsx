'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;

export function SelectTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
        className={cn(
            'inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
            className
        )}
        {...props}
        >
        {children}
        <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
        </SelectPrimitive.Trigger>
    );
    }

    export const SelectValue = SelectPrimitive.Value;

    export function SelectContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            className={cn(
            'z-50 min-w-[8rem] rounded-md border border-gray-200 bg-white shadow-md',
            className
            )}
            {...props}
        >
            <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
    }

    export function SelectItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
            className
        )}
        {...props}
        >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute right-2">
            <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}
