import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import API from '../../api';
import uploadToCloudinary from '../../utils/cloudinaryUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlusCircle, faImage, faUpload, faTimes,
    faBookBookmark, faListCheck, faCircleQuestion,
    faHourglassHalf, faPhotoFilm, faDrumstickBite,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import Loader from '../../components/common/Loader';

// Helper component for creating consistent section headers for a clean UI.
const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={icon} className="text-accent" />
            {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
);

// Styled form elements to keep the main component JSX cleaner
const StyledInput = (props) => <input {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-accent-light focus:border-accent transition" />;
const StyledTextarea = (props) => <textarea {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-accent-light focus:border-accent transition"></textarea>;

const RecipeForm = () => {
    // --- State and Hooks Setup ---
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: "", description: "", prepTime: "", cookTime: "", servings: "",
        category: "", youtubeUrl: "", mainImage: null,
        ingredients: [{ id: uuidv4(), value: '' }],
        steps: [{ id: uuidv4(), description: "", image: "" }],
        faqs: [],
    });
    const [newImages, setNewImages] = useState({ main: null, steps: {} });
    const [dependencies, setDependencies] = useState({ categories: [], faqs: [] });
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [error, setError] = useState(null);

    // --- Data Fetching Effect ---
    useEffect(() => {
        setIsFetchingData(true);
        const fetchData = async () => {
            try {
                const [categoriesRes, faqsRes] = await Promise.all([API.get("/api/categories"), API.get("/api/faqs")]);
                if (isEditing) {
                    const { data } = await API.get(`/api/recipes/${id}`);
                    setFormData({
                        title: data.title || "", description: data.description || "",
                        prepTime: data.prepTime || "", cookTime: data.cookTime || "",
                        servings: data.servings || "", category: data.category?._id || "",
                        youtubeUrl: data.youtubeUrl || "", mainImage: data.mainImage || null,
                        ingredients: data.ingredients?.length ? data.ingredients.map(ing => ({ id: uuidv4(), value: ing })) : [{ id: uuidv4(), value: '' }],
                        steps: data.steps?.length ? data.steps.map(s => ({ id: uuidv4(), description: s.description || "", image: s.image || "" })) : [{ id: uuidv4(), description: "", image: "" }],
                        faqs: data.faqs?.map(f => f._id) || [],
                    });
                }
                setDependencies({ categories: categoriesRes.data, faqs: faqsRes.data });
            } catch (err) {
                setError("Could not load form data. Please refresh the page.");
                console.error("Fetch Data Error:", err);
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    // --- Optimized Event Handlers using useCallback for stable functions ---
    const handleChange = useCallback(e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })), []);

    const handleFileChange = useCallback((e, type, stepId = null) => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === "main") setNewImages(prev => ({ ...prev, main: file }));
            else if (type === "step") setNewImages(prev => ({ ...prev, steps: { ...prev.steps, [stepId]: file } }));
        }
    }, []);

    const handleIngredientChange = useCallback((id, value) => {
        setFormData(prev => ({ ...prev, ingredients: prev.ingredients.map(ing => ing.id === id ? { ...ing, value } : ing) }));
    }, []);

    const handleStepDescriptionChange = useCallback((id, value) => {
        setFormData(prev => ({ ...prev, steps: prev.steps.map(step => step.id === id ? { ...step, description: value } : step) }));
    }, []);

    const addListItem = useCallback((field, defaultValue) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], { ...defaultValue, id: uuidv4() }] }));
    }, []);

    const removeListItem = useCallback((field, id) => {
        setFormData(prev => {
            if (prev[field].length <= 1) return prev;
            return { ...prev, [field]: prev[field].filter(item => item.id !== id) };
        });
    }, []);

    const handleFaqToggle = useCallback((faqId) => {
        setFormData(prev => ({ ...prev, faqs: prev.faqs.includes(faqId) ? prev.faqs.filter(id => id !== faqId) : [...prev.faqs, faqId] }));
    }, []);

    const getPreviewUrl = useCallback((type, stepId = null) => {
        const newFile = type === 'main' ? newImages.main : newImages.steps[stepId];
        if (newFile) return URL.createObjectURL(newFile);

        const existingPath = type === 'main' ? formData.mainImage : formData.steps.find(s => s.id === stepId)?.image;
        if (existingPath) return existingPath; // Cloudinary returns a full URL
        return null;
    }, [newImages, formData.mainImage, formData.steps]);


    // --- Intelligent `handleSubmit` using Cloudinary ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSubmissionStatus('Preparing to submit...');

        try {
            let payload = { ...formData };

            setSubmissionStatus('Uploading new images...');
            const uploadPromises = [];
            if (newImages.main) {
                uploadPromises.push(uploadToCloudinary(newImages.main).then(url => ({ type: 'main', url })));
            }
            Object.keys(newImages.steps).forEach(stepId => {
                uploadPromises.push(uploadToCloudinary(newImages.steps[stepId]).then(url => ({ type: 'step', id: stepId, url })));
            });

            const uploadResults = await Promise.all(uploadPromises);

            let newMainImageUrl = payload.mainImage;
            const stepUrlMap = new Map();
            uploadResults.forEach(result => {
                if (result.type === 'main') newMainImageUrl = result.url;
                else if (result.type === 'step') stepUrlMap.set(result.id, result.url);
            });

            const finalPayload = {
                title: payload.title,
                description: payload.description,
                prepTime: payload.prepTime,
                cookTime: payload.cookTime,
                servings: payload.servings,
                category: payload.category,
                youtubeUrl: payload.youtubeUrl,
                mainImage: newMainImageUrl,
                ingredients: payload.ingredients.map(ing => ing.value).filter(Boolean),
                steps: payload.steps.map(step => ({
                    description: step.description,
                    image: stepUrlMap.get(step.id) || step.image || ''
                })),
                faqs: payload.faqs,
            };

            setSubmissionStatus('Saving recipe to database...');
            if (isEditing) {
                await API.put(`/api/recipes/${id}`, finalPayload);
            } else {
                await API.post("/api/recipes", finalPayload);
            }

            navigate("/admin/recipes");

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred during submission.");
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (isFetchingData) return <div className="p-10"><Loader /></div>;

    return (
        <div className="max-w-7xl mx-auto">
            {isSubmitting && (<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl text-center w-96 flex flex-col items-center"><Loader /><h3 className="text-xl font-bold mt-4">Saving...</h3><p className="text-gray-600 mt-2 text-sm">{submissionStatus}</p></div></div>)}
            <header className="mb-8"><h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isEditing ? "Edit Recipe" : "Create a New Recipe"}</h1><p className="text-gray-500 mt-1">Fill in the details below to add or update a recipe.</p></header>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Main Content --- */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faCircleInfo} title="Core Information" /><div className="space-y-4"><div><label className="text-sm font-medium text-gray-600">Recipe Title</label><StyledInput name="title" value={formData.title} onChange={handleChange} required /></div><div><label className="text-sm font-medium text-gray-600">Description</label><StyledTextarea name="description" value={formData.description} onChange={handleChange} rows="5" /></div></div></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faDrumstickBite} title="Ingredients" subtitle="List all the ingredients required." /><div className="space-y-2">{formData.ingredients.map((ing) => (<div key={ing.id} className="flex items-center gap-2"><StyledInput placeholder={`Ingredient`} value={ing.value} onChange={(e) => handleIngredientChange(ing.id, e.target.value)} /><button type="button" onClick={() => removeListItem("ingredients", ing.id)} className="text-gray-400 hover:text-red-500 p-2 shrink-0"><FontAwesomeIcon icon={faTimes} /></button></div>))}</div><button type="button" onClick={() => addListItem('ingredients', { value: '' })} className="text-sm mt-4 font-semibold text-accent flex items-center gap-2 hover:underline"><FontAwesomeIcon icon={faPlusCircle} /> Add Ingredient</button></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faListCheck} title="Instructions" subtitle="Add the steps to create your recipe." /><div className="space-y-4">{formData.steps.map((step, index) => (<div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50/50"><span className="text-xl font-bold font-serif text-accent pt-2">{index + 1}.</span><div className="flex-grow space-y-3"><StyledTextarea value={step.description} onChange={e => handleStepDescriptionChange(step.id, e.target.value)} rows="3" placeholder="Describe the step..." /><div className="flex items-center gap-4"><div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden shrink-0">{getPreviewUrl("step", step.id) ? <img src={getPreviewUrl("step", step.id)} alt={`Step ${index + 1}`} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faPhotoFilm} className="text-gray-400" />}</div><input type="file" accept="image/*" id={`step-image-${step.id}`} onChange={e => handleFileChange(e, "step", step.id)} className="hidden" /><label htmlFor={`step-image-${step.id}`} className="text-sm font-semibold text-accent cursor-pointer hover:underline">Change Image</label></div></div><button type="button" onClick={() => removeListItem("steps", step.id)} className="text-gray-400 hover:text-red-500 p-2"><FontAwesomeIcon icon={faTimes} /></button></div>))}</div><button type="button" onClick={() => addListItem('steps', { description: '', image: '' })} className="text-sm mt-4 font-semibold text-accent flex items-center gap-2 hover:underline"><FontAwesomeIcon icon={faPlusCircle} /> Add Step</button></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faCircleQuestion} title="Linked FAQs" subtitle="Select questions to show on the recipe page." /><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{dependencies.faqs.map(faq => (<label key={faq._id} className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" checked={formData.faqs.includes(faq._id)} onChange={() => handleFaqToggle(faq._id)} className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent" /><span className="ml-2 block text-sm text-gray-700">{faq.question}</span></label>))}</div></div>
                </div>
                {/* --- Right Column --- */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faPhotoFilm} title="Media" /><div className="group"><label className="text-sm font-medium text-gray-600 mb-2 block">Main Cover Image</label><div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-2 relative"><img src={getPreviewUrl("main")} alt="" className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${getPreviewUrl("main") ? '' : 'hidden'}`} /><div className={`absolute text-gray-300 ${getPreviewUrl("main") ? 'hidden' : 'block'}`}><FontAwesomeIcon icon={faImage} size="3x" /></div><label htmlFor="main-image-upload" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FontAwesomeIcon icon={faUpload} className="mr-2" /> Change Image</label><input type="file" accept="image/*" id="main-image-upload" onChange={(e) => handleFileChange(e, "main")} className="hidden" /></div></div><div className="mt-4"><label className="text-sm font-medium text-gray-600">YouTube URL</label><div className="relative"><FontAwesomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><StyledInput name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://..." className="pl-9" /></div></div></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4"><SectionHeader icon={faHourglassHalf} title="Details" /><div><label className="text-sm font-medium text-gray-600">Category</label><select name="category" value={formData.category} onChange={handleChange} required className="w-full mt-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-accent-light focus:border-accent transition"><option value="">Select a Category</option>{dependencies.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div><div className="grid grid-cols-3 gap-3 text-center"><div><label className="text-sm font-medium text-gray-600">Prep Time</label><StyledInput name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="15m" /></div><div><label className="text-sm font-medium text-gray-600">Cook Time</label><StyledInput name="cookTime" value={formData.cookTime} onChange={handleChange} placeholder="30m" /></div><div><label className="text-sm font-medium text-gray-600">Servings</label><StyledInput name="servings" value={formData.servings} onChange={handleChange} placeholder="4" /></div></div></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm sticky top-20"><SectionHeader icon={faBookBookmark} title="Actions" /><p className="text-sm text-gray-500 mb-4">Review all details before saving.</p><div className="flex flex-col gap-2"><button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 border rounded-md text-white font-semibold bg-accent hover:bg-opacity-90 disabled:bg-accent/50 disabled:cursor-not-allowed transition-colors">{isSubmitting ? "Saving..." : (isEditing ? "Update Recipe" : "Publish Recipe")}</button><button type="button" onClick={() => navigate("/admin/recipes")} disabled={isSubmitting} className="w-full py-2.5 px-4 border rounded-md text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors">Cancel</button></div></div>
                </div>
            </form>
        </div>
    );
};

export default RecipeForm;