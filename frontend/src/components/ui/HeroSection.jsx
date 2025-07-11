import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link as ScrollLink } from 'react-scroll';
import SplitType from 'split-type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import heroImage from '../../assets/images/hero-bg.jpg'; // Your beautiful background image
import grainOverlay from '../../assets/images/grain-overlay.png'; // The new grain texture

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
    const sectionRef = useRef(null);
    const bgImageRef = useRef(null);

    useEffect(() => {
        // Create a GSAP Context for safe cleanup
        const ctx = gsap.context(() => {

            // Split the text into words for the reveal animation
            const title = new SplitType('.reveal-text', { types: 'words' });

            // Animate each word
            const tl = gsap.timeline({
                defaults: { ease: 'power4.out', duration: 1.5 },
                delay: 0.5
            });

            tl.from(title.words, {
                yPercent: 120, // Move words down by 120% of their own height
                skewY: 5,
                stagger: 0.05,
            })
                .from(".hero-tagline", { y: 30, opacity: 0, duration: 1 }, "-=1.2")
                .from(".hero-button", { y: 30, opacity: 0, duration: 1 }, "-=1")
                .from(".scroll-indicator", { y: -30, opacity: 0, duration: 1 }, "-=0.8");

            // Ken Burns Effect on the background
            gsap.to(bgImageRef.current, {
                scale: 1.15,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5,
                },
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="h-screen w-full relative flex items-center justify-center overflow-hidden"
        >
            {/* The Background Image Container */}
            <div ref={bgImageRef} className="absolute inset-0 z-0">
                <img
                    src={heroImage}
                    alt="Delicious food background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* New: Grainy Texture Overlay */}
            <div
                className="absolute inset-0 z-10 opacity-10"
                style={{ backgroundImage: `url(${grainOverlay})` }}
            ></div>

            {/* A more subtle gradient overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

            {/* The Main Content */}
            <div className="relative z-20 text-center text-white px-4 md:px-8">
                {/* 
                  The text is now wrapped in a container. The text itself is in a `<span>`
                  and has a parent with `overflow: hidden` to create the reveal effect.
                */}
                <h1 className="reveal-text text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-shadow-md">
                    Simple Recipes, <br className="md:hidden" /> Made with Love.
                </h1>

                <p className="hero-tagline text-lg md:text-xl text-white/90 mt-6 max-w-xl mx-auto text-shadow">
                    Find joy in every bite. Our kitchen is your kitchen.
                </p>

                {/* Updated Button Style */}
                <div className="hero-button mt-8">
                    <ScrollLink
                        to="recipes-section"
                        spy={true}
                        smooth={true}
                        offset={-70}
                        duration={800}
                        className="cursor-pointer inline-block bg-accent text-white font-bold tracking-wide uppercase px-8 py-3.5 rounded-md text-sm shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        Explore Recipes
                    </ScrollLink>
                </div>
            </div>

            {/* New: Animated Scroll Down Indicator */}
            <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                <ScrollLink
                    to="recipes-section"
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={800}
                    className="cursor-pointer text-white/70 hover:text-white transition-colors"
                    aria-label="Scroll to recipes"
                >
                    <FontAwesomeIcon icon={faChevronDown} className="h-6 animate-bounce" />
                </ScrollLink>
            </div>
        </section>
    );
};

// Add this to your tailwind.config.js to get text-shadow utilities
// theme: { extend: { textShadow: { md: '0 2px 4px rgb(0 0 0 / 0.30)' } } }
// plugins: [ require('tailwindcss-textshadow') ] // after `npm i -D tailwindcss-textshadow`

export default HeroSection;