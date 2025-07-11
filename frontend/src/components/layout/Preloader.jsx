import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const Preloader = ({ fullScreen = false }) => {
    const preloaderRef = useRef(null);
    const iconRef = useRef(null);
    const textRef = useRef(null);

    // Array of engaging loading messages
    const loadingMessages = [
        "Simmering ideas...",
        "Prepping ingredients...",
        "Whisking to perfection...",
        "Setting the table...",
        "Adding the final garnish..."
    ];
    const [message, setMessage] = React.useState(loadingMessages[0]);

    // GSAP Animation Logic
    useEffect(() => {
        // Animation for the icon (a playful flip and move)
        const iconAnim = gsap.timeline({ repeat: -1, yoyo: true });
        iconAnim.to(iconRef.current, {
            y: -15,
            rotation: 15,
            duration: 0.6,
            ease: 'power1.inOut'
        }).to(iconRef.current, {
            y: 0,
            rotation: 0,
            duration: 0.6,
            ease: 'power1.inOut'
        });

        // Animation for the loading text (fade in/out)
        const textAnim = gsap.to(textRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true,
            onRepeat: () => {
                // Change the message on each cycle
                const randomIndex = Math.floor(Math.random() * loadingMessages.length);
                setMessage(loadingMessages[randomIndex]);
            }
        });

        // Cleanup animations when the component unmounts
        return () => {
            iconAnim.kill();
            textAnim.kill();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The component returns different JSX based on the `fullScreen` prop
    if (fullScreen) {
        return (
            <div
                ref={preloaderRef}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
            >
                <div ref={iconRef} className="w-16 h-16 text-accent">
                    {/* The Cooking Pot SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.25,9.38H2.75a.75.75,0,0,0,0,1.5H4V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V10.88h1.25a.75.75,0,0,0,0-1.5ZM18.5,18a1.5,1.5,0,0,1-1.5,1.5H7A1.5,1.5,0,0,1,5.5,18V10.88h13Z"></path>
                        <path d="M20,6H4A1,1,0,0,0,4,8H20A1,1,0,0,0,20,6Z"></path>
                    </svg>
                </div>
                <p ref={textRef} className="mt-4 text-lg font-semibold text-secondary-text">
                    {message}
                </p>
            </div>
        );
    }

    // Default: in-page loader
    return (
        <div ref={preloaderRef} className="flex flex-col items-center justify-center py-20">
            <div ref={iconRef} className="w-12 h-12 text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.25,9.38H2.75a.75.75,0,0,0,0,1.5H4V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V10.88h1.25a.75.75,0,0,0,0-1.5ZM18.5,18a1.5,1.5,0,0,1-1.5,1.5H7A1.5,1.5,0,0,1,5.5,18V10.88h13Z"></path><path d="M20,6H4A1,1,0,0,0,4,8H20A1,1,0,0,0,20,6Z"></path></svg>
            </div>
            <p ref={textRef} className="mt-4 text-md font-semibold text-secondary-text">
                {message}
            </p>
        </div>
    );
};

export default Preloader;