import React from 'react';

// Simplified SVG code for the Fork icon.
const ForkIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 2V13C7 15.2091 8.79086 17 11 17C13.2091 17 15 15.2091 15 13V2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 2V17" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 2L3 8.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 2L19 8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Simplified SVG code for the Flame icon.
const FlameIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.0001 2.5C12.0001 2.5 13.0001 5.38571 13.0001 7.21429C13.0001 9.04286 12.0001 11.5 12.0001 11.5C12.0001 11.5 11.0001 9.04286 11.0001 7.21429C11.0001 5.38571 12.0001 2.5 12.0001 2.5Z" />
        <path d="M14.2251 11.2375C15.1966 9.47963 17.5 7.64286 17.5 6C17.5 4.35714 15.6888 2.5 15.6888 2.5C15.6888 2.5 14.5422 6.55435 13.5707 8.31219C12.8228 9.60256 12.0001 11.5 12.0001 11.5L14.2251 11.2375Z" />
        <path d="M9.77519 11.2375C8.80368 9.47963 6.5 7.64286 6.5 6C6.5 4.35714 8.31124 2.5 8.31124 2.5C8.31124 2.5 9.45788 6.55435 10.4293 8.31219C11.1772 9.60256 12.0001 11.5 12.0001 11.5L9.77519 11.2375Z" />
        <path d="M12 21.5C12 21.5 9.77091 19.3333 8.78546 17.3913C7.8 15.4493 8 13.25 8 13.25C8 13.25 10.8291 15.9167 11.8145 17.8587C12.8 19.8007 12 21.5 12 21.5Z" />
        <path d="M12 21.5C12 21.5 14.2291 19.3333 15.2145 17.3913C16.2 15.4493 16 13.25 16 13.25C16 13.25 13.1709 15.9167 12.1855 17.8587C11.2 19.8007 12 21.5 12 21.5Z" />
    </svg>
);

const WelcomePreloader = () => {
    return (
        <div
            id="welcome-preloader"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background select-none"
        >
            <div className="flex flex-col items-center">
                {/* Icons will be animated to this container */}
                <div id="preloader-icons" className="flex items-center justify-center space-x-2 w-32 h-16 relative">
                    {/* The Fork Icon, positioned for animation */}
                    <div id="preloader-fork" className="absolute w-8 h-8 text-primary-text">
                        <ForkIcon />
                    </div>
                    {/* The Flame Icon, positioned for animation */}
                    <div id="preloader-flame" className="absolute w-8 h-8 text-accent">
                        <FlameIcon />
                    </div>
                </div>

                {/* Site name for reveal animation */}
                <h1 id="preloader-text" className="text-4xl font-serif font-bold text-primary-text text-center mt-4">
                    {"Fork & Fire".split('').map((char, index) => (
                        <span
                            key={index}
                            className="inline-block preloader-char"
                            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default WelcomePreloader;