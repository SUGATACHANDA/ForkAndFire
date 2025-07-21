import React, { useState } from 'react';
import API from '../../api';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data } = await API.post('/api/users/forgot-password', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold font-serif text-gray-900">Forgot Your Password?</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">No problem! Enter your email address below and we'll send you a link to reset it.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {message && <div className="p-3 text-center text-sm text-green-800 bg-green-100 rounded-md">{message}</div>}
                    {error && <div className="p-3 text-center text-sm text-red-800 bg-red-100 rounded-md">{error}</div>}

                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your registered email address" className="w-full px-3 py-2 border..." />
                    </div>

                    <button type="submit" disabled={loading} className="w-full ...">{loading ? "Sending..." : "Send Reset Link"}</button>
                </form>
                <div className="text-center text-sm">
                    <Link to="/login" className="font-medium text-accent hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};
export default ForgotPasswordPage;