import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { usePaddle } from '../../hooks/usePaddle';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faBoxOpen,
    faExclamationTriangle,
    faSpinner,
    faMinus,
    faPlus,
    faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';

const ProductPage = () => {
    // === Hooks and State ===
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useAuth();

    const [product, setProduct] = useState(null);
    const [livePrice, setLivePrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [checkoutError, setCheckoutError] = useState(null);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const mainRef = useRef(null);

    // === Paddle Integration Setup ===
    const handleCheckoutComplete = useCallback((transactionData) => {
        // From a modern Paddle Billing 'checkout.completed' event, the ID is here:
        const transactionId = transactionData.transaction_id || transactionData.id;

        if (transactionId) {
            console.log(`Purchase complete! Transaction: ${transactionId}. Redirecting to success page...`);

            // Navigate DIRECTLY to the purchase success page, passing the
            // transaction ID as a URL parameter. The success page will handle polling.
            navigate(`/purchase-success?transaction_id=${transactionId}`);

        } else {
            console.error("Checkout completed, but no transaction_id was found in the event data.", transactionData);
            // As a failsafe, send the user to their general orders page.
            navigate('/my-orders');
        }
    }, [navigate]);

    const isPaddleReady = usePaddle(handleCheckoutComplete);

    // === Data Fetching Effects ===
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setLivePrice(null); // Reset on new product navigation
            try {
                const { data } = await API.get(`/api/products/${id}`);
                setProduct(data);
            } catch (err) {
                console.log(err)
                setPageError("Sorry, this product could not be found.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        // Fetch live price only after product data is loaded and user is logged in
        if (product && product.paddlePriceId && userInfo) {
            const fetchLivePrice = async () => {
                try {
                    const { data } = await API.get(`/api/paddle/price/${product.paddlePriceId}`);
                    setLivePrice(data);
                } catch (error) {
                    console.error("Could not fetch live price, falling back to DB price.", error);
                }
            };
            fetchLivePrice();
        }
    }, [product, userInfo]);

    // === Animation Effect ===
    useEffect(() => {
        if (!loading && product) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".product-anim", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.15, duration: 1, ease: 'power3.out' });
            }, mainRef);
            return () => ctx.revert();
        }
    }, [loading, product]);

    // === Event Handlers ===
    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, Math.min(prev + amount, product?.amountLeft || 1)));
    };

    const handleBuyNow = async () => {
        if (!userInfo) { navigate('/login', { state: { from: location } }); return; }
        if (isCreatingCheckout || !isPaddleReady) {
            if (!isPaddleReady) setCheckoutError("Payment system is not loaded yet. Please wait.");
            return;
        }

        setIsCreatingCheckout(true);
        setCheckoutError(null);

        try {
            // 1. Get the transaction ID from our backend (no change here).
            const { data } = await API.post(`/api/products/${id}/checkout`, { quantity });

            if (data && data.transactionId) {
                // --- THE DEFINITIVE FIX IS HERE ---

                // 2. We now do the full setup and open inside the click handler.
                // This completely bypasses the problematic `Paddle.Initialize` call.
                if (window.Paddle) {

                    // A. Set the environment directly.
                    window.Paddle.Environment.set(import.meta.env.VITE_NODE_ENV === 'production' ? 'live' : 'sandbox');

                    // B. Call Checkout.open with ALL necessary details inline.
                    window.Paddle.Checkout.open({
                        transactionId: data.transactionId,
                        // Provide the token DIRECTLY here.
                        token: import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN,
                        eventCallback: (eventData) => {
                            if (eventData.name === 'checkout.completed') {
                                const transactionId = eventData.data?.id || eventData.data?.transaction_id;
                                console.log(`Purchase complete! ID: ${transactionId}. Redirecting...`);
                                // Navigate to your success/orders page
                                navigate(`/my-orders?purchase=success`);
                            }
                        }
                    });
                } else {
                    throw new Error("Paddle.js failed to load on the window object.");
                }
            } else {
                throw new Error("Did not receive a valid transaction from the server.");
            }
        } catch (err) {
            setCheckoutError(err.response?.data?.message || err.message || 'Could not initiate purchase.');
        } finally {
            setIsCreatingCheckout(false);
        }
    };

    // --- RENDER LOGIC ---
    if (loading) return <div className="min-h-screen pt-20 flex justify-center"><Loader /></div>;
    if (pageError) return <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-600 bg-red-50 p-8"><FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-4" /><h2 className="text-2xl font-bold">{pageError}</h2><Link to="/shop" className="mt-6 text-sm font-semibold underline">Back to Shop</Link></div>;
    if (!product) return null;

    const { name, description, imageUrl, amountLeft } = product;
    const isOutOfStock = amountLeft <= 0;

    const displayPrice = livePrice ? (livePrice.amount / 100).toFixed(2) : product.price.toFixed(2);
    const displayCurrency = livePrice?.currency;

    return (
        <div ref={mainRef} className="bg-background">
            <div className="container mx-auto px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    <div className="product-anim lg:sticky lg:top-28 w-full aspect-square rounded-xl shadow-2xl overflow-hidden">
                        <img src={imageUrl} alt={`Image of ${name}`} className="w-full h-full object-cover" />
                    </div>

                    <div className="product-anim lg:col-start-2">
                        <div className="space-y-4">
                            <Link to="/shop" className="text-sm font-semibold text-accent uppercase tracking-wider hover:underline">Our Kitchen Store</Link>
                            <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-primary-text leading-tight">{name}</h1>
                            <div>
                                <p className="text-4xl font-serif text-primary-text pt-2 h-14 flex items-center">
                                    {!userInfo ? <><div className='text-2xl'>
                                        <Link to={'/login'} state={{ from: location }} className='text-accent'>Login </Link> to see price
                                    </div></> : !livePrice && !isOutOfStock ?
                                        (<span className="text-2xl text-gray-400 animate-pulse">Verifying price...</span>) :
                                        (`${displayPrice}`)
                                    }
                                    <span className="text-lg text-secondary-text ml-2">{!userInfo ? '' : displayCurrency}</span>
                                </p>
                                <p className="flex items-center gap-2 text-base text-secondary-text mt-2">
                                    <FontAwesomeIcon icon={faGlobe} />
                                    <span>Final price shown in your local currency at checkout.</span>
                                </p>
                            </div>
                            <div className="prose text-secondary-text max-w-none leading-relaxed pt-2"><p>{description}</p></div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            {isOutOfStock ? (
                                <div className="w-full text-center p-4 bg-gray-100 text-gray-500 font-bold rounded-lg flex items-center justify-center gap-3"><FontAwesomeIcon icon={faBoxOpen} />Temporarily Sold Out</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between"><label className="font-semibold text-primary-text">Quantity:</label><div className="flex items-center border border-gray-300 rounded-md overflow-hidden"><button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-10 h-10 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors" aria-label="Decrease quantity"><FontAwesomeIcon icon={faMinus} size="xs" /></button><span className="w-12 h-10 text-center font-bold text-lg flex items-center justify-center border-x">{quantity}</span><button onClick={() => handleQuantityChange(1)} disabled={quantity >= amountLeft} className="w-10 h-10 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors" aria-label="Increase quantity"><FontAwesomeIcon icon={faPlus} size="xs" /></button></div></div>
                                    <button onClick={handleBuyNow} disabled={isCreatingCheckout || !isPaddleReady} className="w-full bg-accent text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:bg-accent/60 disabled:cursor-wait">
                                        {isCreatingCheckout || !isPaddleReady ? (<FontAwesomeIcon icon={faSpinner} spin />) : (<FontAwesomeIcon icon={faShoppingCart} />)}
                                        <span>{isCreatingCheckout ? 'Initializing...' : !isPaddleReady ? 'Loading Payment...' : `Buy Now (${quantity})`}</span>
                                    </button>
                                    {amountLeft < 10 && (
                                        <p className="text-center text-sm text-red-600 font-semibold animate-pulse">Only {amountLeft} left in stock - order soon!</p>
                                    )}

                                </div>
                            )}
                            {checkoutError && (
                                <div className="text-center mt-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-2"><FontAwesomeIcon icon={faExclamationTriangle} />{checkoutError}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;