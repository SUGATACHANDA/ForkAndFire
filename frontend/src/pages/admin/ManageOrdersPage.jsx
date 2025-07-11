import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../api';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDown } from '@fortawesome/free-solid-svg-icons';

// A memoized sub-component for a single table row to optimize re-renders.
const OrderRow = React.memo(({ order }) => {
    const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format((amount || 0) / 100);
    return (
        <tr className="bg-white border-b hover:bg-gray-50/50 align-middle transition-colors">
            <td className="px-6 py-4 font-semibold text-gray-800">{new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td className="px-6 py-4"><div className="font-medium text-gray-900">{order.user?.name || 'N/A'}</div><div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div></td>
            <td className="px-6 py-4 font-medium text-gray-800"><Link to={`/product/${order.product?._id}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">{order.product?.name || <span className="text-red-500 italic">Product Deleted</span>}</Link></td>
            <td className="px-6 py-4 font-bold text-center">{order.quantity}</td>
            <td className="px-6 py-4 font-semibold text-green-700">{formatPrice(order.purchasePrice, order.currency)}</td>
            <td className="px-6 py-4 text-xs text-gray-500">{order.paddleTransactionId}</td>
        </tr>
    );
});


const ManageOrdersPage = () => {
    // --- State Management for Pagination ---
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Using a ref to track the offset is a common pattern to avoid state-related race conditions in the fetch function.
    const currentOffset = useRef(0);
    const ordersPerPage = 5; // Define your page size here

    // --- Data Fetching Function using limit and offset ---
    const fetchOrders = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
            currentOffset.current = 0; // Reset offset for initial load
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const { data } = await API.get(`/api/orders/all-orders?limit=${ordersPerPage}&offset=${currentOffset.current}`);

            if (data.orders) {
                // Append new orders to the existing list, or start a new list
                setOrders(prev => isInitialLoad ? data.orders : [...prev, ...data.orders]);
                setTotalOrders(data.total);

                const newTotalLoaded = (isInitialLoad ? 0 : orders.length) + data.orders.length;
                // We have more to load if the total we have is still less than the grand total
                setHasMore(newTotalLoaded < data.total);

                // Update the offset for the next call
                currentOffset.current = newTotalLoaded;
            }
        } catch (err) {
            console.log(err)
            setError('Could not load order history.');
        } finally {
            if (isInitialLoad) setLoading(false);
            setLoadingMore(false);
        }
    }, [orders.length]); // Dependency on `orders.length` is for recalculating offset, though ref handles it mainly.

    // Fetch initial data on component mount
    useEffect(() => {
        fetchOrders(true); // `true` indicates it's the initial load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;
    if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">All Customer Orders</h1>
                <p className="text-gray-500 mt-1">
                    Showing <span className="font-bold text-primary-text">{orders.length}</span> of <span className="font-bold text-primary-text">{totalOrders}</span> total orders.
                </p>
            </header>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order Date</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Product</th>
                            <th scope="col" className="px-6 py-3 text-center">Qty</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (<OrderRow key={order._id} order={order} />))}
                    </tbody>
                </table>
                {orders.length === 0 && !loading && (
                    <p className="text-center p-8 text-gray-500">There are no orders yet.</p>
                )}
            </div>

            {/* --- "Load More" Button Section --- */}
            {hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => fetchOrders()}
                        disabled={loadingMore}
                        className="bg-accent text-white font-semibold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 mx-auto disabled:bg-accent/50 disabled:cursor-wait"
                    >
                        {loadingMore ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faAngleDown} />
                        )}
                        <span>{loadingMore ? 'Loading...' : 'Load More Orders'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageOrdersPage;