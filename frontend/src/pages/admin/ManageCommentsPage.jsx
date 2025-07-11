import React, { useState, useEffect } from 'react';
import API from '../../api/index';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const ManageCommentsPage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/api/comments');
                setComments(data);
            } catch (error) {
                console.error("Failed to fetch comments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, []);

    const handleDelete = async (commentId) => {
        if (window.confirm('Are you sure you want to permanently delete this comment?')) {
            try {
                await API.delete(`/api/comments/${commentId}`);
                // Remove the comment from the state to update the UI instantly
                setComments(prev => prev.filter(c => c._id !== commentId));
            } catch (error) {
                console.error('Failed to delete comment', error);
                alert('Could not delete comment.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Comments</h1>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Comment</th>
                            <th scope="col" className="px-6 py-3">Author</th>
                            <th scope="col" className="px-6 py-3">On Recipe</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map(comment => (
                            <tr key={comment._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 max-w-sm">
                                    <p className="line-clamp-3">{comment.text}</p>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {comment.user?.name || 'User Deleted'}
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        to={`/recipe/${comment.recipe?._id}`}
                                        target="_blank"
                                        className="text-accent hover:underline flex items-center gap-1.5"
                                    >
                                        {comment.recipe?.title || 'Recipe Deleted'}
                                        <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(comment._id)} className="text-red-600 hover:text-red-800 font-medium">
                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {comments.length === 0 && <p className="text-center p-8 text-gray-500">No comments found.</p>}
            </div>
        </div>
    );
};

export default ManageCommentsPage;