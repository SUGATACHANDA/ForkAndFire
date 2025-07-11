import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap'; // We no longer need to import ScrollTrigger
import emptyPlateImg from '../../assets/images/empty-plate.png';

const NotFoundPage = () => {
    // A ref for the main page container to scope our animations
    const pageRef = useRef(null);

    // --- The Simplified Animation Logic ---
    useEffect(() => {
        // Use a GSAP context for safe animation management and cleanup
        const ctx = gsap.context(() => {
            // Set the initial state of the page to be invisible.
            gsap.set(pageRef.current, { autoAlpha: 0 });
            // Set initial state for individual elements
            gsap.set(".plate-anim", { scale: 0.7, y: -50, autoAlpha: 0 });
            gsap.set(".text-anim", { y: 30, autoAlpha: 0 });
            gsap.set(".button-anim", { y: 20, autoAlpha: 0 });

            // Create a single timeline to control the entire entrance sequence.
            const tl = gsap.timeline({
                delay: 0.2, // A brief delay for a smoother page transition feel
                defaults: { ease: 'power3.out' }
            });

            // --- The Animation Sequence ---
            // 1. Fade in the entire page wrapper.
            tl.to(pageRef.current, {
                autoAlpha: 1,
                duration: 0.5
            })
                // 2. Animate the plate bouncing into view.
                .to(".plate-anim", {
                    scale: 1,
                    y: 0,
                    autoAlpha: 1,
                    duration: 1.5,
                    ease: 'elastic.out(1, 0.75)'
                }, "-=0.2") // Start slightly before the page fade-in finishes

                // 3. Stagger-animate the text elements into view.
                .to(".text-anim", {
                    y: 0,
                    autoAlpha: 1,
                    stagger: 0.15,
                    duration: 1
                }, "-=1.2") // Overlap significantly with the plate animation

                // 4. Stagger-animate the buttons into view last.
                .to(".button-anim", {
                    y: 0,
                    autoAlpha: 1,
                    stagger: 0.1,
                    duration: 0.8
                }, "-=0.8"); // Overlap with the text animation

        }, pageRef);

        // The cleanup function reverts all GSAP changes when the component unmounts.
        return () => ctx.revert();
    }, []); // Empty dependency array ensures this effect runs only once on mount.

    document.title = "404 Page not found - Fork & Fire"

    return (
        <div
            ref={pageRef}
            className="flex flex-col items-center -mt-10 justify-center min-h-screen bg-background text-center px-6 overflow-hidden"
            style={{ visibility: 'hidden' }} // GSAP's `autoAlpha` handles visibility
        >
            <div className="relative mb-6 plate-anim">
                {/* Plate and its shadow */}
                <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <div className="absolute inset-0 bg-black/10 rounded-full blur-xl"></div>
                    <img src={emptyPlateImg} alt="An empty plate with a fork and knife" className="relative w-full h-full drop-shadow-lg" />
                </div>
            </div>

            {/* --- Text Content now uses simple animation classes --- */}
            <div className="text-anim">
                <p className="font-semibold text-accent uppercase tracking-widest text-sm">Error 404</p>
                <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-primary-text mt-2">
                    This Page is Empty
                </h1>
            </div>

            <div className="text-anim">
                <p className="text-base md:text-lg text-secondary-text mt-3 max-w-md mx-auto">
                    It looks like the recipe you're looking for hasn't been served yet. Let's find you something else on the menu.
                </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                    to="/"
                    className="button-anim w-full sm:w-auto flex items-center justify-center gap-2 bg-accent text-white font-semibold py-2.5 px-6 rounded-md shadow-lg shadow-accent/20 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                >
                    <FontAwesomeIcon icon={faHouse} />
                    Go to Homepage
                </Link>
                <Link
                    to="/recipes"
                    className="button-anim w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary-text font-semibold py-2.5 px-6 rounded-md shadow-md hover:bg-gray-100 transition-colors"
                >
                    <FontAwesomeIcon icon={faUtensils} />
                    Browse Recipes
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;