import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

const PurchaseSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('transaction_id'); // This is the public ID from Paddle

    // 'polling', 'success', 'viewed', or 'error'
    const [status, setStatus] = useState('polling');
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');

    const pollingInterval = useRef(null);

    useEffect(() => {
        // --- PRE-FLIGHT CHECKS ---
        if (!transactionId) {
            setError("No transaction information was provided.");
            setStatus('error');
            return;
        }

        const sessionKey = `viewed_transaction_${transactionId}`;
        const hasBeenViewed = sessionStorage.getItem(sessionKey);

        if (hasBeenViewed) {
            // If we've already viewed this confirmation in this session, immediately block it.
            setError("This purchase confirmation has already been viewed.");
            setStatus('viewed');
            // We can retrieve the order details from storage for a faster display
            const viewedOrderData = JSON.parse(hasBeenViewed);
            setOrder(viewedOrderData);
            return;
        }

        // --- POLLING LOGIC ---
        let attempts = 0;
        const maxAttempts = 15; // Poll for 30 seconds

        const pollForOrder = async () => {
            if (attempts >= maxAttempts) {
                clearInterval(pollingInterval.current);
                setError("Processing is taking longer than expected. Your order will appear in 'My Orders' shortly.");
                setStatus('error');
                return;
            }
            attempts++;

            try {
                // Poll the backend with the public transaction ID
                const { data: foundOrder } = await API.get(`/api/orders/by-transaction/${transactionId}`);

                if (foundOrder) {
                    // SUCCESS! The webhook has been processed.
                    clearInterval(pollingInterval.current); // Stop polling
                    setOrder(foundOrder);
                    setStatus('success');

                    // === THE DEFINITIVE FIX ===
                    // Mark this transaction as "viewed" for this session in sessionStorage
                    sessionStorage.setItem(sessionKey, JSON.stringify(foundOrder));
                }
            } catch (err) {
                console.log(err)
                // A 404 is expected while polling, so we do nothing and let the interval try again.
                console.log(`Poll attempt ${attempts}: Order not yet ready.`);
            }
        };

        // Start the polling
        pollingInterval.current = setInterval(pollForOrder, 2000);

        // Cleanup function
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };

    }, [transactionId]); // This effect depends only on the transaction ID

    const PageWrapper = ({ children }) => (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="text-center p-8 sm:p-12 bg-white shadow-xl rounded-2xl max-w-xl mx-auto">{children}</div>
        </div>
    );

    if (status === 'polling') {
        return (
            <PageWrapper>
                <FontAwesomeIcon icon={faHourglassHalf} className="text-5xl text-accent animate-pulse" />
                <h1 className="text-3xl font-extrabold font-serif text-primary-text mt-6">Finalizing Your Order...</h1>
                <p className="text-secondary-text mt-2">Please wait a moment while we confirm your purchase. This page will update automatically.</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            {status === 'success' && order ? (
                <>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-6" />
                    <h1 className="text-4xl font-extrabold font-serif text-primary-text">Thank You!</h1>
                    <p className="text-lg text-secondary-text mt-4">Your purchase of <strong className="text-primary-text">{order.product?.name}</strong> was successful. An email has been sent to your account.</p>
                </>
            ) : (
                <>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-yellow-500 mb-6" />
                    <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-primary-text">Confirmation Viewed</h1>
                    <p className="text-lg text-secondary-text mt-4">{error || "This order confirmation has already been viewed."}</p>
                </>
            )}

            <div className="mt-8">
                <Link to="/my-orders" className="w-full sm:w-auto inline-block bg-accent text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90">
                    Go to My Orders
                </Link>
            </div>
        </PageWrapper>
    );
};

export default PurchaseSuccessPage;