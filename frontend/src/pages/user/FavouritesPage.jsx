import React, { useState, useEffect } from 'react';
import API from '../../api/index';
import RecipeCard from '../../components/recipe/RecipeCard';
import Loader from '../../components/common/Loader';

const FavoritesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/api/users/favorites');
                setRecipes(data);
            } catch (err) {
                setError('Could not load your favorite recipes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto py-16 px-6">
            <h1 className="text-4xl font-serif font-bold text-center mb-12">My Favorite Recipes</h1>
            {error && <p className="text-center text-red-500">{error}</p>}

            {recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {recipes.map(recipe => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-secondary-text text-lg">You haven't added any recipes to your favorites yet.</p>
            )}
        </div>
    );
};

export default FavoritesPage;