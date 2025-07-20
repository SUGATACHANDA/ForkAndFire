import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHeart, faMugHot } from '@fortawesome/free-solid-svg-icons';

// Import all the images
import heroImage from '../../assets/images/about-hero.jpg';
import portraitImage from '../../assets/images/chef-portrait.jpeg';
import gallery1 from '../../assets/images/gallery-1.jpg';
import gallery2 from '../../assets/images/gallery-2.jpg';
import gallery3 from '../../assets/images/gallery-3.jpg';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
    const pageRef = useRef(null);

    document.title = "Our Story | Fork & Fire"

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero text animation
            gsap.from(".hero-anim", { y: 40, opacity: 0, stagger: 0.2, duration: 1, ease: 'power3.out', delay: 0.5 });

            // On-scroll animations for sections
            const animateOnScroll = (selector) => {
                gsap.utils.toArray(selector).forEach((elem) => {
                    gsap.from(elem, {
                        y: 50, autoAlpha: 0, duration: 1, ease: 'power3.out',
                        scrollTrigger: { trigger: elem, start: "top 85%" }
                    });
                });
            };

            animateOnScroll('.section-anim');
            animateOnScroll('.philosophy-card');
            animateOnScroll('.gallery-image');

        }, pageRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={pageRef}>
            {/* --- HERO SECTION --- */}
            <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center text-white text-center px-6">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img src={heroImage} alt="A beautifully set dinner table" className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative z-20">
                    <h1 className="hero-anim text-4xl sm:text-5xl md:text-7xl font-extrabold font-serif tracking-tight">
                        Our Story is a Recipe
                    </h1>
                    <p className="hero-anim text-lg md:text-xl text-white/90 mt-4 max-w-2xl mx-auto">
                        It’s made with simple ingredients: passion, patience, and a little bit of fire.
                    </p>
                </div>
            </section>

            {/* --- THE FOUNDER'S STORY --- */}
            <section className="py-20 md:py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="section-anim">
                            <img src={portraitImage} alt="Portrait of Sugata, the chef" className="rounded-xl shadow-2xl object-cover w-full h-full" />
                        </div>
                        <div className="section-anim">
                            <p className="font-semibold text-accent uppercase tracking-widest">A Letter from the Kitchen</p>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-2 mb-6">Hello, I'm Sugata.</h2>
                            <div className="space-y-4 text-secondary-text leading-relaxed">
                                <p>
                                    Welcome to my little corner of the internet, Fork & Fire Kitchen. For as long as I can remember, the kitchen has been my happy place. It’s where scattered ingredients transform into something that can bring joy, comfort, and conversation. It’s where a simple flame can turn a basic meal into a cherished memory.
                                </p>
                                <p>
                                    This blog started as a personal journal—a place to jot down family recipes and new experiments. But it quickly grew into something more: a community. My goal isn't just to share recipes, but to share the *joy* of the process. I believe everyone can create magic in their own kitchen, and I'm here to show you how, one delicious step at a time.
                                </p>
                                <p className="font-serif italic text-accent text-2xl pt-2">Thank you for being here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- OUR PHILOSOPHY --- */}
            <section className="py-20 md:py-24 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <div className="section-anim">
                        <h2 className="text-4xl font-serif font-bold text-primary-text">Our Cooking Philosophy</h2>
                        <p className="mt-4 text-lg text-secondary-text max-w-3xl mx-auto">
                            We believe great food doesn’t have to be complicated. It should be honest, joyful, and made with heart.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 mt-16 max-w-5xl mx-auto">
                        <div className="philosophy-card text-center p-6">
                            <FontAwesomeIcon icon={faLeaf} className="text-4xl text-accent mb-4" />
                            <h3 className="text-xl font-bold font-serif">Simple Ingredients</h3>
                            <p className="text-secondary-text mt-2 text-sm">We focus on fresh, seasonal, and accessible ingredients that let the natural flavors shine.</p>
                        </div>
                        <div className="philosophy-card text-center p-6">
                            <FontAwesomeIcon icon={faHeart} className="text-4xl text-accent mb-4" />
                            <h3 className="text-xl font-bold font-serif">Recipes with Soul</h3>
                            <p className="text-secondary-text mt-2 text-sm">Every recipe has a story. We aim to create dishes that are not just food, but memories.</p>
                        </div>
                        <div className="philosophy-card text-center p-6">
                            <FontAwesomeIcon icon={faMugHot} className="text-4xl text-accent mb-4" />
                            <h3 className="text-xl font-bold font-serif">A Joyful Process</h3>
                            <p className="text-secondary-text mt-2 text-sm">Cooking should be a relaxing and creative act, not a chore. Our steps are clear and tested.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- GALLERY / BEHIND THE SCENES --- */}
            <section className="py-20 md:py-24 bg-background">
                <div className="container mx-auto px-6 text-center">
                    <div className="section-anim">
                        <h2 className="text-4xl font-serif font-bold text-primary-text">From Our Kitchen</h2>
                        <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">A little peek behind the scenes at the process, passion, and fresh ingredients that go into every recipe.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="gallery-image lg:col-span-2 row-span-2 rounded-xl overflow-hidden"><img src={gallery1} alt="Kneading dough" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                        <div className="gallery-image rounded-xl overflow-hidden"><img src={gallery2} alt="Fresh vegetables" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                        <div className="gallery-image rounded-xl overflow-hidden"><img src={gallery3} alt="A bowl of soup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CALL TO ACTION --- */}
            <section className="bg-white text-center py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-serif font-bold text-primary-text">Ready to Start Cooking?</h2>
                    <p className="text-lg text-secondary-text mt-2">Explore our collection of tested and cherished recipes.</p>
                    <Link to="/recipes" className="mt-8 inline-block bg-accent text-white font-bold tracking-wide uppercase px-8 py-3 rounded-full text-sm hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
                        Browse All Recipes
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;