import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-blood-red text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]',
        secondary: 'bg-midnight-blue border border-white/10 text-white hover:bg-white/5',
        danger: 'bg-red-900/50 text-red-200 border border-red-500/20 hover:bg-red-900/70',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-bold tracking-wider uppercase',
    };

    return (
        <button
            className={cn(
                'rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                'font-cinzel',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
