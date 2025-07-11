import React, { useState, useCallback } from 'react';
import API from '../../api';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faPinterest, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('loading');
        setMessage('');
        try {
            const { data } = await API.post('/api/newsletter/subscribe', { name, email });
            setStatus('success');
            setMessage(data.message);
            setName('');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    }, [name, email]);

    return (
        <footer className="bg-primary-text text-gray-300 pt-16 pb-8 mt-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

                    {/* Column 1: About / Brand */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-serif font-bold text-white mb-4">Fork & Fire Kitchen</h3>
                        <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
                            Crafted with love, tested for simplicity. A journal of culinary creations and the stories they tell.
                        </p>
                    </div>

                    {/* Column 2: Navigation Links */}
                    <div className="lg:col-span-1">
                        <h4 className="text-base font-semibold text-white uppercase tracking-wider mb-4">Navigate</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-accent transition-colors">Home</Link></li>
                            <li><Link to="/recipes" className="text-gray-400 hover:text-accent transition-colors">All Recipes</Link></li>
                            <li><Link to="/shop" className="text-gray-400 hover:text-accent transition-colors">Shop</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-accent transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Newsletter Signup */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <h4 className="text-base font-semibold text-white uppercase tracking-wider mb-4">Join our Weekly Journal</h4>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your first name *"
                                    disabled={status === 'loading'}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-accent-light focus:border-accent disabled:opacity-50 transition"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address *"
                                    disabled={status === 'loading'}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-accent-light focus:border-accent disabled:opacity-50 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-accent text-white font-semibold w-full py-2.5 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-accent/50 disabled:cursor-wait"
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                            {message && (
                                <div className={`p-2 text-xs rounded-md flex items-center justify-center gap-2 transition-all ${status === 'success' ? 'text-green-300 bg-green-900/20' :
                                    status === 'error' ? 'text-red-300 bg-red-900/20' : 'hidden'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={status === 'success' ? faCheckCircle : faExclamationCircle} /> {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col-reverse md:flex-row justify-between items-center text-center md:text-left gap-4">
                    <p className="text-sm text-gray-400">© {new Date().getFullYear()} Fork & Fire Kitchen. All Rights Reserved.</p>
                    <div className="flex items-center space-x-4">
                        <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors text-xl"><FontAwesomeIcon icon={faInstagram} /></a>
                        <a href="#" aria-label="Pinterest" className="text-gray-400 hover:text-white transition-colors text-xl"><FontAwesomeIcon icon={faPinterest} /></a>
                        <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-white transition-colors text-xl"><FontAwesomeIcon icon={faYoutube} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;