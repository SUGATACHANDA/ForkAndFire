import React from 'react';

// This is an inline SVG, which gives us direct control over its parts with CSS.
const AnimatedPotIcon = () => {
    // We add keyframe animations directly in the component for encapsulation.
    const styles = `
        @keyframes simmer {
            0%, 100% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes bubble1 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
            50% { transform: translateY(-15px) scale(1.1); opacity: 0; }
        }
        @keyframes bubble2 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
            40% { transform: translateY(-18px) scale(1.05); opacity: 0; }
        }
        .pot { animation: simmer 2s ease-in-out infinite; transform-origin: bottom center; }
        .bubble-1 { animation: bubble1 1.5s ease-in-out infinite; animation-delay: 0s; }
        .bubble-2 { animation: bubble2 1.5s ease-in-out infinite; animation-delay: 0.5s; }
    `;

    return (
        <>
            <style>{styles}</style>
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-text mb-4"
            >
                {/* Steam/Bubbles */}
                <circle cx="10" cy="8" r="1" fill="currentColor" className="bubble-1" opacity="0.8" />
                <circle cx="14" cy="9" r="1.5" fill="currentColor" className="bubble-2" opacity="0.8" />

                {/* Pot */}
                <path
                    d="M3 12C3 9.79086 4.79086 8 7 8H17C19.2091 8 21 9.79086 21 12V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pot"
                />
                {/* Pot Lid Handle */}
                <path d="M10 5.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </>
    );
};

export default AnimatedPotIcon;