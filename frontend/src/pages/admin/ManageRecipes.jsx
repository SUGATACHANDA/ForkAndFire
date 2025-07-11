import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/index';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const ManageRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/api/recipes')
            .then(res => {
                setRecipes(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await API.delete(`/api/recipes/${id}`);
                setRecipes(recipes.filter(r => r._id !== id));
            } catch (error) {
                console.error("Failed to delete recipe", error);
            }
        }
    }

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Recipes</h1>
                <Link to="/admin/recipes/new">
                    <Button>Add New Recipe</Button>
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Created At</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map(recipe => (
                            <tr key={recipe._id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{recipe.title}</th>
                                <td className="px-6 py-4">{recipe.category?.name || 'N/A'}</td>
                                <td className="px-6 py-4">{new Date(recipe.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    <Link to={`/admin/recipes/edit/${recipe._id}`} className="font-medium text-accent hover:underline">Edit</Link>
                                    <button onClick={() => handleDelete(recipe._id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageRecipes;