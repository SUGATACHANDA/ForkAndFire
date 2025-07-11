import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

/**
 * A smart share button that uses the native Web Share API on supported devices
 * and falls back to a "copy to clipboard" functionality on others.
 * @param {object} props
 * @param {string} props.recipeTitle - The title of the recipe for the share message.
 * @param {string} props.shareUrl - The full URL of the recipe page to be shared.
 */
const ShareButton = ({ recipeTitle, shareUrl }) => {
    // State to manage the "Copied!" confirmation message for the desktop fallback.
    const [copied, setCopied] = useState(false);

    // The main handler for the share functionality.
    // Wrapped in useCallback so it's not recreated on every render of the parent.
    const handleShare = useCallback(async () => {

        // This is the data object that will be passed to the Share API.
        const shareData = {
            title: `Fork & Fire Recipe: ${recipeTitle}`,
            text: `I found this amazing recipe for "${recipeTitle}" on Fork & Fire, and I wanted to share it with you!`,
            url: shareUrl,
        };

        // --- NATIVE WEB SHARE API (Mobile-First Approach) ---
        // We check if the browser supports the `navigator.share` function.
        if (navigator.share) {
            try {
                // If supported, we open the device's native share dialog.
                // The `text` property will be pre-filled in apps like Messages, WhatsApp, etc.
                await navigator.share(shareData);
            } catch (error) {
                // This error usually happens if the user dismisses the share dialog.
                // It's not a true application error, so we can safely ignore it or log it quietly.
                console.log('User cancelled the share dialog or it failed:', error);
            }
        } else {
            // --- FALLBACK: COPY TO CLIPBOARD (For Desktop Browsers) ---
            try {
                // Use the modern and secure Clipboard API to copy the URL.
                // Copying just the URL is a better experience on desktop than a long pre-filled message.
                await navigator.clipboard.writeText(shareUrl);

                // Provide positive feedback to the user that the action was successful.
                setCopied(true);

                // Reset the button's "Copied!" state after 2 seconds.
                setTimeout(() => {
                    setCopied(false);
                }, 2000);

            } catch (error) {
                console.error('Failed to copy link to clipboard:', error);
                // In the rare case of an error, inform the user.
                alert("Sorry, the recipe link could not be copied to your clipboard.");
            }
        }
    }, [recipeTitle, shareUrl]); // The function depends on these props.

    // A helper function to determine what the button should display.
    const getButtonContent = () => {
        if (copied) {
            return (
                <>
                    <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                    <span>Link Copied!</span>
                </>
            );
        }

        // We only need to check for navigator support once on the client-side.
        if (typeof navigator !== 'undefined' && navigator.share) {
            return (
                <>
                    <FontAwesomeIcon icon={faShareNodes} />
                    <span>Share Recipe</span>
                </>
            );
        }

        // Default content for desktop fallback.
        return (
            <>
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy Link</span>
            </>
        );
    };

    return (
        <button
            onClick={handleShare}
            className="w-full mt-2 bg-gray-100 text-primary-text font-semibold py-2.5 px-5 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            aria-label="Share this recipe"
        >
            {getButtonContent()}
        </button>
    );
};

export default ShareButton;