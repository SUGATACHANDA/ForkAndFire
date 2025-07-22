import React, { useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/common/Button";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from '../../components/common/Loader';

const ResetPasswordPage = () => {
    // const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth(); // To automatically log the user in
    // const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [checkingToken, setCheckingToken] = useState(true);

    const location = useLocation();
    const token = new URLSearchParams(location.search).get("token");

    useEffect(() => {
        const checkToken = async () => {
            try {
                const res = await API.post('/api/users/verify-reset-token', { token });
                setTokenValid(res.data.valid);
            } catch (err) {
                console.error("Token check failed:", err);
                setTokenValid(false);
            } finally {
                setCheckingToken(false);
            }
        };
        checkToken();
    }, [token]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await API.post("/api/users/reset-password", {
                token,
                password,
            });

            setMessage(data.message);

            // Automatically log the user in with the token returned from the backend
            login(data);

            // Redirect to a safe page after a short delay so they can read the success message
            setTimeout(() => {
                navigate("/"); // or homepage
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong.";

            if (errorMsg.includes("previous password")) {
                setError("You cannot use your previous password.");
            } else if (errorMsg.includes("invalid") || errorMsg.includes("expired")) {
                setError("This password reset link is invalid or has expired.");
            } else {
                setError(errorMsg);
            }

            console.error("RESET ERROR:", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (checkingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 text-center">
                <div>
                    <Loader />
                    <h2 className="text-xl font-semibold text-red-600">Verifying Reset Link...</h2>
                </div>
            </div>
        )
    }

    if (tokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 text-center">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Reset Link Expired</h2>
                    <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Request New Link
                    </button>
                </div>
            </div>
        );
    }

    // While checking token
    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">Checking reset link...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold font-serif">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter and confirm your new password below.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {message && (
                        <div className="text-green-800 bg-green-100...">{message}</div>
                    )}
                    {error && <div className="text-red-800 bg-red-100...">{error}</div>}

                    {/* <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="New Password"
          /> */}
                    <Input
                        label="New Password"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                        label="Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {/* <input
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm New Password"
                    /> */}

                    <Button type="submit" disabled={loading} fullWidth={true}>
                        {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}
                        {loading ? 'Reseting Password...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
export default ResetPasswordPage;
