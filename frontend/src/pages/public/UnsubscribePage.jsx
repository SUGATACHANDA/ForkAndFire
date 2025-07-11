import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api/index';
import Loader from '../../components/common/Loader';

const UnsubscribePage = () => {
    // Read the base64 encoded token from the URL
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // State to manage the UI
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) {
            try {
                // Decode the base64 token back into an email address
                const decodedEmail = atob(token);
                setEmail(decodedEmail);
                setStatus('confirming'); // Set initial state to ask for confirmation
            } catch (error) {
                setStatus('error');
                setMessage('The unsubscribe link is invalid or has expired.');
                console.error("Failed to decode token:", error);
            }
        } else {
            setStatus('error');
            setMessage('No unsubscribe token provided.');
        }
    }, [token]);

    const handleUnsubscribe = async () => {
        if (!email) {
            setStatus('error');
            setMessage('Cannot process request without a valid email.');
            return;
        }

        setStatus('loading');
        try {
            const { data } = await API.post('/api/newsletter/unsubscribe', { email });
            setStatus('success');
            setMessage(data.message || 'You have been successfully unsubscribed.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'An error occurred. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl text-center">

                <h1 className="text-3xl font-serif font-bold text-primary-text">Unsubscribe</h1>

                {status === 'loading' && <Loader />}

                {status === 'confirming' && (
                    <>
                        <p className="text-secondary-text">
                            Are you sure you want to unsubscribe <strong className="text-primary-text">{email}</strong> from our newsletter?
                        </p>
                        <button
                            onClick={handleUnsubscribe}
                            className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Yes, Unsubscribe Me
                        </button>
                        <Link to="/" className="text-sm text-gray-500 hover:underline">No, take me back to the site</Link>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <p className="text-green-600 font-semibold">{message}</p>
                        <p className="text-secondary-text text-sm">We're sorry to see you go. You will no longer receive emails from us.</p>
                        <Link to="/" className="inline-block mt-4 bg-accent text-white font-semibold py-2 px-5 rounded-md hover:bg-opacity-90 transition-colors">
                            Back to Fork & Fire
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p className="text-red-600 font-semibold">{message}</p>
                        <Link to="/" className="inline-block mt-4 bg-accent text-white font-semibold py-2 px-5 rounded-md hover:bg-opacity-90 transition-colors">
                            Back to Fork & Fire
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default UnsubscribePage;