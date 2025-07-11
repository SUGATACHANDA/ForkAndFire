// import { useState, useEffect, useCallback } from 'react';

// // A global promise to ensure initialization runs only once.
// let paddlePromise = null;

// const initializePaddle = (onCheckoutComplete) => {
//     if (paddlePromise) {
//         return paddlePromise;
//     }

//     paddlePromise = new Promise((resolve, reject) => {
//         const clientToken = import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN;
//         const vendorId = import.meta.env.VITE_PADDLE_VENDOR_ID; // For Classic fallback

//         const setup = () => {
//             if (!window.Paddle || window.Paddle.isSetup) {
//                 // If it's already set up, we're good to go.
//                 if (window.Paddle?.isSetup) resolve();
//                 return;
//             }

//             console.log("Paddle.js script loaded. Checking available methods...");

//             try {
//                 // === THE DEFINITIVE HYBRID FIX IS HERE ===

//                 // 1. Try the MODERN Paddle Billing method first.
//                 if (typeof window.Paddle.Initialize === 'function') {
//                     console.log("--> Found Paddle.Initialize(). Using modern Paddle Billing setup.");

//                     if (!clientToken) throw new Error("VITE_PADDLE_CLIENT_SIDE_TOKEN is missing for Paddle Billing initialization.");

//                     window.Paddle.Environment.set(
//                         import.meta.env.MODE === 'production' ? 'live' : 'sandbox'
//                     );
//                     window.Paddle.Initialize({
//                         token: clientToken,
//                         eventCallback: (data) => {
//                             if (data.name === 'checkout.completed' && onCheckoutComplete) {
//                                 onCheckoutComplete(data.data);
//                             }
//                         }
//                     });

//                 }
//                 // 2. If that fails, FALL BACK to the older Paddle Classic method.
//                 else if (typeof window.Paddle.Setup === 'function') {
//                     console.log("--> Did not find Initialize(). Found Paddle.Setup(). Using Paddle Classic setup.");

//                     if (!vendorId) throw new Error("VITE_PADDLE_VENDOR_ID is missing for Paddle Classic initialization.");

//                     window.Paddle.Setup({
//                         vendor: parseInt(vendorId, 10),
//                         eventCallback: (data) => {
//                             if (data.event === 'checkout.closed' && data.eventData?.checkout?.completed && onCheckoutComplete) {
//                                 onCheckoutComplete(data.eventData.checkout);
//                             }
//                         }
//                     });

//                 } else {
//                     // 3. If neither method exists, the script is invalid.
//                     throw new Error("The loaded Paddle.js script has neither an 'Initialize' nor a 'Setup' function.");
//                 }

//                 window.Paddle.isSetup = true; // Our custom flag
//                 resolve(); // Fulfill the promise, signaling success

//             } catch (e) {
//                 console.error("PADDLE INITIALIZATION FAILED:", e);
//                 reject(e);
//             }
//         };

//         const existingScript = document.querySelector('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');

//         if (existingScript) {
//             if (window.Paddle) {
//                 setup();
//             } else {
//                 existingScript.addEventListener('load', setup);
//             }
//         } else {
//             // Failsafe if script wasn't in index.html
//             const script = document.createElement('script');
//             script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
//             script.async = true;
//             script.onload = setup;
//             script.onerror = () => reject(new Error("Failed to load Paddle.js script."));
//             document.body.appendChild(script);
//         }
//     });

//     return paddlePromise;
// };

// export const usePaddle = (onCheckoutComplete) => {
//     const [isPaddleReady, setIsPaddleReady] = useState(false);
//     const memoizedOnCheckoutComplete = useCallback(onCheckoutComplete, [onCheckoutComplete]);

//     useEffect(() => {
//         // We only trigger initialization if it hasn't already succeeded.
//         if (!isPaddleReady) {
//             initializePaddle(memoizedOnCheckoutComplete)
//                 .then(() => {
//                     console.log("✅ usePaddle hook reports: Paddle is ready!");
//                     setIsPaddleReady(true);
//                 })
//                 .catch(error => {
//                     console.error("usePaddle hook initialization error:", error);
//                     setIsPaddleReady(false);
//                 });
//         }
//     }, [isPaddleReady, memoizedOnCheckoutComplete]);

