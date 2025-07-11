import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import Loader from '../../components/common/Loader';
import { gsap } from 'gsap';
import noResultsImage from '../../assets/images/no-results.png';

// --- Redesigned, Minimalist Product Card Sub-Component ---
const ProductCard = ({ product }) => {
    const isOutOfStock = product.amountLeft <= 0;

    return (
        // The Link now wraps the entire card, making the whole thing clickable.
        <Link
            to={isOutOfStock ? '#' : `/product/${product._id}`}
            className={`block group relative rounded-xl shadow-md overflow-hidden aspect-[4/5] bg-gray-100 ${isOutOfStock ? 'cursor-not-allowed' : ''
                }`}
        >
            {/* The Product Image */}
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
            />

            {/* --- The Hover Overlay --- */}
            {/* It starts invisible and fades in on group-hover. A gradient ensures text readability. */}
            <div
                className={`absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${isOutOfStock ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100'
                    }`}
            >
                <h3 className="text-xl font-bold font-serif">{product.name}</h3>

                <div className="mt-4 flex justify-between items-center">
                    {/* {isOutOfStock ? (
                        <span className="font-bold text-sm uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full">Sold Out</span>
                    ) : (
                        <p className="text-2xl font-bold font-serif">${product.price.toFixed(2)}</p>
                    )} */}

                    <div
                        className="text-primary-text w-full text-center bg-white font-semibold py-2 px-5 rounded-full transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0"
                    >
                        View Details
                    </div>
                </div>
            </div>

        </Link>
    );
};


// --- The Main Shop Page Component ---
const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    // Data fetching (no changes needed)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/api/products');
                // We still fetch all products, as we need `amountLeft` to determine stock status
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Sorry, we couldn't load the products right now. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // GSAP Entrance Animation (no changes needed)
    useEffect(() => {
        if (!loading && products.length > 0) {
            const ctx = gsap.context(() => {
                gsap.from(".product-card", {
                    y: 50, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out'
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, products]);

    // NOTE: `handleBuyNow` and `isBuyingId` state have been removed as they are no longer used on this page.

    return (
        <div className="bg-background">
            <div className="container mx-auto py-16 px-4 sm:px-6">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold font-serif text-primary-text tracking-tight">Our Kitchen Store</h1>
                    <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">A curated collection of goods, handcrafted with the same love that goes into our recipes.</p>
                </header>

                {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md mb-8">{error}</div>}

                <div ref={containerRef}>
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader /></div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {products.map(p => (
                                // The div for animation targeting remains, but the child is much simpler now
                                <div key={p._id} className="product-card">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center">
                            <img src={noResultsImage} alt="Nothing in the shop yet" className="w-64 h-64 mb-6" />
                            <h3 className="text-2xl font-semibold text-primary-text">Our Shelves are Currently Empty</h3>
                            <p className="text-secondary-text mt-2 max-w-md">We're busy in the kitchen crafting new things. Please check back soon for our curated goods!</p>
                            <Link to="/recipes" className="mt-6 bg-accent text-white font-semibold py-2 px-5 rounded-md hover:bg-opacity-90">Browse Recipes Instead</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;