// import React, { useState, useEffect, useRef } from 'react';
// import API from '../../api';
// import Loader from '../../components/common/Loader';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faDownload, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { Link, useSearchParams } from 'react-router-dom';
// import { gsap } from 'gsap';

// const MyOrdersPage = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Hooks to read URL parameters and manage them
//     const [searchParams, setSearchParams] = useSearchParams();

//     // Check if the page was loaded with a 'success' status
//     const isSuccessRedirect = searchParams.get('status') === 'success';

//     const successAlertRef = useRef(null);

//     useEffect(() => {
//         window.scrollTo(0, 0);
//         const fetchOrders = async () => {
//             setLoading(true);
//             try {
//                 const { data } = await API.get('/api/orders/my-orders');
//                 setOrders(data);
//             } catch (err) {
//                 console.log(err)
//                 setError("Could not load your order history.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOrders();
//     }, []);

//     // Effect to handle the one-time success message
//     useEffect(() => {
//         if (isSuccessRedirect) {
//             // Animate the success message appearing
//             gsap.fromTo(successAlertRef.current,
//                 { y: -20, autoAlpha: 0 },
//                 { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }
//             );

//             // Clean up the URL after showing the message so it doesn't appear on refresh
//             // We use a timeout to give the user time to see it.
//             const timer = setTimeout(() => {
//                 const newParams = new URLSearchParams(searchParams);
//                 newParams.delete('status');
//                 setSearchParams(newParams, { replace: true });
//             }, 5000); // The message will be visible for 5 seconds

//             return () => clearTimeout(timer);
//         }
//     }, [isSuccessRedirect, searchParams, setSearchParams]);

//     const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100);

//     return (
//         <div className="bg-background min-h-screen">
//             <div className="container mx-auto py-16 px-4 sm:px-6">
//                 <header className="text-center mb-12">
//                     <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-primary-text">My Orders</h1>
//                     <p className="mt-3 text-lg text-secondary-text">Your purchase history and product access.</p>
//                 </header>

//                 {/* --- The One-Time Success Alert --- */}
//                 {isSuccessRedirect && (
//                     <div ref={successAlertRef} className="bg-green-500 text-white font-semibold p-4 rounded-lg shadow-lg mb-8 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <FontAwesomeIcon icon={faCheckCircle} />
//                             <p>Thank you! Your order was successful and has been added to your list below.</p>
//                         </div>
//                         <button onClick={() => setSearchParams({}, { replace: true })} className="opacity-70 hover:opacity-100">
//                             <FontAwesomeIcon icon={faTimes} />
//                         </button>
//                     </div>
//                 )}

//                 <div className="max-w-4xl mx-auto">
//                     {loading ? (<div className="flex justify-center py-20"><Loader /></div>
//                     ) : error ? (<div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
//                     ) : orders.length > 0 ? (
//                         <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md divide-y divide-gray-200">
//                             {orders.map(order => (
//                                 <div key={order._id} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center py-4">
//                                     <div className="sm:col-span-1">
//                                         <img src={order.product?.imageUrl} alt={order.product?.name} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
//                                     </div>
//                                     <div className="sm:col-span-3">
//                                         <h3 className="font-bold font-serif text-lg text-primary-text">{order.product?.name || "Product Removed"}</h3>
//                                         <p className="text-sm text-secondary-text mt-1">Purchased: {new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Total: <span className="font-semibold">{formatPrice(order.purchasePrice, order.currency)}</span> | Quantity: <span className="font-semibold">{order.quantity}</span></p>
//                                     </div>
//                                     <div className="sm:col-span-1 flex flex-col items-stretch sm:items-end gap-2">

//                                         {order.product?.fileUrl && (
//                                             <a href={order.product.fileUrl} className="w-full text-center bg-accent text-white font-semibold text-sm py-2 px-3 rounded-md hover:bg-opacity-80">
//                                                 <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download
//                                             </a>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (<div className="text-center py-20 ...">No purchases yet.</div>)}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MyOrdersPage;