//     return isPaddleReady;
// };

import { useState, useEffect, useCallback } from 'react';

// This is the function that holds the core setup logic.
// We keep it outside the hook to make it clear and reusable if needed.
const initializePaddle = (onCheckoutComplete) => {
    // Safety check: ensure we don't try to run this in a server-side environment.
    if (typeof window === 'undefined' || !window.document) {
        return;
    }

    // Check if the global Paddle object exists AND it has not already been initialized.
    if (window.Paddle && !window.Paddle.isSetup) {

        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN;

        // A critical guard clause to ensure the .env variable is loaded.
        if (!clientToken) {
            console.error("FATAL ERROR: VITE_PADDLE_CLIENT_SIDE_TOKEN is not defined in /frontend/.env. Paddle cannot be initialized.");
            return;
        }

        try {
            console.log("Attempting to initialize Paddle Billing...");

            // Step 1: Set the environment ('sandbox' for development, 'live' for production).
            window.Paddle.Environment.set(
                import.meta.env.MODE === 'production' ? 'live' : 'sandbox'
            );

            // Step 2: Initialize with your public Client-side Token and the event callback.
            window.Paddle.Initialize({
                token: clientToken,
                eventCallback: (data) => {
                    // We listen for the event that signifies a successful transaction.
                    if (data.name === 'checkout.completed') {
                        // If a callback function was provided to the hook, call it with the event data.
                        if (onCheckoutComplete) {
                            onCheckoutComplete(data.data);
                        }
                    }
                }
            });

            // Set our own custom flag on the window object to prevent this from ever running again.
            window.Paddle.isSetup = true;
            console.log("✅ Paddle Initialized successfully.");

        } catch (e) {
            console.error("PADDLE INITIALIZATION FAILED:", e);
        }
    }
};

/**
 * A custom React hook that waits for the Paddle.js script (loaded from index.html)
 * to be ready, initializes it for Paddle Billing, and returns its readiness state.
 */
export const usePaddle = (onCheckoutComplete) => {
    // This state tells the consuming component whether the 'Buy Now' button should be active.
    const [isPaddleReady, setIsPaddleReady] = useState(window.Paddle?.isSetup || false);

    // Memoize the callback to create a stable function reference for the useEffect hook.
    const memoizedOnCheckoutComplete = useCallback(onCheckoutComplete, [onCheckoutComplete]);

    useEffect(() => {
        // If our state already shows that Paddle is ready, there's nothing more to do.
        if (isPaddleReady) {
            return;
        }

        // --- Polling mechanism: a robust way to wait for an external script ---

        // This function attempts to run the initialization.
        const trySetup = () => {
            // We check for window.Paddle. If it exists, we run the setup.
            if (window.Paddle) {
                initializePaddle(memoizedOnCheckoutComplete);
                // If the setup function successfully ran, `isSetup` will be true.
                if (window.Paddle.isSetup) {
                    setIsPaddleReady(true);
                }
            }
        };

        // Try to set up immediately in case the script was already cached by the browser.
        trySetup();

        // Set up an interval to check every 200ms if the script has loaded.
        const intervalId = setInterval(() => {
            // If we successfully set up, we can clear this interval.
            if (window.Paddle?.isSetup) {
                clearInterval(intervalId);
                setIsPaddleReady(true); // Final state update just in case.
                return;
            }
            trySetup(); // Otherwise, try again.
        }, 200);

        // Failsafe: Stop polling after a reasonable time (e.g., 10 seconds).
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (!window.Paddle?.isSetup) {
                console.error("Paddle.js did not load after 10 seconds. Check script in index.html and network connection.");
            }
        }, 10000);

        // Cleanup function: This is crucial to prevent memory leaks when the component unmounts.
        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };

    }, [isPaddleReady, memoizedOnCheckoutComplete]);

    // Return the simple boolean readiness status.
    return isPaddleReady;
};