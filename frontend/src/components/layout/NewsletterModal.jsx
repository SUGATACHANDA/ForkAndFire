import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../../api';
import Modal from '../common/Modal'; // Assuming Modal component exists
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEnvelope, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

// --- Configuration Constants ---
const NEWSLETTER_MODAL_SEEN_KEY = 'hasSeenNewsletterModalInSession';
const MODAL_APPEAR_DELAY = 20000;
const MODAL_IMAGE_URL = 'https://plus.unsplash.com/premium_photo-1666353535582-9268ce1a981c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZCUyMGJhbm5lcnxlbnwwfHwwfHx8MA%3D%3D';

const NewsletterModal = () => {
    // --- State Management ---
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(''); // <-- 1. Add state for the name
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const location = useLocation();

    // Effect to control modal visibility based on sessionStorage
    useEffect(() => {
        // Define routes where the modal should NOT appear
        const excludedPaths = ['/admin', '/print', '/unsubscribe', '/login', '/signup', '/subscribe'];
        if (excludedPaths.some(path => location.pathname.startsWith(path))) {
            setIsOpen(false); // Ensure it's closed if we navigate to an excluded path
            return;
        }

        const hasSeenModal = sessionStorage.getItem(NEWSLETTER_MODAL_SEEN_KEY);
        if (!hasSeenModal) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem(NEWSLETTER_MODAL_SEEN_KEY, 'true');
            }, MODAL_APPEAR_DELAY);

            // Cleanup timer
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    // Form Submission Handler (Updated)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Updated validation
        if (!name.trim() || !email.match(/^\S+@\S+\.\S+$/)) {
            setStatus('error');
            setMessage('Please provide your name and a valid email.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            // --- 2. Include both name and email in the API call ---
            const { data } = await API.post('/api/newsletter/subscribe', { name, email });
            setStatus('success');
            setMessage(data.message || "Thank you for subscribing!");
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || "An error occurred.");
        }
    };

    const handleClose = () => setIsOpen(false);

    // --- JSX ---
    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            {/* The wrapper prevents clicks inside the modal from closing it */}
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2 relative">


                {/* --- Image Panel --- */}
                <div className="hidden md:block">
                    <img src={MODAL_IMAGE_URL} alt="Fresh vibrant salad" className="w-full h-full object-cover" />
                </div>

                {/* --- Content Panel --- */}
                <div className="p-8 md:p-12 flex flex-col justify-center text-center">
                    {status === 'success' ? (
                        // Success State
                        <div className="flex flex-col items-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
                            <h2 className="text-3xl font-bold font-serif text-primary-text">You're In!</h2>
                            <p className="text-secondary-text mt-2">{message}</p>
                            <button onClick={handleClose} className="mt-6 bg-accent text-white font-semibold py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors">
                                Continue Exploring
                            </button>
                        </div>
                    ) : (
                        // Default Form State
                        <>
                            <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-accent mb-4" />
                            <h2 className="text-3xl font-bold font-serif text-primary-text">Join Our Kitchen Journal</h2>
                            <p className="text-secondary-text mt-2 max-w-sm mx-auto">Get our best recipes and pro tips delivered to your inbox, free!</p>

                            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                                {/* --- 3. The new Name input field --- */}
                                <input
                                    type="text"
                                    placeholder="Your first name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={status === 'loading'}
                                    className="w-full text-center px-4 py-3 bg-gray-100 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent-light focus:border-accent"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading'}
                                    className="w-full text-center px-4 py-3 bg-gray-100 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent-light focus:border-accent"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-accent/50 disabled:cursor-wait"
                                >
                                    {status === 'loading' ? 'Submitting...' : 'Subscribe Now'}
                                </button>
                                {status === 'error' && <p className="text-red-600 text-sm mt-1 flex items-center justify-center gap-2"><FontAwesomeIcon icon={faExclamationCircle} /> {message}</p>}
                            </form>
                            <button onClick={handleClose} className="mt-4 text-sm text-gray-500 hover:underline">
                                No, thanks
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NewsletterModal;