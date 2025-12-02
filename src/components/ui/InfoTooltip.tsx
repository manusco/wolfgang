import { HelpCircle, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface InfoTooltipProps {
    content: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md';
}

export function InfoTooltip({ content, title, size = 'sm' }: InfoTooltipProps) {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={`inline-flex items-center justify-center rounded-full 
            bg-white/10 hover:bg-white/20 transition-colors border border-white/20
            ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`}
                    type="button"
                >
                    <HelpCircle className={`text-gray-400 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="bg-midnight-blue border border-white/30 rounded-lg p-4 
            max-w-xs shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    sideOffset={8}
                    side="top"
                >
                    {title && (
                        <h4 className="font-bold mb-2 text-sm text-white">{title}</h4>
                    )}
                    <div className="text-sm text-gray-300 leading-relaxed">
                        {content}
                    </div>
                    <Popover.Close className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </Popover.Close>
                    <Popover.Arrow className="fill-midnight-blue" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
