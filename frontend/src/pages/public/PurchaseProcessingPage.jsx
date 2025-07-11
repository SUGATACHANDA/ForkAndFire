import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

const PurchaseProcessingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const checkoutId = searchParams.get('checkout_id');

    const [statusMessage, setStatusMessage] = useState('Verifying your payment...');
    const pollingInterval = useRef(null);

    useEffect(() => {
        if (!checkoutId) {
            navigate('/shop'); // Invalid state, go to shop
            return;
        }

        let attempts = 0;
        const maxAttempts = 15; // Poll for 30 seconds max

        const pollForOrder = async () => {
            if (attempts >= maxAttempts) {
                setStatusMessage('Processing is taking longer than expected. You can find your order in your account shortly.');
                clearInterval(pollingInterval.current);
                setTimeout(() => navigate('/my-orders'), 3000); // Failsafe redirect
                return;
            }

            attempts++;
            setStatusMessage(`Finalizing your order... (Attempt #${attempts})`);

            try {
                // Poll the backend to see if the webhook has created the order
                const { data: order } = await API.get(`/api/orders/by-transaction/${checkoutId}`);

                // Success condition: Order found AND it has our single-use token!
                if (order && order.accessToken) {
                    clearInterval(pollingInterval.current);
                    // Redirect to the final success page with the secure token
                    navigate(`/purchase-success?order_token=${order.accessToken}`, { replace: true });
                }
            } catch (error) {
                console.log(error)
                // A 404 is expected here, it means the webhook hasn't finished yet. Just keep polling.
                console.log(`Poll attempt ${attempts}: Order not ready.`);
            }
        };

        // Start polling immediately, then every 2 seconds
        pollForOrder();
        pollingInterval.current = setInterval(pollForOrder, 2000);

        // Cleanup: stop polling if the user navigates away
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [checkoutId, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-4xl text-accent animate-pulse" />
            <h1 className="text-3xl font-extrabold font-serif text-primary-text mt-6">Processing Your Purchase</h1>
            <p className="text-secondary-text mt-2">{statusMessage}</p>
        </div>
    );
};

export default PurchaseProcessingPage;