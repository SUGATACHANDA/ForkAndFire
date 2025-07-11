import React, { useState, useEffect } from 'react';
import API from '../../api/index';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const ManageCategories = () => {
    // State for the list of categories
    const [categories, setCategories] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // State for the "Add New" form
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // State for inline editing
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    // Fetch all categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoadingList(true);
            const { data } = await API.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoadingList(false);
        }
    };

    // Handler for creating a new category
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');
        try {
            await API.post('/api/categories', { name: newCategoryName });
            setNewCategoryName(''); // Reset form
            fetchCategories(); // Refresh the list
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to add category');
        } finally {
            setIsCreating(false);
        }
    };

    // Handler for deleting a category
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This may affect existing recipes.')) {
            try {
                await API.delete(`/api/categories/${id}`);
                fetchCategories(); // Refresh list
            } catch (error) {
                console.error("Failed to delete category", error);
                alert("Could not delete category.");
            }
        }
    };

    // Handler for updating a category
    const handleUpdate = async (id) => {
        try {
            await API.put(`/api/categories/${id}`, { name: editingCategoryName });
            setEditingCategoryId(null); // Exit editing mode
            setEditingCategoryName('');
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Failed to update category", error);
            alert("Could not update category.");
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Categories</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Form to Add New Category --- */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Category</h3>
                        {createError && <div className="text-red-500 bg-red-100 p-2 rounded mb-3 text-sm">{createError}</div>}
                        <div className="space-y-4">
                            <Input
                                label="Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., Desserts, Appetizers"
                                required
                            />
                            <Button type="submit" disabled={isCreating} fullWidth>
                                {isCreating ? 'Adding...' : 'Add Category'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* --- List of Existing Categories --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Categories</h3>
                    {loadingList ? <Loader /> : (
                        <ul className="space-y-3">
                            {categories.map((cat) => (
                                <li key={cat._id} className="border-b py-3 flex justify-between items-center transition-colors duration-200">
                                    {editingCategoryId === cat._id ? (
                                        // --- Editing View ---
                                        <div className="flex-grow flex items-center gap-2">
                                            <Input
                                                value={editingCategoryName}
                                                onChange={e => setEditingCategoryName(e.target.value)}
                                                className="py-1"
                                            />
                                            <button onClick={() => handleUpdate(cat._id)} className="text-green-500 hover:text-green-700 p-2"><FontAwesomeIcon icon={faSave} /></button>
                                            <button onClick={() => setEditingCategoryId(null)} className="text-red-500 hover:text-red-700 p-2"><FontAwesomeIcon icon={faTimes} /></button>
                                        </div>
                                    ) : (
                                        // --- Display View ---
                                        <>
                                            <span className="text-gray-800">{cat.name}</span>
                                            <div className="space-x-3">
                                                <button onClick={() => {
                                                    setEditingCategoryId(cat._id);
                                                    setEditingCategoryName(cat.name);
                                                }} className="text-blue-500 hover:text-blue-700 p-1">
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 p-1">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCategories;