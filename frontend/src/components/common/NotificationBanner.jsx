import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';

const NotificationBanner = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // This effect determines if the banner should be visible based on the current URL path.
    useEffect(() => {
        // Show the banner only if the path does NOT start with "/admin"
        const shouldBeVisible = !location.pathname.startsWith('/admin');
        setIsVisible(shouldBeVisible);
    }, [location.pathname]); // This dependency ensures the check runs on every navigation change.

    // This effect handles the slide-in/slide-out animation of the banner.
    useEffect(() => {
        gsap.to('#notification-banner', {
            y: isVisible ? '0%' : '-100%', // Move to y=0 when visible, and y=-100% when hidden
            autoAlpha: isVisible ? 1 : 0, // Animate opacity and visibility
            duration: 0.5,
            ease: 'power3.out',
            delay: isVisible ? 0.5 : 0 // Add a slight delay before it animates in
        });
    }, [isVisible]); // This dependency runs the animation whenever visibility changes.

    return (
        <div
            id="notification-banner"
            // The banner is fixed to the top of the viewport and hidden initially
            className="top-0 left-0 right-0 z-[60] bg-red-600 text-white transform -translate-y-full"
            style={{ visibility: 'hidden' }} // GSAP's autoAlpha will manage this for performance
        >
            <div className="container mx-auto px-4 sm:px-6 py-2.5">
                <div className="flex items-center justify-center text-center gap-2">
                    {/* Icon is hidden on extra-small screens */}
                    <FontAwesomeIcon icon={faEnvelope} className="hidden sm:block text-xl" />
                    <p className="flex-grow font-semibold text-sm">
                        <span className="font-bold">Never miss a thing!</span> Subscribe for free weekly recipes and tips.
                    </p>
                    <Link
                        to="/subscribe"
                        className="flex items-center gap-2 ml-2 shrink-0 bg-white text-red-600 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full hover:scale-105 hover:bg-red-50 transition-all duration-200"
                    >
                        Subscribe <FontAwesomeIcon icon={faArrowRight} className="hidden sm:block" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotificationBanner;