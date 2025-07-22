import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import API from "../../api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
    // --- State Management ---
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Hooks for Navigation and Authentication ---
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo, login } = useAuth();

    // Determine where to redirect the user after a successful login.
    // It checks for a `from` path in the location state (passed by protected routes).
    // If none exists, it defaults to the user's "My Orders" page, or "/" as a final fallback.
    const fromPath = location.state?.from?.pathname || "/my-orders";

    // This effect handles users who are already logged in but somehow land on this page.
    useEffect(() => {
        if (userInfo) {
            // Redirect them away from the login page.
            navigate(fromPath, { replace: true });
        }
    }, [navigate, userInfo, fromPath]);

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await API.post("/api/users/login", { email, password });
            login(data); // Update the global auth context.

            // On success, redirect to the path they came from or the default.
            navigate(fromPath, { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "An unexpected error occurred. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold font-serif text-primary-text">
                        Welcome Back!
                    </h2>
                    <p className="mt-2 text-sm text-secondary-text">
                        Sign in to continue to <span>
                            <Link to='/' className="text-accent underline">Fork & Fire</Link>
                        </span>.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-center text-sm font-semibold text-red-800 bg-red-100 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md space-y-4">
                        <Input
                            label="Email address"
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Empty div for spacing if no "Remember me" checkbox is desired */}
                        <div className="text-sm"></div>

                        {/* --- THE NEW FORGOT PASSWORD LINK --- */}
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-accent hover:text-accent/80 transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" disabled={loading} fullWidth={true}>
                            {loading && (
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            )}
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </div>
                </form>
                <div className="text-sm text-center text-secondary-text">
                    <p>
                        New to Fork & Fire?{" "}
                        <Link
                            to="/signup"
                            state={{ from: location.state?.from }}
                            className="font-medium text-accent hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
