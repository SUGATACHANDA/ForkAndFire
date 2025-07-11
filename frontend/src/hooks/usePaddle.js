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

import { useState, useEffect } from 'react';

/**
 * A custom React hook to reliably load the Paddle.js script and report its readiness.
 *
 * This version uses the "Bypass" strategy: It does NOT call Paddle.Initialize().
 * Its only job is to load the script and confirm that the `window.Paddle` object exists.
 * The responsibility of initializing the environment and opening the checkout is
 * moved to the component that calls this hook (e.g., ProductPage.jsx).
 * This is the most robust method for avoiding specific initialization errors like the
 * 'profitwellSnippetBase' bug.
 *
 * @returns {boolean} A stateful boolean that is `true` only when the Paddle.js script has fully loaded.
 */
export const usePaddle = () => {
    // This state simply tracks if `window.Paddle` is available.
    const [isPaddleReady, setIsPaddleReady] = useState(!!window.Paddle);

    useEffect(() => {
        // If Paddle is already ready (e.g., from a previous page navigation), do nothing.
        if (isPaddleReady) {
            return;
        }

        const scriptId = 'paddle-js-script';
        let script = document.getElementById(scriptId);

        // This function will run once the script successfully loads.
        const onScriptLoad = () => {
            console.log("✅ Paddle.js script has loaded and window.Paddle is now available.");
            // Update our state to signal readiness to all consuming components.
            setIsPaddleReady(true);
        };

        const onScriptError = () => {
            console.error("Fatal Error: Failed to load the Paddle.js script from CDN. Check network or ad-blockers.");
            setIsPaddleReady(false); // Ensure readiness is false on error.
        };


        if (script) {
            // If the script tag is already in the DOM from a previous hook usage or from index.html...
            // We check its readyState to see if it has already loaded.
            if (script.readyState) { // For older IE browsers
                script.onreadystatechange = () => {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        onScriptLoad();
                    }
                };
            } else { // For modern browsers
                script.addEventListener('load', onScriptLoad);
                script.addEventListener('error', onScriptError);
            }
        } else {
            // If the script tag does not exist, create it.
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.paddle.com/paddle.js';
            script.async = true;

            // Attach our onload and onerror handlers.
            script.addEventListener('load', onScriptLoad);
            script.addEventListener('error', onScriptError);

            // Append the script to the body to start downloading.
            document.body.appendChild(script);
        }

        // --- Cleanup Function ---
        // This runs when the component that uses this hook unmounts.
        return () => {
            if (script) {
                script.removeEventListener('load', onScriptLoad);
                script.removeEventListener('error', onScriptError);
            }
        };

    }, [isPaddleReady]); // The effect depends on the readiness state.

    return isPaddleReady;
};