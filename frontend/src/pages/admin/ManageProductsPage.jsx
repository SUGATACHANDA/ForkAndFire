import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrash, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import clsx from "clsx"

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    document.title = "Manage All Your Shop Products | Fork & Fire";

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/api/products/all'); // Assumes an admin route to get ALL products, even out of stock
            setProducts(data);
        } catch (err) {
            console.log(err)
            setError('Could not fetch products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"? This will archive it on Paddle and remove it permanently from the database.`)) {
            try {
                await API.delete(`/api/products/${productId}`);
                // Refresh the list after deletion
                fetchProducts();
            } catch (err) {
                alert(`Failed to delete product: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;
    if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
                <Link to="/admin/products/new" className="bg-accent text-white font-semibold py-2 px-5 rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <FontAwesomeIcon icon={faPlus} /> Create New Product
                </Link>
            </header>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-16">Image</th>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isOutOfStock = product.amountLeft <= 0;
                            return (
                                // === THE FIX - PART 2: Apply conditional styling for out-of-stock items ===
                                <tr key={product._id} className={clsx(
                                    "bg-white border-b align-middle transition-colors",
                                    isOutOfStock ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                                )}>
                                    <td className="px-6 py-2">
                                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-bold text-gray-900">
                                        {product.name}
                                        {isOutOfStock && <span className="ml-2 text-xs font-normal text-red-600">(Sold Out)</span>}
                                    </th>
                                    <td className="px-6 py-4">
                                        {isOutOfStock ? (
                                            <span className="font-bold text-red-600 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBoxOpen} /> Out of Stock
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-green-700">
                                                {product.amountLeft} / {product.totalAmount}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        ${product.price?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <Link to={`/admin/products/edit/${product._id}`} className="font-medium text-accent hover:underline">
                                            <FontAwesomeIcon icon={faPenToSquare} className="mr-1" /> Restock/Edit
                                        </Link>
                                        <button onClick={() => handleDelete(product._id, product.name)} className="font-medium text-red-600 hover:text-red-800">
                                            <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {products.length === 0 && <p className="text-center p-8 text-gray-500">No products found. Time to add one!</p>}
            </div>
        </div>
    );
};

export default ManageProducts;