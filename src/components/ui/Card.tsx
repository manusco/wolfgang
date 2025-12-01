import { HTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-deep-purple/80 backdrop-blur-md border border-white/5 rounded-xl p-6',
                'shadow-xl shadow-black/50',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
