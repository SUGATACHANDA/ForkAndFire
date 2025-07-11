import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, imageUrl }) => {
    return (
        <Link to={`/recipes?category=${category._id}`} className="block group relative rounded-xl overflow-hidden shadow-lg aspect-w-1 aspect-h-1">
            {/* Image */}
            <img src={imageUrl} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-2xl font-bold font-serif">{category.name}</h3>
                <div className="h-0.5 w-10 bg-accent mt-2 transition-all duration-500 group-hover:w-16"></div>
            </div>
        </Link>
    );
};

export default CategoryCard;