import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api';
import { useDebounce } from '../../hooks/useDebounce'; // <-- Import the hook
import RecipeCard from '../../components/recipe/RecipeCard';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import noResultsImage from '../../assets/images/no-results.svg';

const AllRecipesPage = () => {
    // --- State for data fetched from API ---
    const [allRecipes, setAllRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();

    // --- State for filter inputs ---
    // The searchTerm updates instantly on every keystroke for a responsive input field
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    // The category is read directly from the URL params for instant updates
    const selectedCategory = searchParams.get('category') || '';

    // --- Debounced value ---
    // This value only updates 500ms after the user stops typing in the search bar
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // --- Data Fetching Effect ---
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const [recipesRes, categoriesRes] = await Promise.all([
                    API.get('/api/recipes'),
                    API.get('/api/categories'),
                ]);
                setAllRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : []);
                setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
            } catch (err) {
                console.log(err)
                setError('Could not load recipes. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Effect to Sync Debounced Search with URL ---
    // This effect runs ONLY when the debounced search term or selected category changes
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        if (debouncedSearchTerm) {
            newParams.set('search', debouncedSearchTerm);
        } else {
            newParams.delete('search');
        }
        if (selectedCategory) {
            newParams.set('category', selectedCategory);
        } else {
            newParams.delete('category');
        }

        // `replace: true` is important to avoid polluting browser history with every keystroke
        setSearchParams(newParams, { replace: true });

    }, [debouncedSearchTerm, searchParams, selectedCategory, setSearchParams]);

    // --- Event Handlers ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // Update the local state instantly
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        // No need for local state, directly update the URL params, triggering the effect
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (categoryId) newParams.set('category', categoryId);
            else newParams.delete('category');
            return newParams;
        }, { replace: true });
    };

    const clearFilters = () => {
        setSearchTerm(''); // This clears the input field
        setSearchParams({}, { replace: true }); // This clears the URL and filters
    };

    // --- Memoized Filtering Logic (uses the debounced value) ---
    const recipesToDisplay = useMemo(() => {
        return allRecipes
            .filter(recipe => !debouncedSearchTerm || recipe.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .filter(recipe => !selectedCategory || recipe.category?._id === selectedCategory);
    }, [allRecipes, debouncedSearchTerm, selectedCategory]);

    const getPageTitle = () => {
        if (!selectedCategory) return 'All Recipes';
        const category = categories.find(cat => cat._id === selectedCategory);
        return category ? `${category.name} Recipes` : 'Filtered Recipes';
    };

    const isFilterActive = !!debouncedSearchTerm || !!selectedCategory;

    return (
        <div className="bg-background">
            <div className="container mx-auto py-16 px-4 sm:px-6 min-h-screen">
                <header className="text-center mb-12">
                    <p className="text-sm font-bold text-accent uppercase tracking-widest">{selectedCategory ? 'Filtered View' : 'Our Collection'}</p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-primary-text mt-2">{getPageTitle()}</h1>
                </header>

                <div className="top-20 z-40 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-sm mb-12">
                    {/* The grid now becomes 3 columns on lg screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">

                        {/* Search Input: Now spans 2 columns on md, but only 1 on lg */}
                        <div className="relative md:col-span-2 lg:col-span-1">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by recipe name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-light focus:border-accent transition"
                            />
                        </div>

                        {/* Category Select: No change */}
                        <div className="">
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-light focus:border-accent transition appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                <option value="">Filter by Category...</option>
                                {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                            </select>
                        </div>

                        {/* Clear Filter Button: Now always rendered */}
                        <div className="">
                            <button
                                onClick={clearFilters}
                                // The button is disabled and visually faded when no filter is active
                                disabled={!isFilterActive}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                <main>
                    {loading ? (<div className="flex justify-center pt-20"><Loader /></div>) : error ? (<div className="text-center py-20 text-red-500 font-semibold">{error}</div>) : recipesToDisplay.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">{recipesToDisplay.map(recipe => (<RecipeCard key={recipe._id} recipe={recipe} />))}</div>) : (<div className="text-center py-20 flex flex-col items-center"><img src={noResultsImage} alt="No recipes found" className="w-64 h-64 mb-6" /><h3 className="text-2xl font-semibold text-primary-text">No Recipes Found</h3><p className="text-secondary-text mt-2 max-w-md">We couldn't find any recipes matching your criteria.</p>{isFilterActive && (<button onClick={clearFilters} className="mt-6 flex items-center justify-center gap-2 px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition"><FontAwesomeIcon icon={faTimes} /> Clear All Filters</button>)}</div>)}
                </main>
            </div>
        </div>
    );
};

export default AllRecipesPage;