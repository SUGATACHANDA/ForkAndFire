import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
    const imageUrl = recipe.mainImage;

    return (
        <Link to={`/recipe/${recipe._id}`} className="group block overflow-hidden rounded-lg shadow-lg bg-white">
            <div className="relative h-64">
                <img
                    src={imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-6">
                <p className="text-sm font-medium text-accent uppercase tracking-wider">{recipe.category.name}</p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-primary-text group-hover:text-accent transition-colors duration-300">{recipe.title}</h3>
                <p className="mt-3 text-secondary-text line-clamp-3">{recipe.description}</p>
            </div>
        </Link>
    );
};

export default RecipeCard;