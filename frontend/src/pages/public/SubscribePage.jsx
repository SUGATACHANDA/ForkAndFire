import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import subscribeImage from '../../assets/images/subscribe-bg.avif'; // Make sure this image exists

const SubscribePage = () => {
    // --- State Management ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    document.title = "Subscribe to get New Weekly Recipes and more... | Fork & Fire"

    // --- Refs for Animation ---
    const pageRef = useRef(null);

    // --- GSAP Animation ---
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('.form-anim', { y: 30, autoAlpha: 0 });
            gsap.set('.image-anim', { autoAlpha: 0, scale: 1.05 });

            const tl = gsap.timeline({ delay: 0.2 });
            tl.to('.image-anim', { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power3.out' })
                .to('.form-anim', { y: 0, autoAlpha: 1, stagger: 0.1, duration: 1, ease: 'power3.out' }, "-=0.9");

        }, pageRef);
        return () => ctx.revert();
    }, []);

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email.match(/^\S+@\S+\.\S+$/)) {
            setStatus('error');
            setMessage('Please provide your name and a valid email address.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            // Send both name and email to the backend
            const { data } = await API.post('/api/newsletter/subscribe', { name, email });
            setStatus('success');
            setMessage(data.message || 'Thank you! You are now subscribed.');
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div ref={pageRef} className="min-h-screen w-full flex bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">

                {/* --- Left Panel: Content & Form --- */}
                <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 order-2 lg:order-1">
                    <div className="w-full max-w-md">
                        <Link to="/" className="form-anim text-sm font-semibold text-secondary-text hover:text-primary-text transition-colors flex items-center gap-2 mb-8">
                            <FontAwesomeIcon icon={faArrowLeft} /> Back to Fork & Fire
                        </Link>

                        <h1 className="form-anim text-4xl md:text-5xl font-extrabold font-serif text-primary-text tracking-tight">
                            Join Our Table
                        </h1>

                        <p className="form-anim text-lg text-secondary-text mt-4">
                            Become part of the Fork & Fire family. Get our latest recipes, heartfelt stories, and exclusive kitchen tips delivered straight to your inbox.
                        </p>

                        {status !== 'success' ? (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div className="form-anim">
                                    <label htmlFor="name-subscribe" className="font-semibold text-gray-700 mb-1 block text-sm">First Name <span className='text-red-500'>*</span></label>
                                    <input
                                        id="name-subscribe"
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Alex"
                                        disabled={status === 'loading'}
                                        required
                                        className="w-full outline-none px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-0 focus:ring-accent focus:border-accent transition"
                                    />
                                </div>
                                <div className="form-anim">
                                    <label htmlFor="email-subscribe" className="font-semibold text-gray-700 mb-1 block text-sm">Email Address <span className='text-red-500'>*</span></label>
                                    <input
                                        id="email-subscribe"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        disabled={status === 'loading'}
                                        required
                                        className="w-full outline-none px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-0 focus:ring-accent focus:border-accent transition"
                                    />
                                </div>

                                {status === 'error' && message && (
                                    <p className="form-anim flex items-center gap-2 text-sm text-red-600">
                                        <FontAwesomeIcon icon={faExclamationCircle} /> {message}
                                    </p>
                                )}

                                <div className="form-anim pt-2">
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-3.5 px-5 bg-accent text-white font-bold text-lg rounded-lg shadow-lg shadow-accent/30 hover:bg-opacity-90 transition-transform hover:scale-105 disabled:bg-accent/50 disabled:cursor-wait"
                                    >
                                        {status === 'loading' ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : 'Join the Kitchen Table'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="form-anim mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-3" />
                                <h3 className="text-xl font-bold text-green-800">You're In!</h3>
                                <p className="text-green-700 mt-1">{message} Keep an eye on your inbox.</p>
                            </div>
                        )}

                        <p className="form-anim text-xs text-gray-400 mt-4 text-center">We respect your privacy. Unsubscribe anytime.</p>

                    </div>
                </div>

                {/* --- Right Panel: Image --- */}
                <div className="hidden lg:block order-1 lg:order-2 relative">
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <img src={subscribeImage} alt="Artisanal bread being sliced" className="image-anim w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                </div>
            </div>
        </div>
    );
};

export default SubscribePage;