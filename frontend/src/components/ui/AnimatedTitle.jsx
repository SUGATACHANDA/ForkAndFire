import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedTitle = ({ children, tag = 'h2', className = '' }) => {
    const TitleTag = tag;
    const titleRef = useRef(null);

    const baseClasses = "font-serif font-bold text-primary-text"; // Add base text color
    const tagClasses = {
        h1: 'text-5xl md:text-6xl',
        h2: 'text-4xl md:text-5xl',
        h3: 'text-3xl',
    };

    useEffect(() => {
        const el = titleRef.current;
        if (!el) return;

        // Use a more robust fromTo animation.
        // It's generally safer than a simple .from() with ScrollTrigger.
        gsap.fromTo(el,
            { y: 50, autoAlpha: 0 }, // Start state: moved down and invisible
            {
                y: 0,
                autoAlpha: 1, // End state: at original position and fully visible
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    // By removing `toggleActions`, the animation will play once
                    // when it enters view and stay that way. This is more reliable.
                }
            }
        );
    }, []);

    return (
        <TitleTag
            ref={titleRef}
            // Ensure any passed classNames are included
            className={`${baseClasses} ${tagClasses[tag] || ''} ${className}`}
        >
            {children}
        </TitleTag>
    );
};

export default AnimatedTitle;