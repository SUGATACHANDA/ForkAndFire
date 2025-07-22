import React, { useState } from 'react';
import API from '../../api';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userExists, setUserExists] = useState(null);

    // This state controls which view is shown: the form or the success message.
    const [isSuccess, setIsSuccess] = useState(false);

    const handleEmailChange = async (e) => {
        const email = e.target.value;
        setEmail(email);

        // Basic email format check before making request
        if (email.includes('@') && email.length > 5) {
            try {
                const res = await API.post('/api/users/check-user-exists', { email });
                setUserExists(res.data.exists);
            } catch (err) {
                console.error('Error checking user existence:', err);
                setUserExists(null); // Unknown state
            }
        } else {
            setUserExists(null); // Reset if invalid format
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data } = await API.post('/api/users/forgot-password', { email });
            setMessage(data.message);
            // On a successful API call, we set the success state to true.
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full p-8 sm:p-10 bg-white shadow-xl rounded-2xl">

                {/* We now conditionally render the content based on the `isSuccess` state */}
                {isSuccess ? (
                    // === SUCCESS VIEW ===
                    <div className="text-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold font-serif text-primary-text">Check Your Inbox</h2>
                        <p className="mt-2 text-secondary-text">
                            {message || "If an account with that email exists, we've sent a link to reset your password."}
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    // === INITIAL FORM VIEW ===
                    <div className="space-y-6">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-accent mb-4" />
                            <h2 className="text-3xl font-extrabold font-serif text-gray-900">Forgot Password?</h2>
                            <p className="mt-2 text-sm text-secondary-text">No worries, it happens. Enter your email and we'll send you a reset link.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="p-3 text-center text-sm font-semibold text-red-800 bg-red-100 rounded-md">{error}</div>}

                            <div>
                                <Input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                                {userExists === true && (
                                    <p className="text-green-600 mt-1 text-sm">✅ Account found for this email.</p>
                                )}
                                {userExists === false && (
                                    <p className="text-red-500 mt-1 text-sm">⚠️ No account found with this email.</p>
                                )}
                            </div>

                            <Button type="submit" disabled={loading || !userExists} fullWidth={true}>
                                {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-1 mt-1" />}
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>
                        <div className="text-center text-sm">
                            <Link to="/login" className="font-medium text-accent hover:underline">Remembered it? Go back to Login</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;