import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePaddle } from '../../hooks/usePaddle';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
    const { cart, removeFromCart, setCart } = useAuth(); // Get cart state and functions from global context
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- Paddle Integration ---
    const handleCheckoutComplete = useCallback(() => {
        // After a successful cart purchase, the webhook will clear the cart in the DB.
        // We clear it on the frontend here and redirect.
        setCart([]);
        navigate('/my-orders?status=success');
    }, [navigate, setCart]);

    const isPaddleReady = usePaddle(handleCheckoutComplete);

    // --- Calculations ---
    const subtotal = useMemo(() => {
        if (!cart || cart.length === 0) return 0;
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [cart]);

    // --- Handlers ---
    const handleRemove = (productId) => {
        // Call the remove function from the context, which handles API call and state update
        removeFromCart(productId);
    };

    const handleCheckout = async () => {
        if (!isPaddleReady) {
            setError("Payment system is still initializing. Please wait a moment.");
            return;
        }

        setIsCheckingOut(true);
        setError('');
        try {
            // Call the dedicated cart checkout endpoint
            const { data } = await API.post('/api/paddle/create-cart-checkout');
            if (data.transactionId) {
                window.Paddle.Checkout.open({ transactionId: data.transactionId });
            } else {
                throw new Error('Failed to get transaction from server.');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not start checkout. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };


    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto py-16 px-4 sm:px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-primary-text">Your Shopping Cart</h1>
                </header>

                {cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                        {/* --- Cart Items --- */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm space-y-4">
                            {cart.map(item => (
                                <div key={item.product._id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
                                    <div className="flex-grow">
                                        <h3 className="font-bold font-serif text-lg text-primary-text">{item.product.name}</h3>
                                        <p className="text-sm text-secondary-text">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg text-primary-text">${(item.product.price * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => handleRemove(item.product._id)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- Order Summary --- */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm sticky top-28">
                            <h2 className="text-2xl font-bold font-serif border-b pb-4 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-secondary-text"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-secondary-text"><span>Shipping & Tax</span><span>Calculated at checkout</span></div>
                                <div className="flex justify-between font-bold text-lg text-primary-text border-t pt-3 mt-3"><span>Grand Total</span><span>${subtotal.toFixed(2)}</span></div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut || !isPaddleReady}
                                className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all disabled:bg-accent/60 disabled:cursor-wait"
                            >
                                {isCheckingOut || !isPaddleReady ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Proceed to Checkout'}
                            </button>
                            {error && <p className="text-center text-red-500 text-sm mt-3">{error}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
                        <FontAwesomeIcon icon={faShoppingBag} className="text-5xl text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-primary-text">Your Cart is Empty</h2>
                        <p className="text-secondary-text mt-2">Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/shop" className="mt-6 inline-block bg-accent text-white font-bold py-2.5 px-6 rounded-md hover:bg-opacity-90">
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;