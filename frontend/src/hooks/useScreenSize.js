import { useState, useEffect } from 'react';

// A custom hook to track the window size and determine if it's a mobile view.
export const useScreenSize = () => {
    // We define our mobile breakpoint, matching Tailwind's 'lg' screen size.
    const MOBILE_BREAKPOINT = 1024;

    // A function to check if the current window width is below the breakpoint.
    const isMobileView = () => window.innerWidth < MOBILE_BREAKPOINT;

    // State to hold the result. Initialize it with the current value.
    const [isMobile, setIsMobile] = useState(isMobileView());

    useEffect(() => {
        // A function to be called on window resize.
        const handleResize = () => {
            setIsMobile(isMobileView());
        };

        // Add an event listener when the component mounts.
        window.addEventListener('resize', handleResize);

        // Cleanup function: remove the event listener when the component unmounts
        // to prevent memory leaks.
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array means this effect runs only once on mount and unmount.

    return isMobile;
};