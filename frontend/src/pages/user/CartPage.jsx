import React, { useEffect, useState, useCallback } from 'react';
import API from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faArrowLeft, faPlus, faMinus, faSpinner, faShoppingCart } from '@fortawesome/free-solid-svg-icons';


const CartPage = () => {
    const { userInfo } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceMap, setPriceMap] = useState({});
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/cart', {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });

            const items = Array.isArray(res.data) ? res.data : res.data?.cart || [];

            setCartItems(items);
            await fetchLivePrices(items);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [userInfo.token]);


    const fetchLivePrices = async (items) => {
        if (!Array.isArray(items)) {
            console.warn("fetchLivePrices: received non-array data", items);
            return;
        }

        const prices = {};
        await Promise.all(
            items.map(async (item) => {
                const priceId = item?.product?.paddlePriceId;
                const productId = item?.product?._id;

                if (priceId && productId) {
                    try {
                        const res = await API.get(`/api/paddle/price/${priceId}`);
                        prices[productId] = res.data;
                    } catch (err) {
                        console.warn(`❌ Failed to fetch live price for ${productId}:`, err);
                    }
                }
            })
        );

        setPriceMap(prices);
    };

    const updateQuantity = async (productId, newQuantity) => {
        const item = cartItems.find((ci) => ci.product._id === productId);
        if (!item || newQuantity < 1 || newQuantity > item.product.amountLeft) return;

        try {
            await API.put(
                `/api/cart/update`,
                { productId, quantity: newQuantity },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );
            setCartItems((prev) =>
                prev.map((ci) =>
                    ci.product._id === productId ? { ...ci, quantity: newQuantity } : ci
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const deleteItem = async (productId) => {
        try {
            await API.delete(`/api/cart/delete/${productId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });

            // remove the item locally by productId
            setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
        } catch (err) {
            console.error('Error removing item from cart:', err);
            alert("Couldn't remove item from cart.");
        }
    };

    useEffect(() => {
        if (userInfo.token) fetchCart();
    }, [fetchCart, userInfo.token]);

    const getItemTotal = (id, quantity) => {
        const price = priceMap[id]?.amount || 0;
        return (price / 100) * quantity;
    };

    const getTotal = () =>
        cartItems.reduce(
            (sum, item) => sum + getItemTotal(item.product._id, item.quantity),
            0
        );

    const handleCartCheckout = async () => {

        if (!userInfo) {
            navigate('/login', { state: { from: location } });
            return;
        }

        setIsCreatingCheckout(true);
        try {
            const { data } = await API.post(
                '/api/cart/checkout',
                {}, // backend pulls cart from DB using token
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );

            const { transactionId, checkoutUrl } = data;

            if (!transactionId || !checkoutUrl) {
                alert('Checkout failed. Missing transaction or checkout URL.');
                return;
            }

            if (window.Paddle) {
                window.Paddle.Environment.set(
                    import.meta.env.VITE_NODE_ENV === 'production' ? 'live' : 'sandbox'
                );

                window.Paddle.Initialize({
                    token: import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN, // required
                });

                window.Paddle.Checkout.open({
                    transactionId,
                    customer: {
                        email: userInfo.email
                    },
                    eventCallback: (eventData) => {
                        if (eventData.name === 'checkout.completed') {
                            const completedTransactionId = eventData.data?.id;
                            navigate(`/purchase-success?transaction_id=${completedTransactionId}`);
                        }
                    },
                });
            } else {
                // fallback: redirect manually
                window.location.href = checkoutUrl;
            }
        } catch (err) {
            console.error('Checkout failed:', err.response?.data || err.message);
            alert('Checkout failed: ' + (err.response?.data?.message || err.message));

        }
        finally {
            setIsCreatingCheckout(false);
        }
    };



    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader /></div>;

    if (!Array.isArray(cartItems) || cartItems.length === 0)
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-center text-gray-600">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <Link to="/shop" className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition">Browse Products</Link>
            </div>
        );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                <Link
                    to="/shop"
                    className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Shop
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
            <div className="grid gap-6">
                {cartItems.map((item) => {
                    const product = item.product;
                    const livePrice = priceMap[product._id];
                    const itemTotal = getItemTotal(product._id, item.quantity);

                    return (
                        <div key={item.product._id} className="flex flex-col md:flex-row items-center gap-4 border p-4 rounded-xl shadow-sm bg-white">
                            <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <h2 className="text-lg font-semibold">{product.name}</h2>
                                {/* <p className="text-sm text-gray-500">{product.description}</p> */}
                                <div className="text-gray-800 font-bold">
                                    Price: {livePrice ? `${(livePrice.amount / 100).toFixed(2)} ${livePrice.currency}` : 'Loading...'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="p-2 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                        disabled={item.quantity >= product.amountLeft}
                                        className="p-2 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="text-lg font-bold">
                                    Total: {itemTotal.toFixed(2)} {livePrice.currency}
                                </div>
                                <button
                                    onClick={() => deleteItem(item.product._id)}
                                    className="text-red-500 hover:underline flex items-center justify-end gap-1"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} /> Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col items-end space-y-4">
                <div className="text-2xl font-bold">
                    Total: {getTotal().toFixed(2)}
                </div>
                <button
                    className="w-full bg-accent text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:bg-accent/60 disabled:cursor-wait"
                    onClick={handleCartCheckout}
                    disabled={isCreatingCheckout}
                >
                    {loading ? (<FontAwesomeIcon icon={faSpinner} spin />) : (<FontAwesomeIcon icon={faShoppingCart} />)}
                    <span>{isCreatingCheckout ? 'Initializing Payment...' : `Buy Now `}</span>
                </button>
            </div>
        </div>
    );
};

export default CartPage;
