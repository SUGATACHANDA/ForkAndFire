import React, { useState, useEffect, useCallback } from "react";
import API from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import Loader from "../common/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

// A private, presentational sub-component for displaying a single comment.
// This keeps the main component's render logic cleaner.
const Comment = ({ user, text, date }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center text-lg font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3">
                <p className="font-bold text-primary-text">
                    {user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-secondary-text">
                    {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>
            <p className="mt-1 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {text}
            </p>
        </div>
    </div>
);

const CommentSection = ({ recipeId, initialCommentCount = 0 }) => {
    const { userInfo } = useAuth(); // Get logged-in user info

    // === State Management ===
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(initialCommentCount);
    const [newComment, setNewComment] = useState("");
    const location = useLocation();

    // UI states
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // === Data Fetching Effect ===
    useEffect(() => {
        // Guard clause in case recipeId isn't available yet
        if (!recipeId) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchComments = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/api/comments/recipe/${recipeId}`, {
                    signal,
                });
                if (Array.isArray(data)) {
                    setComments(data);
                    setCommentCount(data.length); // Re-sync count with the actual data length
                }
            } catch (err) {
                if (err.name !== "CanceledError") {
                    console.error("Failed to fetch comments", err);
                    setError("Could not load comments.");
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchComments();

        return () => controller.abort();
    }, [recipeId]);

    // This effect ensures the count is updated if the parent prop changes (e.g., navigating between recipes)
    useEffect(() => {
        setCommentCount(initialCommentCount);
    }, [initialCommentCount]);

    // === Event Handler for Submitting a New Comment ===
    const handleCommentSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            // Prevent submitting empty comments
            if (!newComment.trim()) {
                setError("Comment cannot be empty.");
                return;
            }

            setIsSubmitting(true);
            setError("");

            try {
                const { data: createdComment } = await API.post("/api/comments", {
                    recipeId,
                    text: newComment,
                });

                // --- Optimistic UI Update ---
                // 1. Add the newly created comment to the top of the list instantly.
                setComments((prevComments) => [createdComment, ...prevComments]);
                // 2. Increment the comment counter.
                setCommentCount((prevCount) => prevCount + 1);
                // 3. Clear the textarea.
                setNewComment("");
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to post comment. Please try again."
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [newComment, recipeId]
    ); // Note dependencies

    return (
        // The `id` here allows smooth scrolling from a link
        <div id="comment-section" className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-serif font-bold text-primary-text mb-8 flex items-center gap-3">
                <FontAwesomeIcon icon={faCommentDots} className="text-accent" />
                Discussion ({commentCount})
            </h2>

            {/* --- Comment Submission Form --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-12">
                {userInfo ? (
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="comment-textarea"
                                className="font-semibold text-gray-700 sr-only"
                            >
                                Your Comment
                            </label>
                            <textarea
                                id="comment-textarea"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Sharing a tip or question, ${userInfo.name}?`}
                                rows="4"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow disabled:bg-gray-100"
                                disabled={isSubmitting}
                            ></textarea>
                        </div>
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="bg-accent text-white font-semibold py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-accent/50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Posting..." : "Post Comment"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center p-4 bg-gray-50/70 rounded-md">
                        <p className="text-secondary-text">
                            <Link
                                to="/login"
                                state={{ from: location }}
                                className="text-accent font-bold hover:underline"
                            >
                                Log in
                            </Link>{" "}
                            or{" "}
                            <Link
                                to="/signup"
                                className="text-accent font-bold hover:underline"
                            >
                                sign up
                            </Link>{" "}
                            to join the discussion!
                        </p>
                    </div>
                )}
            </div>

            {/* --- List of Displayed Comments --- */}
            <div className="space-y-2">
                {loading ? (
                    <Loader />
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            user={comment.user}
                            text={comment.text}
                            date={comment.createdAt}
                        />
                    ))
                ) : (
                    <p className="text-secondary-text text-center py-8">
                        Be the first to share your thoughts!
                    </p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
