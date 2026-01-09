import { InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ className, label, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-sm text-gray-400 font-cinzel tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'bg-midnight-blue/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600',
                    'focus:outline-none focus:border-blood-red/50 focus:ring-1 focus:ring-blood-red/50',
                    'transition-all duration-200',
                    className
                )}
                {...props}
            />
        </div>
    );
}
