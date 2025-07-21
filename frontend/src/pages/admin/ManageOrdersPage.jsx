import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { Link } from 'react-router-dom';

const OrderModal = ({ order, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        try {
            setLoading(true);
            await onComplete(order); // call the function from parent
            setLoading(false);
            onClose(); // optional: close the modal after marking complete
        } catch (err) {
            console.error("Error marking order complete:", err);
            setLoading(false);
        }
    };
    useEffect(() => {
        document.body.classList.add("modal-open", "overflow-hidden");
        return () => {
            document.body.classList.remove("modal-open", "overflow-hidden");
        };
    }, []);

    if (!order) return null;

    const products = order.type === "single" && order.product
        ? [{ product: order.product, quantity: order.quantity || 1 }]
        : Array.isArray(order.items)
            ? order.items
            : [];

    const handleBackdropClick = (e) => {
        if (e.target.id === "modal-container") {
            onClose();
        }
    };

    return (
        <div
            id="modal-container"
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative m-4 sm:m-0 border border-gray-200 animate-fade-in">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Order for <span className="text-accent">#{order.orderid || order._id}</span>
                </h2>

                <div className="border-b pb-1 flex justify-between items-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    <span>Product</span>
                    <span>Quantity</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mt-2">
                    {products.length > 0 ? (
                        products.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center text-sm border-b pb-2"
                            >
                                <Link
                                    to={`/product/${item.product?._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-accent hover:underline font-medium"
                                >
                                    {item.product?.name || "Deleted Product"}
                                </Link>
                                <span className="text-gray-700">x{item.quantity}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            No products in this order.
                        </div>
                    )}
                </div>
                {!order.markAsComplete && (
                    <div className="border-t p-4 flex justify-center">
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                        >
                            {loading ? "Marking..." : "Mark as Complete"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderRow = React.memo(({ order, onView }) => {
    const formatPrice = (amount, currency) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format((amount || 0) / 100);

    const isNew = Date.now() - new Date(order.purchasedAt).getTime() < 86400000;

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors text-sm">
            <td className="px-4 py-3 font-mono text-xs text-gray-800">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{order.orderId}</p>
                    {(!order.markAsComplete && isNew) && (
                        <img
                            src="/assets/new-badge.gif"
                            alt="New"
                            className="w-5 h-5 animate-bounce"
                        />
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-gray-700">
                {new Date(order.purchasedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </td>
            <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{order.user?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(order)}
                        className="text-sm text-white p-2 rounded-md bg-accent hover:opacity-90"
                    >
                        View Order
                    </button>
                </div>
            </td>
            <td className="px-4 py-3 font-semibold text-green-700">
                {formatPrice(order.displayPrice, order.currency)}
            </td>
            <td className="px-4 py-3 text-xs text-gray-500 break-words max-w-[150px]">
                {order.paddleTransactionId || '-'}
            </td>
        </tr>
    );
});

const ManageOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    document.title = "Manage All Your Orders | Fork & Fire";

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data } = await API.get('/api/orders/all-orders', {
                params: {
                    search: searchTerm,
                    sort: sortOrder,
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });

            setOrders(data.orders || []);
            setTotalOrders(data.totalOrders || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortOrder, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleMarkComplete = async (order) => {
        try {
            await API.put(`/api/orders/${order.type}/${order._id}/complete`);
            fetchOrders();
        } catch (err) {
            console.error("Failed to mark order as complete:", err);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-screen-xl mx-auto">
            <header className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Customer Orders</h1>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search by Order ID or Transaction ID"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />

                        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 shadow-sm">
                            {['desc', 'asc'].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setSortOrder(value);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${sortOrder === value
                                        ? 'bg-accent text-white shadow'
                                        : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    {value === 'desc' ? 'Newest First' : 'Oldest First'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            Page <span className="font-semibold text-primary-text">{currentPage}</span> of{' '}
                            <span className="font-semibold text-primary-text">
                                {Math.ceil(totalOrders / itemsPerPage) || 1}
                            </span>
                        </p>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalOrders}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => {
                                if (page !== currentPage) setCurrentPage(page);
                            }}
                        />
                    </div>
                </div>
            </header>

            <div className={`overflow-auto rounded-md shadow border border-gray-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <table className="min-w-full text-sm text-left bg-white">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Order Date</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Product(s)</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Transaction ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className='py-10 text-center' colSpan='6'>
                                    <Loader />
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <OrderRow
                                    key={order._id}
                                    order={order}
                                    onView={(order) => setSelectedOrder(order)}
                                    onMarkComplete={handleMarkComplete}
                                />
                            ))
                        )}
                    </tbody>
                </table>

                {orders.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500">No orders found.</div>
                )}
            </div>

            {error && (
                <div className="text-red-600 text-sm p-4 bg-red-100 border border-red-300 rounded-md">
                    {error}
                </div>
            )}

            {selectedOrder && <OrderModal order={selectedOrder} onComplete={handleMarkComplete} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};

export default ManageOrdersPage;
