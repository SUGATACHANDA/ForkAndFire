import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, children }) => {
    const backgroundRef = useRef(null);
    const modalWrapperRef = useRef(null);

    // === THE DEFINITIVE FIX IS IN THIS useEffect ===
    useEffect(() => {
        // A function to set the body's overflow style
        const setBodyOverflow = (overflowValue) => {
            document.body.style.overflow = overflowValue;
        };

        if (isOpen) {
            // Disable scrolling when modal is open
            setBodyOverflow('hidden');

            // Animate the modal in
            gsap.to(backgroundRef.current, { autoAlpha: 1, duration: 0.3 });
            gsap.fromTo(modalWrapperRef.current,
                { autoAlpha: 0, scale: 0.95, y: -20 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.1 }
            );
        } else {
            // Animate the modal out (optional, but good for UX)
            // Ensure refs are not null before animating
            if (backgroundRef.current && modalWrapperRef.current) {
                gsap.to(modalWrapperRef.current, {
                    autoAlpha: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        // Re-enable scrolling only AFTER the animation is complete
                        setBodyOverflow('auto');
                    }
                });
                gsap.to(backgroundRef.current, { autoAlpha: 0, duration: 0.3 });
            }
        }

        // --- The Cleanup Function ---
        // This function is GUARANTEED to run when the component unmounts.
        // This is the key to preventing the scroll lock bug.
        return () => {
            setBodyOverflow('auto'); // Always re-enable scrolling on cleanup
        };
    }, [isOpen]); // This effect depends only on the `isOpen` state

    // We can use a Portal here for better accessibility and to avoid z-index issues,
    // but for now, we'll keep the conditional render based on `isOpen`.
    // The visual effect of the fade-out is handled by GSAP before the component is removed.
    if (!isOpen && !gsap.isTweening(modalWrapperRef.current)) return null;


    return (
        // The semi-transparent background overlay
        <div
            ref={backgroundRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            style={{ visibility: isOpen ? 'visible' : 'hidden' }}
            onClick={onClose} // Clicking the backdrop closes the modal
        >
            <div
                ref={modalWrapperRef}
                className="relative" // It will be animated by GSAP
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:bg-gray-200 hover:scale-110 transition-all duration-200 ease-in-out z-10"
                    aria-label="Close modal"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Modal Content */}
                <div onClick={e => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;