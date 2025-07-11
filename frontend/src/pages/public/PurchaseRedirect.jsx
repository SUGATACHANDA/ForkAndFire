import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';

/**
 * This is a "ghost" page. Its only job is to manage browser history.
 * It immediately replaces itself in the history stack with the final
 * success page, making it impossible for the user to navigate "back" to it.
 */
const PurchaseRedirect = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('transaction_id');

    useEffect(() => {
        if (transactionId) {
            // Immediately navigate to the real success page, but
            // REPLACE the current URL in the browser's history.
            navigate(`/purchase-success?transaction_id=${transactionId}`, { replace: true });
        } else {
            // If someone lands here without a transaction ID, send them away.
            navigate('/shop', { replace: true });
        }
        // Only run this effect once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render a simple full-screen loader while the redirect happens
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader />
        </div>
    );
};

export default PurchaseRedirect;