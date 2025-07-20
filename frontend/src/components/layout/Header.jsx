import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useScreenSize } from '../../hooks/useScreenSize';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars, faTimes, faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import API from '../../api';
import { ShoppingCart } from 'lucide-react';


// A private sub-component for the banner, co-located for simplicity
// as it is only ever used by the Header.
const NotificationBanner = () => {
    return (
        <div
            id="notification-banner"
            className="bg-accent text-white w-full"
        // No positioning or transform classes needed
        >
            <div className="container mx-auto px-4 sm:px-6 py-2.5">
                <div className="flex items-center justify-center text-center gap-2">
                    <Link to="/subscribe">
                        <p className="flex-grow font-semibold text-base hover:underline">
                            <span className="font-bold">Never miss a thing!</span> Subscribe for free weekly recipes and tips.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};


const Header = () => {
    // --- Hooks ---
    const { userInfo, logout } = useAuth();
    const isMobile = useScreenSize();
    const navigate = useNavigate();
    const location = useLocation();

    // --- State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);

    const fetchCart = useCallback(async () => {
        if (!userInfo?.token) return;

        try {
            const res = await API.get('/api/cart', {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });

            const items = Array.isArray(res.data) ? res.data : res.data?.cart || [];
            setCartItems(items);
        } catch (err) {
            console.error('❌ Error fetching cart:', err);
            setCartItems([]);
        } finally {
            setLoadingCart(false);
        }
    }, [userInfo?.token]);

    useEffect(() => {
        if (userInfo?.token) {
            fetchCart();
        }
    }, [fetchCart, userInfo?.token]);

    // --- Refs for Animation ---
    const mobileMenuRef = useRef(null);
    const tl = useRef(gsap.timeline({ paused: true, reversed: true }));

    // --- Animation Effects ---
    // Sets up the mobile menu animation once
    useEffect(() => {
        const ctx = gsap.context(() => {
            tl.current
                .to(mobileMenuRef.current, { x: 0, duration: 0.5, ease: 'power3.inOut' })
                .fromTo(".mobile-link",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power3.out' },
                    "-=0.3"
                );
        }, mobileMenuRef);
        return () => ctx.revert();
    }, []);

    // Triggers the animation based on state and handles body scroll lock
    useEffect(() => {
        if (isMenuOpen) {
            tl.current.play();
            document.body.style.overflow = 'hidden';
        } else {
            tl.current.reverse();
            document.body.style.overflow = 'auto';
        }
    }, [isMenuOpen]);

    // Automatically close the mobile menu on resize to desktop
    useEffect(() => {
        if (!isMobile) setIsMenuOpen(false);
    }, [isMobile]);

    // --- Event Handlers ---
    const handleLogout = useCallback(() => {
        setIsMenuOpen(false); // Close menu first
        logout();
        navigate('/');
    }, [logout, navigate]);

    // --- Sub-component for rendering nav links to avoid repetition ---
    const NavLinks = ({ mobile = false }) => {
        const linkClass = mobile
            ? "mobile-link py-3 text-2xl uppercase tracking-widest"
            : "desktop-link text-sm font-semibold tracking-wide uppercase";

        const activeStyle = { color: '#E86E45' };
        const closeMenu = () => setIsMenuOpen(false);

        const showSubscribeLink = location.pathname !== '/subscribe' && !userInfo;

        return (
            <>
                <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>Home</NavLink>
                <NavLink to="/recipes" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>All Recipes</NavLink>
                <NavLink to="/about" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>About Us</NavLink>
                <NavLink to="/shop" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>Shop</NavLink>
                {userInfo && (<NavLink to="/favorites" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>Favorites</NavLink>)}
                {userInfo && (<NavLink to="/my-orders" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>My Orders</NavLink>)}
                {showSubscribeLink && <NavLink to="/subscribe" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={linkClass} onClick={closeMenu}>Subscribe</NavLink>}
                {userInfo?.isAdmin && !isMobile && (<NavLink to="/admin/dashboard" style={({ isActive }) => (isActive ? activeStyle : undefined)} className={`${linkClass} text-accent`} onClick={closeMenu}>Admin Panel</NavLink>)}
            </>
        );
    };

    // --- Main Render ---
    return (
        // The main header tag is NOT sticky; it scrolls with the page.
        <header className="relative z-50">
            {/* The Notification Banner is rendered conditionally inside the header */}
            {!location.pathname.startsWith('/admin') && <NotificationBanner />}

            <div className="bg-background/90 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-serif font-bold text-primary-text z-50">
                        Fork & Fire
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8 text-secondary-text">
                        <NavLinks />
                    </nav>

                    {/* Desktop User Actions */}
                    <div className="hidden lg:flex items-center space-x-4 z-50">
                        {userInfo ? (
                            <div className="flex items-center gap-4">
                                <FontAwesomeIcon icon={faUserCircle} className="text-accent text-2xl" />
                                <span className="font-semibold text-primary-text">{userInfo.name.split(' ')[0]}</span>

                                {/* Shopping Cart Icon */}
                                {!loadingCart && (
                                    <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                                        <ShoppingCart className="w-6 h-6 text-primary-text hover:text-accent transition-colors" />
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-secondary-text font-semibold uppercase hover:text-accent transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/login" className="bg-accent text-white px-5 py-2.5 rounded-full hover:bg-opacity-90 transition-colors text-xs font-bold uppercase">
                                Login / Signup
                            </NavLink>
                        )}
                    </div>

                    {/* Hamburger Menu Icon (Mobile) */}
                    <div className="lg:hidden flex items-center gap-4 z-50">
                        {/* Hamburger Icon */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Open menu"
                            className="text-primary-text text-2xl focus:outline-none"
                        >
                            <FontAwesomeIcon
                                icon={isMenuOpen ? faTimes : faBars}
                                className="transition-transform duration-300 transform"
                                style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            />
                        </button>

                        {/* Cart Icon */}
                        {userInfo && (
                            <div
                                onClick={() => navigate("/cart")}
                                className="relative cursor-pointer"
                            >
                                <ShoppingCart className="w-5 h-5 text-gray-800" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Sliding Panel */}
            <div ref={mobileMenuRef} className="lg:hidden fixed top-0 left-0 w-full h-screen bg-background transform -translate-x-full z-40">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <nav className="flex flex-col space-y-8 text-primary-text font-semibold">
                        <NavLinks mobile={true} />
                    </nav>
                    <div className="absolute bottom-20 text-center mobile-link mt-2">
                        {userInfo ? (
                            <div className="flex flex-col items-center gap-4 "><p className="text-secondary-text capitalize text-lg">Signed in as {userInfo.name}</p><button onClick={handleLogout} className="font-bold text-lg text-accent uppercase">Logout</button></div>
                        ) : (
                            <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="bg-accent text-white px-8 py-3 rounded-full text-lg font-bold uppercase">Login / Signup</NavLink>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;