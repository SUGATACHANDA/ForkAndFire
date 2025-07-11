import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This is a "component" that renders nothing, but its entire purpose is
// to run a side effect (scrolling) whenever the route changes.
const ScrollToTop = () => {
    // Extracts the pathname from the current location object.
    // e.g., "/", "/recipes", "/recipe/123"
    const { pathname } = useLocation();

    // The useEffect hook will run every time the `pathname` changes.
    useEffect(() => {
        try {
            // Attempt to scroll to the top of the page.
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' // Use 'smooth' for a scrolling animation, 'instant' for immediate jump
            });
        } catch (error) {
            console.log(error)
            // A fallback for older browsers that don't support the options object
            window.scrollTo(0, 0);
        }
    }, [pathname]); // The dependency array ensures this effect runs ONLY when the pathname changes.

    // This component does not render any JSX.
    return null;
};

export default ScrollToTop;