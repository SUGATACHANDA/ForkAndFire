import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import uploadToCloudinary from '../../utils/cloudinaryUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faBoxOpen, faImage, faTags, faUpload,
    faBookBookmark
} from '@fortawesome/free-solid-svg-icons';
import Loader from '../../components/common/Loader';

// Helper component for creating consistent section headers
const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={icon} className="text-accent" />
            {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
);

// Styled form elements for a consistent UI
const StyledInput = (props) => <input {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-accent-light focus:border-accent transition" />;
const StyledTextarea = (props) => <textarea {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-accent-light focus:border-accent transition"></textarea>;

const ProductForm = () => {
    // --- State and Hooks Setup ---
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '', description: '', price: '', totalAmount: '', amountLeft: '', currency: 'USD'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditing);
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [error, setError] = useState(null);

    // --- Data Fetching Effect (for Edit Mode) ---
    useEffect(() => {
        if (isEditing) {
            setIsLoadingData(true);
            const fetchProduct = async () => {
                try {
                    const { data } = await API.get(`/api/products/${id}`);
                    setFormData({
                        name: data.name,
                        description: data.description,
                        price: data.price,
                        totalAmount: data.totalAmount,
                        amountLeft: data.amountLeft,
                        currency: data.currency
                    });
                    setImagePreview(data.imageUrl);
                } catch (err) {
                    setError('Could not find the product to edit.');
                    console.error(err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchProduct();
        } else {
            setIsLoadingData(false);
        }
    }, [id, isEditing]);

    // --- Memoized Handlers for Performance ---
    const handleChange = useCallback(e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const handleImageChange = useCallback(e => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }, []);

    // --- The Main Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing && !imageFile) {
            setError('A product image is required for a new product.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let finalImageUrl = isEditing ? imagePreview : '';

            // Step 1: If a new image was selected, upload it to Cloudinary first
            if (imageFile) {
                setSubmissionStatus('Uploading product image...');
                finalImageUrl = await uploadToCloudinary(imageFile);
            }

            // Step 2: Prepare the final payload with the correct image URL
            const productDataPayload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                currency: formData.currency,
                totalAmount: parseInt(formData.totalAmount, 10),
                // Only send `amountLeft` if editing, otherwise it's derived from `totalAmount`
                ...(isEditing && { amountLeft: parseInt(formData.amountLeft, 10) }),
                imageUrl: finalImageUrl,
            };

            // Step 3: Send data to the correct backend endpoint
            setSubmissionStatus(isEditing ? 'Updating product details...' : 'Creating new product...');
            if (isEditing) {
                await API.put(`/api/products/${id}`, productDataPayload);
            } else {
                await API.post('/api/products', productDataPayload);
            }

            navigate('/admin/products'); // Or to a list of all products

        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred.");
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) return <div className="p-10"><Loader /></div>;

    return (
        <div className="max-w-7xl mx-auto">
            {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center w-96 flex flex-col items-center">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-accent" />
                        <h3 className="text-xl font-bold mt-4">Processing...</h3>
                        <p className="text-gray-600 mt-2 text-sm">{submissionStatus}</p>
                    </div>
                </div>
            )}

            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isEditing ? `Editing: ${formData.name}` : 'Create a New Product'}</h1>
                <p className="text-gray-500 mt-1">{isEditing ? 'Update the details for this item in your store.' : 'Add a new item to your Fork & Fire store inventory.'}</p>
            </header>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column --- */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faBoxOpen} title="Product Details" /><div className="space-y-4"><div><label className="text-sm font-medium text-gray-600">Product Name</label><StyledInput name="name" value={formData.name} onChange={handleChange} required /></div><div><label className="text-sm font-medium text-gray-600">Description</label><StyledTextarea name="description" value={formData.description} onChange={handleChange} rows="6" required /></div></div></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faImage} title="Product Image" /><div className="group relative w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center"><img src={imagePreview} alt="" className={`w-full h-full object-contain p-4 transition-opacity ${imagePreview ? 'opacity-100' : 'opacity-0'}`} /><div className={`absolute text-center text-gray-400 ${imagePreview ? 'hidden' : 'block'}`}><FontAwesomeIcon icon={faImage} size="3x" /><p className="mt-2 text-sm">Select an image</p></div><label htmlFor="product-image-upload" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"><FontAwesomeIcon icon={faUpload} size="2x" /><span className="mt-2 font-semibold">Change Image</span></label><input type="file" accept="image/*" id="product-image-upload" onChange={handleImageChange} className="hidden" /></div></div>
                </div>

                {/* --- Right Column --- */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"><SectionHeader icon={faTags} title="Pricing & Inventory" /><div className="space-y-4"><div><label className="text-sm font-medium text-gray-600">Price (USD)</label><p className="text-xs text-gray-400 mb-1">Changing this updates the price on Paddle.</p><StyledInput name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required placeholder="e.g., 29.99" /></div><div><label className="text-sm font-medium text-gray-600">Total Stock Quantity</label><p className="text-xs text-gray-400 mb-1">{isEditing ? "Increase this if you've added more stock." : "Total units you have to sell."}</p><StyledInput name="totalAmount" type="number" min="0" value={formData.totalAmount} onChange={handleChange} required placeholder="e.g., 50" /></div>{isEditing && (<div><label className="text-sm font-medium text-gray-600">Stock Left (Current Inventory)</label><p className="text-xs text-gray-400 mb-1">Cannot be greater than Total Stock.</p><StyledInput name="amountLeft" type="number" min="0" value={formData.amountLeft} onChange={handleChange} required /></div>)}</div></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm sticky top-20"><SectionHeader icon={faBookBookmark} title="Actions" /><p className="text-sm text-gray-500 mb-4">{isEditing ? "Save your changes." : "Your product will be live after creation."}</p><div className="flex flex-col gap-2"><button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 border rounded-md text-white font-semibold bg-accent hover:bg-opacity-90 disabled:bg-accent/50 disabled:cursor-not-allowed transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create & Publish')}</button><button type="button" onClick={() => navigate('/admin/products')} disabled={isSubmitting} className="w-full py-2.5 px-4 border rounded-md text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors">Cancel</button></div></div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;