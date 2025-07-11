import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faCheck } from '@fortawesome/free-solid-svg-icons';

// The key we'll use in localStorage to remember the user's choice.
const COOKIE_CONSENT_KEY = 'userCookieConsent';

const CookieConsent = () => {
    // --- State and Hooks ---
    // State to control the visibility of the banner.
    const [isVisible, setIsVisible] = useState(false);
    // Hook to check the current URL path.
    const location = useLocation();
    // Ref for the banner element for GSAP animation.
    const bannerRef = useRef(null);

    // This effect runs once when the app loads to decide if the banner should be shown.
    useEffect(() => {
        // --- Condition 1: Never show on admin routes ---
        if (location.pathname.startsWith('/admin')) {
            setIsVisible(false);
            return;
        }

        // --- Condition 2: Check if the user has already made a choice ---
        const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);

        // If no choice has been recorded, show the banner.
        if (!consentGiven) {
            // We use a small delay to prevent the banner from appearing too abruptly.
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500); // 1.5 second delay

            return () => clearTimeout(timer);
        }
    }, [location.pathname]); // Re-evaluate if the route changes

    // Animation effect for the banner's appearance
    useEffect(() => {
        if (isVisible) {
            gsap.fromTo(bannerRef.current,
                { y: '100%' }, // Start below the viewport
                { y: '0%', duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [isVisible]);

    // --- Event Handlers ---
    const handleConsent = (consent) => {
        // Animate the banner out
        gsap.to(bannerRef.current, {
            y: '100%',
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                // After animation, hide the component and save the choice.
                setIsVisible(false);
                // We save the decision (e.g., "accepted" or "declined") and a timestamp.
                localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
                    status: consent,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    };

    // If the banner should not be visible, render nothing.
    if (!isVisible) {
        return null;
    }

    // --- Render Logic ---
    return (
        <div
            ref={bannerRef}
            className="fixed bottom-0 left-0 right-0 z-[99] bg-white/80 backdrop-blur-md shadow-2xl-top p-4 translate-y-full"
        // Note: The `shadow-2xl-top` is a custom utility you might want to add. See below.
        >
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* --- Left Side: Text Content --- */}
                <div className="flex items-center gap-4 text-center sm:text-left">
                    <FontAwesomeIcon icon={faCookieBite} className="hidden sm:block text-4xl text-accent" />
                    <div>
                        <h3 className="font-bold text-primary-text">We Use Cookies</h3>
                        <p className="text-sm text-secondary-text mt-1 max-w-lg">
                            Our website uses cookies to enhance your browsing experience, and to analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                        </p>
                    </div>
                </div>

                {/* --- Right Side: Buttons --- */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => handleConsent('declined')}
                        className="font-semibold text-secondary-text px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => handleConsent('accepted')}
                        className="flex items-center gap-2 font-semibold text-white bg-accent px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;