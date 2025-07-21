import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth(); // To automatically log the user in
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        if (!token) { setError("Invalid or missing reset token."); return; }

        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/api/users/reset-password', { token, password });
            setMessage(data.message);

            // Automatically log the user in with the token returned from the backend
            login(data);

            // Redirect to a safe page after a short delay so they can read the success message
            setTimeout(() => {
                navigate('/my-orders'); // or homepage
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold font-serif">Reset Your Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Enter and confirm your new password below.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {message && <div className="text-green-800 bg-green-100...">{message}</div>}
                    {error && <div className="text-red-800 bg-red-100...">{error}</div>}

                    <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="New Password" />
                    <input name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm New Password" />

                    <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
                </form>
            </div>
        </div>
    );
};
export default ResetPasswordPage;