import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/index';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const SignupPage = () => {
    // --- State for all form fields ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // State for the newsletter checkbox, default to true for better engagement
    const [newsletter, setNewsletter] = useState(true);

    // UI State
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { userInfo, login } = useAuth();

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // === THE FIX IS HERE ===
            // Include the `newsletter` boolean in the payload sent to the backend.
            const { data } = await API.post('/api/users', { name, email, password, newsletter });
            login(data); // Log the user in
            navigate('/'); // Redirect to homepage
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold font-serif text-gray-900">Create your account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center p-2 bg-red-100 rounded">{error}</div>}
                    <div className="rounded-md shadow-sm flex flex-col gap-4">
                        <Input label="Full Name" id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label="Email address" id="email-address" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input label="Password" id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Input label="Confirm Password" id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>

                    {/* --- The Newsletter Checkbox --- */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="newsletter"
                                name="newsletter"
                                type="checkbox"
                                checked={newsletter}
                                onChange={(e) => setNewsletter(e.target.checked)}
                                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                            <p className="text-gray-500">Receive our best recipes, tips, and news right in your inbox.</p>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} fullWidth={true}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
export default SignupPage;