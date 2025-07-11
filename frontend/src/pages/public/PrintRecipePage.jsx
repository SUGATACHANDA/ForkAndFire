// src/pages/PrintRecipePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import Loader from '../../components/common/Loader';

import '../../print.css';
import Preloader from '../../components/layout/Preloader';

const PrintRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const contentRef = useRef();

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const { data } = await API.get(`/api/recipes/${id}`);
                setRecipe(data);
            } catch (err) {
                console.log(err)
                setError('Failed to load recipe.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };
    const siteURL = window.location.origin

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Preloader /></div>;
    if (error) return <div className="text-center text-red-600 mt-20">{error}</div>;
    if (!recipe) return <div className="text-center mt-20">Recipe not found.</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header with Back and Print buttons */}
            <div className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-10 no-print">
                <button
                    onClick={() => navigate(`/recipe/${id}`)}
                    className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                    ← Back to Recipe
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    🖨️ Print Recipe
                </button>
            </div>

            {/* Printable Content */}
            <div
                id="printable-content"
                ref={contentRef}
                className="print-pdf px-[60px] py-[50px] font-serif text-[#222] bg-white"
            >
                <h1 className="text-[32px] font-bold text-center mb-1 leading-tight uppercase">
                    {recipe.title}
                </h1>
                <p className="author text-[14px] text-center mb-4 italic tracking-wide">By Fork & Fire Kitchen</p>

                <hr className="border-t border-black my-5" />

                {/* Description */}
                {recipe.description && (
                    <p className="text-[14px] leading-6 mb-6 whitespace-pre-line text-justify">
                        {recipe.description}
                    </p>
                )}

                {/* Meta Info */}
                {/* Meta Info Table - Full Width, Clean Layout */}
                {/* Meta Info Table - Full Width, Centered Content */}
                <table className="w-full border-t border-b border-black text-[13px] mb-6 table-fixed text-center">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-1 px-2 font-semibold">Prep Time</th>
                            <th className="py-1 px-2 font-semibold">Cook Time</th>
                            <th className="py-1 px-2 font-semibold">Servings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1 px-2">{recipe.prepTime || '—'}</td>
                            <td className="py-1 px-2">{recipe.cookTime || '—'}</td>
                            <td className="py-1 px-2">{recipe.servings || '—'}</td>
                        </tr>
                    </tbody>
                </table>


                {/* Ingredients */}
                <h2 className="text-[18px] font-bold uppercase border-b border-black pb-1 mb-2">Ingredients</h2>
                <ul className="list-disc ml-6 text-[14px] space-y-1 mb-8 text-justify">
                    {recipe.ingredients?.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

                {/* Instructions */}
                <h2 className="text-[18px] font-bold uppercase border-b border-black pb-1 mb-2">Instructions</h2>
                <ol className="list-decimal ml-6 text-[14px] space-y-3 mb-10 text-justify">
                    {recipe.steps?.map((step, index) => (
                        <li key={index}>
                            <p>{step.description}</p>
                        </li>
                    ))}
                </ol>

                {/* Footer */}
                <hr className="border-t border-black my-6" />
                <footer className="text-center text-[13px] italic">
                    Enjoy your homemade meal – Visit <Link to={`${siteURL}/recipes`} target='_blank' className='underline'>Fork & Fire</Link> for more!
                </footer>
            </div>
        </div>
    );
};

export default PrintRecipePage;
