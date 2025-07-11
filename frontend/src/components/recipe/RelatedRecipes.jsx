import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';
import RecipeCard from './RecipeCard';
import AnimatedTitle from '../ui/AnimatedTitle';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RelatedRecipes = ({ categoryId, currentRecipeId }) => {
    const [relatedRecipes, setRelatedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);

    useEffect(() => {
        // Guard clause: do nothing if we don't have a category to filter by.
        if (!categoryId) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchRelated = async () => {
            setLoading(true);
            try {
                // === THE FIX IS HERE ===
                // We ask for 4 recipes from the API.
                // Why 4? Because one of them MIGHT be the current recipe we are viewing.
                // By asking for one more than we need to display (3), we ensure
                // we have enough items even after filtering.
                const { data } = await API.get(`/api/recipes?category=${categoryId}&limit=4`, { signal });

                // Filter out the current recipe from the list on the client-side.
                const filteredData = data.filter(recipe => recipe._id !== currentRecipeId);

                // Take the first 3 items from the filtered list.
                setRelatedRecipes(filteredData.slice(0, 3));

            } catch (error) {
                if (error.name !== 'CanceledError') {
                    console.error("Failed to fetch related recipes", error);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchRelated();

        return () => controller.abort();

    }, [categoryId, currentRecipeId]); // Re-run effect if props change.

    // GSAP Animation for the cards in this section
    useEffect(() => {
        if (!loading && relatedRecipes.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(sectionRef.current.querySelectorAll(".related-recipe-card"),
                    { y: 50, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        stagger: 0.2,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 80%"
                        }
                    }
                );
            }, sectionRef);
            return () => ctx.revert();
        }
    }, [loading, relatedRecipes]);

    // Don't render the section at all if there are no related recipes.
    if (relatedRecipes.length === 0) {
        return null;
    }

    return (
        <section ref={sectionRef} className="py-24 border-t border-gray-200">
            <div className="text-center">
                <AnimatedTitle>More From This Category</AnimatedTitle>
                <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">
                    If you enjoyed this recipe, you might also love these!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mt-12">
                {relatedRecipes.map(recipe => (
                    // Add a class for GSAP to target
                    <div className="related-recipe-card" key={recipe._id}>
                        <RecipeCard recipe={recipe} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RelatedRecipes;