import React, { useState, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const BackToTopButton = () => {
    // State to control the button's visibility
    const [isVisible, setIsVisible] = useState(false);

    // Effect to listen for scroll events
    useEffect(() => {
        // Function to check scroll position
        const toggleVisibility = () => {
            // If the user has scrolled down more than 300px, show the button
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Add the scroll event listener when the component mounts
        window.addEventListener('scroll', toggleVisibility);

        // Cleanup function to remove the listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []); // Empty dependency array means this effect runs only on mount and unmount

    // Function to handle the smooth scroll to top
    const scrollToTop = () => {
        scroll.scrollToTop({
            duration: 800,       // Animation duration in ms
            smooth: 'easeInOutQuad' // Type of easing animation
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-6 right-6 w-12 h-12 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-xl z-50 transition-all duration-300 ease-in-out hover:bg-opacity-80 hover:scale-110 active:scale-95 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
                }`}
        >
            <FontAwesomeIcon icon={faArrowUp} />
        </button>
    );
};

export default BackToTopButton;