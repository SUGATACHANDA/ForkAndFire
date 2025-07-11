import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import All UI & Content Components
import HeroSection from '../../components/ui/HeroSection';
import RecipeCard from '../../components/recipe/RecipeCard';
import CategoryCard from '../../components/ui/CategoryCard';
import AnimatedTitle from '../../components/ui/AnimatedTitle';
import Loader from '../../components/common/Loader';
import WelcomePreloader from '../../components/ui/WelcomePreloader';

// Import Static Images
import chefPortrait from '../../assets/images/chef-portrait.jpeg';
import aboutBg from '../../assets/images/about-bg.jpeg';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    // === State Management ===
    const [latestRecipes, setLatestRecipes] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [isApiLoading, setIsApiLoading] = useState(true);

    // This state controls the visibility of the one-time welcome preloader.
    // It initializes its value by checking sessionStorage once.
    const [showWelcomePreloader, setShowWelcomePreloader] = useState(
        () => !sessionStorage.getItem('hasVisitedForkAndFire')
    );

    // Ref for the main content area to scope GSAP animations
    const mainContentRef = useRef(null);

    // === Data Fetching Effect ===
    useEffect(() => {
        setIsApiLoading(true);
        const fetchData = async () => {
            try {
                const [recipesRes, categoriesRes] = await Promise.all([
                    API.get('/api/recipes?limit=6'),
                    API.get('/api/categories?limit=3'),
                ]);
                setLatestRecipes(recipesRes.data);
                setFeaturedCategories(categoriesRes.data);
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setIsApiLoading(false);
            }
        };
        fetchData();
    }, []);

    // === DEDICATED useEffect for the one-time Welcome Preloader animation ===
    useEffect(() => {
        // This effect only runs if the preloader needs to be shown
        if (showWelcomePreloader) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling during preloader

            const ctx = gsap.context(() => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        setShowWelcomePreloader(false);
                        sessionStorage.setItem('hasVisitedForkAndFire', 'true'); // Set the flag
                        document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                });

                // Set initial hidden states
                gsap.set(["#preloader-fork", "#preloader-flame", "#preloader-text"], { autoAlpha: 0 });
                gsap.set("#preloader-fork", { x: -10, rotation: -30 });
                gsap.set("#preloader-flame", { x: 10, rotation: 30 });
                gsap.set(".preloader-char", { yPercent: 110 });

                // The animation sequence
                tl.to("#preloader-fork", { autoAlpha: 1, x: 0, rotation: 0, duration: 1, ease: 'power3.out' })
                    .to("#preloader-flame", { autoAlpha: 1, x: 0, rotation: 0, duration: 1, ease: 'power3.out' }, "-=0.8")
                    .to("#preloader-flame", { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' }, ">-0.2")
                    .to("#preloader-text", { autoAlpha: 1, duration: 0.1 })
                    .to(".preloader-char", { yPercent: 0, stagger: 0.05, ease: 'back.out(1.7)', duration: 0.8 }, ">-0.1")
                    .to("#preloader-fork", { x: -70, rotation: -15, scale: 0.9, ease: 'power2.inOut', duration: 1 }, ">-0.5")
                    .to("#preloader-flame", { x: 70, rotation: 15, scale: 0.9, ease: 'power2.inOut', duration: 1 }, "<")
                    .to("#welcome-preloader", { autoAlpha: 0, duration: 1.2, ease: 'power2.inOut', delay: 1 });
            });

            return () => {
                ctx.revert();
                document.body.style.overflow = 'auto'; // Failsafe to restore scroll
            };
        }
    }, [showWelcomePreloader]); // Only runs when the preloader's visibility state changes

    // === DEDICATED useEffect for the page's on-scroll animations ===
    useEffect(() => {
        // Do not run animations until the preloader is finished AND API data has loaded.
        if (showWelcomePreloader || isApiLoading || !mainContentRef.current) return;

        const ctx = gsap.context(() => {
            // Cards animation
            gsap.from(".stagger-card", {
                y: 100, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: ".stagger-container", start: "top 85%" }
            });

            // "About" section animation
            gsap.from(".about-anim", {
                y: 50, autoAlpha: 0, stagger: 0.2, duration: 1,
                scrollTrigger: { trigger: "#about-section", start: "top 75%" }
            });

            // "About" section parallax background
            gsap.to("#about-bg-image", {
                backgroundPosition: "50% 100%", ease: "none",
                scrollTrigger: { trigger: "#about-section", start: "top bottom", end: "bottom top", scrub: true }
            });

        }, mainContentRef);
        return () => ctx.revert();
    }, [isApiLoading, showWelcomePreloader]); // Re-runs if loading or preloader state changes

    // Dummy image URLs for categories. In a real app, this might come from the CMS.
    const categoryImageUrls = [
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1680172800885-61c5f1fc188e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1605926637512-c8b131444a4b?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ];

    document.title = "Fork & Fire | A World of Taste, One Fork at a Time"

    return (
        <div ref={mainContentRef}>
            {showWelcomePreloader && <WelcomePreloader />}

            <main style={{ visibility: showWelcomePreloader ? 'hidden' : 'visible' }}>
                <HeroSection />

                <section id="featured-categories" className="py-24 bg-background">
                    <div className="container mx-auto px-6 text-center">
                        <AnimatedTitle>Explore by Category</AnimatedTitle>
                        <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">Find inspiration from our curated collections for every occasion.</p>
                        <div className="stagger-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            {isApiLoading ? (<div className="col-span-full"><Loader /></div>) : (
                                featuredCategories.map((cat, index) => (
                                    <div key={cat._id} className="stagger-card"><CategoryCard category={cat} imageUrl={categoryImageUrls[index]} /></div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section id="recipes-section" className="py-24">
                    <div className="container mx-auto px-6 text-center">
                        <AnimatedTitle>Latest & Greatest Recipes</AnimatedTitle>
                        <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">Fresh from the kitchen, check out our newest additions.</p>
                        <div className="stagger-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
                            {isApiLoading ? (<div className="col-span-full"><Loader /></div>) : (
                                latestRecipes.map(recipe => (
                                    <div key={recipe._id} className="stagger-card"><RecipeCard recipe={recipe} /></div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section id="about-section" className="relative py-32 overflow-hidden">
                    <div id="about-bg-image" className="absolute inset-0 bg-no-repeat bg-cover bg-center z-0" style={{ backgroundImage: `url(${aboutBg})` }}></div>
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10"></div>
                    <div className="container mx-auto px-6 relative z-20"><div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"><div className="about-anim"><img src={chefPortrait} alt="Portrait of the chef" className="rounded-xl shadow-2xl w-full max-w-md mx-auto" /></div><div className="text-center md:text-left"><h3 className="about-anim text-sm font-bold text-accent uppercase tracking-widest">A Passion For Food</h3><h2 className="about-anim text-4xl md:text-5xl font-serif font-bold mt-2">Cooking is a language everyone can understand.</h2><p className="about-anim text-secondary-text text-lg mt-6 leading-relaxed">Welcome to Fork & Fire! What started as a personal cooking journal has blossomed into a community for food lovers. Every recipe is crafted with love, tested for simplicity, and designed to inspire you in your own kitchen.</p></div></div></div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;