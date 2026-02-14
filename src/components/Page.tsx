import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PageProps {
    children?: React.ReactNode;
    number?: number;
    className?: string;
    style?: React.CSSProperties;
    /** When true, content fills the page without padding (for canvas pages) */
    fullBleed?: boolean;
}

const Page = forwardRef<HTMLDivElement, PageProps>((props, ref) => {
    return (
        <div
            className={cn(
                "bg-gradient-to-br from-[#fffef9] via-white to-[#fffaf0] shadow-2xl ring-1 ring-blue-50/60 rounded-md border-l border-gray-200/60 h-full w-full overflow-hidden relative",
                props.className
            )}
            ref={ref}
            style={props.style}
        >
            {/* Paper texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-[0.15] pointer-events-none z-10 mix-blend-multiply" />

            {/* Subtle grain effect */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Inner shadow for depth */}
            <div className="absolute inset-0 shadow-inner pointer-events-none z-10"
                style={{
                    boxShadow: 'inset 5px 0 15px -5px rgba(0,0,0,0.08), inset 0 5px 10px -5px rgba(0,0,0,0.05)'
                }}
            />

            {/* Content */}
            <div className={cn(
                "h-full w-full relative z-20",
                props.fullBleed ? "p-0" : "p-6"
            )}>
                {props.children}
            </div>

            {/* Page number */}
            {props.number !== undefined && props.number > 0 && (
                <div className="absolute bottom-5 right-6 text-gray-400/80 font-serif text-xs select-none z-30 flex items-center gap-2">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                    <span className="font-medium">{props.number}</span>
                </div>
            )}
        </div>
    );
});

Page.displayName = 'Page';

export default Page;
