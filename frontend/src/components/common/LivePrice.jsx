import React, { useState, useEffect } from 'react';
import API from '../../api';
import { usePaddle } from '../../hooks/usePaddle'; // We use this to know when Paddle.js is ready

const LivePrice = ({ priceId, defaultPriceDisplay }) => {
    // State to hold the final price string (e.g., "£23.99")
    const [displayPrice, setDisplayPrice] = useState('');
    const [loading, setLoading] = useState(true);

    // Get the readiness status from our global Paddle hook
    const isPaddleReady = usePaddle(() => { }); // We don't need a checkout callback here

    useEffect(() => {
        // Do not proceed until Paddle.js is fully loaded and initialized
        if (!isPaddleReady || !priceId) {
            return;
        }

        let isMounted = true;
        setLoading(true);

        const fetchLocalizedPrice = async () => {
            try {
                // Use Paddle.js's built-in localization feature to get location data.
                // This is more accurate than IP-based lookups for tax purposes.
                const pricePreview = await window.Paddle.PricePreview({
                    items: [{ priceId: priceId, quantity: 1 }]
                });

                // The returned object has the country code
                const customerCountry = pricePreview.data.customer.address.countryCode;

                // Now, call our own backend with this country code for a server-verified preview
                const { data } = await API.post('/api/paddle/preview-price', {
                    priceId: priceId,
                    customerCountry: customerCountry
                });

                if (isMounted) {
                    setDisplayPrice(data.displayPrice);
                }

            } catch (error) {
                console.error("Live price fetch failed. Falling back to default price.", error);
                // If anything fails, gracefully fall back to the default price passed in via props
                if (isMounted) {
                    setDisplayPrice(defaultPriceDisplay);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLocalizedPrice();

        return () => {
            isMounted = false; // Cleanup to prevent state updates on an unmounted component
        };

    }, [isPaddleReady, priceId, defaultPriceDisplay]);


    if (loading) {
        return (
            <span className="text-2xl text-gray-400 animate-pulse">Calculating local price...</span>
        );
    }

    // Display the final, localized price string
    return <>{displayPrice}</>;
};

export default LivePrice;