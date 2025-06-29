'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
    return (
        <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <DialogPrimitive.Content
            className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-lg',
            className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute top-4 right-4 text-gray-500 hover:text-black">
            <X size={20} />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
    }

export function DialogHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
return <div className={cn('mb-4', className)}>{children}</div>;
}

export function DialogTitle({ children, className }: React.HTMLAttributes<HTMLHeadingElement>) {
return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: React.HTMLAttributes<HTMLParagraphElement>) {
return <p className={cn('text-sm text-gray-500', className)}>{children}</p>;
}
