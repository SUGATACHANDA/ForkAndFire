import { useState, useEffect, useCallback } from 'react';

// A global promise to ensure initialization runs only once.
let paddlePromise = null;

const initializePaddle = (onCheckoutComplete) => {
    if (paddlePromise) {
        return paddlePromise;
    }

    paddlePromise = new Promise((resolve, reject) => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN;
        const vendorId = import.meta.env.VITE_PADDLE_VENDOR_ID; // For Classic fallback

        const setup = () => {
            if (!window.Paddle || window.Paddle.isSetup) {
                // If it's already set up, we're good to go.
                if (window.Paddle?.isSetup) resolve();
                return;
            }

            console.log("Paddle.js script loaded. Checking available methods...");

            try {
                // === THE DEFINITIVE HYBRID FIX IS HERE ===

                // 1. Try the MODERN Paddle Billing method first.
                if (typeof window.Paddle.Initialize === 'function') {
                    console.log("--> Found Paddle.Initialize(). Using modern Paddle Billing setup.");

                    if (!clientToken) throw new Error("VITE_PADDLE_CLIENT_SIDE_TOKEN is missing for Paddle Billing initialization.");

                    window.Paddle.Environment.set(
                        import.meta.env.MODE === 'production' ? 'live' : 'sandbox'
                    );
                    window.Paddle.Initialize({
                        token: clientToken,
                        eventCallback: (data) => {
                            if (data.name === 'checkout.completed' && onCheckoutComplete) {
                                onCheckoutComplete(data.data);
                            }
                        }
                    });

                }
                // 2. If that fails, FALL BACK to the older Paddle Classic method.
                else if (typeof window.Paddle.Setup === 'function') {
                    console.log("--> Did not find Initialize(). Found Paddle.Setup(). Using Paddle Classic setup.");

                    if (!vendorId) throw new Error("VITE_PADDLE_VENDOR_ID is missing for Paddle Classic initialization.");

                    window.Paddle.Setup({
                        vendor: parseInt(vendorId, 10),
                        eventCallback: (data) => {
                            if (data.event === 'checkout.closed' && data.eventData?.checkout?.completed && onCheckoutComplete) {
                                onCheckoutComplete(data.eventData.checkout);
                            }
                        }
                    });

                } else {
                    // 3. If neither method exists, the script is invalid.
                    throw new Error("The loaded Paddle.js script has neither an 'Initialize' nor a 'Setup' function.");
                }

                window.Paddle.isSetup = true; // Our custom flag
                resolve(); // Fulfill the promise, signaling success

            } catch (e) {
                console.error("PADDLE INITIALIZATION FAILED:", e);
                reject(e);
            }
        };

        const existingScript = document.querySelector('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');

        if (existingScript) {
            if (window.Paddle) {
                setup();
            } else {
                existingScript.addEventListener('load', setup);
            }
        } else {
            // Failsafe if script wasn't in index.html
            const script = document.createElement('script');
            script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
            script.async = true;
            script.onload = setup;
            script.onerror = () => reject(new Error("Failed to load Paddle.js script."));
            document.body.appendChild(script);
        }
    });

    return paddlePromise;
};

export const usePaddle = (onCheckoutComplete) => {
    const [isPaddleReady, setIsPaddleReady] = useState(false);
    const memoizedOnCheckoutComplete = useCallback(onCheckoutComplete, [onCheckoutComplete]);

    useEffect(() => {
        // We only trigger initialization if it hasn't already succeeded.
        if (!isPaddleReady) {
            initializePaddle(memoizedOnCheckoutComplete)
                .then(() => {
                    console.log("✅ usePaddle hook reports: Paddle is ready!");
                    setIsPaddleReady(true);
                })
                .catch(error => {
                    console.error("usePaddle hook initialization error:", error);
                    setIsPaddleReady(false);
                });
        }
    }, [isPaddleReady, memoizedOnCheckoutComplete]);

    return isPaddleReady;
};