import React, { useState, useEffect, useRef } from "react";
import API from "../../api";
import Loader from "../../components/common/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faCheckCircle,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useSearchParams } from "react-router-dom";
import { gsap } from "gsap";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const isSuccessRedirect = searchParams.get("status") === "success";
    const successAlertRef = useRef(null);

    document.title = "Your Recent Orders | Fork & Fire"

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const [singleRes, cartRes] = await Promise.all([
                    API.get("/api/orders/my-orders"),
                    API.get("/api/orders/my-cart-orders"),
                ]);

                const singleOrders = Array.isArray(singleRes.data)
                    ? singleRes.data
                    : [];
                const cartOrders = Array.isArray(cartRes.data) ? cartRes.data : [];

                const merged = [
                    ...singleOrders.map((order) => ({ ...order, isCart: false })),
                    ...cartOrders.map((order) => ({ ...order, isCart: true })),
                ];

                // Sort all orders by purchase date (latest first)
                merged.sort(
                    (a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)
                );

                setOrders(merged);
            } catch (err) {
                console.error(err);
                setError("Could not load your order history.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (isSuccessRedirect) {
            gsap.fromTo(
                successAlertRef.current,
                { y: -20, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }
            );

            const timer = setTimeout(() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("status");
                setSearchParams(newParams, { replace: true });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccessRedirect, searchParams, setSearchParams]);

    const formatPrice = (amount, currency) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(amount / 100);

    const deduplicatedOrders = orders.reduce((acc, current) => {
        const isDuplicate = acc.some(order => order._id === current._id);
        if (!isDuplicate) acc.push(current);
        return acc;
    }, []);

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto py-16 px-4 sm:px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-primary-text">
                        My Orders
                    </h1>
                    <p className="mt-3 text-lg text-secondary-text">
                        Your purchase history and product access.
                    </p>
                </header>

                {isSuccessRedirect && (
                    <div
                        ref={successAlertRef}
                        className="bg-green-500 text-white font-semibold p-4 rounded-lg shadow-lg mb-8 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <p>
                                Thank you! Your order was successful and has been added to your
                                list below.
                            </p>
                        </div>
                        <button
                            onClick={() => setSearchParams({}, { replace: true })}
                            className="opacity-70 hover:opacity-100"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                )}

                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
                            {error}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md divide-y divide-gray-200">
                            {deduplicatedOrders.map(order => (
                                <div key={order._id} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center py-4">
                                    <div className="sm:col-span-1">
                                        {order.type === 'single' ? (
                                            <img src={order.product?.imageUrl} alt={order.product?.name} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
                                        ) : (
                                            <img src={order.items?.[0]?.product?.imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-lg shadow-sm" />
                                        )}
                                    </div>
                                    <div className="sm:col-span-3">
                                        {order.type === 'single' ? (
                                            <>
                                                <h3 className="font-bold font-serif text-lg text-primary-text">{order.product?.name || "Product Removed"}</h3>
                                                <p className="text-sm text-secondary-text mt-1">
                                                    Purchased: {new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} |
                                                    Total: <span className="font-semibold">{formatPrice(order.displayPrice, order.currency)}</span> |
                                                    Quantity: <span className="font-semibold">{order.quantity}</span>
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="font-bold font-serif text-lg text-primary-text">Cart Purchase ({order.items.length} items)</h3>
                                                <p className="text-sm text-secondary-text mt-1">
                                                    Purchased: {new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} |
                                                    Total: <span className="font-semibold">{formatPrice(order.displayPrice, order.currency)}</span>
                                                </p>
                                                <ul className="mt-2 text-sm text-gray-700">
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx}>• {item.product?.name || 'Unknown'} — <strong>Qty:</strong> {item.quantity}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                    <div className="sm:col-span-1 flex flex-col items-stretch sm:items-end gap-2">
                                        {order.type === 'single' && order.product?.fileUrl && (
                                            <a href={order.product.fileUrl} className="w-full text-center bg-accent text-white font-semibold text-sm py-2 px-3 rounded-md hover:bg-opacity-80">
                                                <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-secondary-text">
                            No purchases yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;
