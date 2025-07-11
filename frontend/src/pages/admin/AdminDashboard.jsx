import React, { useState, useEffect } from "react";
import API from "../../api";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faUsers,
    faTag,
    faQuestionCircle,
    faComments,
    faArrowRight,
    faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

// A reusable UI component for the statistic cards at the top of the dashboard.
const StatCard = ({ title, value, icon, colorClass }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className={`text-3xl p-3 rounded-full ${colorClass}`}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { userInfo } = useAuth();

    // State for dashboard data
    const [stats, setStats] = useState(null);
    const [recentComments, setRecentComments] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all necessary dashboard data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch stats and recent comments concurrently for better performance
                const [statsRes, commentsRes, ordersRes] = await Promise.all([
                    API.get("/api/dashboard/stats"),
                    API.get("/api/comments?limit=5"), // Assuming your backend supports a `limit` query
                    API.get('/api/orders/all-orders?limit=3')
                ]);

                if (statsRes.data) setStats(statsRes.data);
                if (Array.isArray(commentsRes.data))
                    setRecentComments(commentsRes.data);
                if (ordersRes.data && Array.isArray(ordersRes.data.orders)) setRecentOrders(ordersRes.data.orders);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard data. Please try refreshing.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    if (error)
        return (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        );

    const formatPrice = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format((amount || 0) / 100);
    };

    return (
        <div className="space-y-8">
            {/* --- Welcome Header --- */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Welcome back, {userInfo?.name || "Admin"}! Here's a summary of your
                    site.
                </p>
            </div>

            {/* --- Statistics Cards Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Recipes"
                    value={stats?.recipes ?? "0"}
                    icon={faBookOpen}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.products ?? "0"}
                    icon={faBookOpen}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.users ?? "0"}
                    icon={faUsers}
                    colorClass="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Categories"
                    value={stats?.categories ?? "0"}
                    icon={faTag}
                    colorClass="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                    title="Total FAQs"
                    value={stats?.faqs ?? "0"}
                    icon={faQuestionCircle}
                    colorClass="bg-purple-100 text-purple-600"
                />
            </div>

            {/* --- Recent Comments and Quick Links Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Recent Comments Widget --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center justify-between">
                        <span className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faComments} className="text-accent" />
                            Recent Comments
                        </span>
                        <Link
                            to="/admin/comments"
                            className="text-sm font-semibold text-accent hover:underline"
                        >
                            View All
                        </Link>
                    </h3>
                    <div className="space-y-4">
                        {recentComments.length > 0 ? (
                            recentComments.map((comment) => (
                                <div
                                    key={comment._id}
                                    className="flex items-start p-3 bg-gray-50/70 rounded-lg"
                                >
                                    <div className="w-9 h-9 bg-gray-200 text-gray-500 font-bold rounded-full flex items-center justify-center shrink-0 mr-4">
                                        {comment.user?.name.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 italic leading-snug">
                                            "{comment.text}"
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            by{" "}
                                            <span className="font-semibold">
                                                {comment.user?.name || "Deleted User"}
                                            </span>{" "}
                                            on
                                            <Link
                                                to={`/recipe/${comment.recipe?._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-1 text-accent font-semibold hover:underline"
                                            >
                                                {comment.recipe?.title || "a recipe"}
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No recent comments to display.
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center justify-between">
                        <span>
                            <FontAwesomeIcon
                                icon={faShoppingCart}
                                className="text-accent mr-3"
                            />
                            Recent Orders
                        </span>
                        <Link
                            to="/admin/orders"
                            className="text-sm font-semibold text-accent hover:underline"
                        >
                            View All
                        </Link>
                    </h3>
                    <div className="mt-4 space-y-4">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((o) => (
                                <div
                                    key={o._id}
                                    className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* <img
                                            src={o.product?.imageUrl}
                                            alt={o.product?.name}
                                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                                        /> */}
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900">
                                                {o.user?.name}
                                            </p>
                                            <p className="text-gray-500">
                                                Purchased
                                                <span className="font-medium ml-1 text-gray-700">
                                                    {o.product?.name}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-800">{formatPrice(o.purchasePrice, o.currency)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-gray-500 py-6">
                                No recent orders.
                            </p>
                        )}
                    </div>
                </div>

                {/* --- Quick Links Widget --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        Quick Actions
                    </h3>
                    <ul className="space-y-3">
                        <Link
                            to="/admin/recipes/new"
                            className=" p-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-accent transition-all flex justify-between items-center"
                        >
                            Create New Recipe <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                        <Link
                            to="/admin/categories"
                            className=" p-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-accent transition-all flex justify-between items-center"
                        >
                            Manage Categories <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                        <Link
                            to="/admin/newsletter"
                            className=" p-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-accent transition-all flex justify-between items-center"
                        >
                            Send Newsletter <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                        <Link
                            to="/admin/products/new"
                            className=" p-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-accent transition-all flex justify-between items-center"
                        >
                            Create Product <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
