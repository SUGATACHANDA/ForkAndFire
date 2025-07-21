import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const isOutOfStock = product.amountLeft <= 0;

    return (
        <div className="product-card"> {/* Added class for GSAP targeting */}
            <Link
                to={isOutOfStock ? '#' : `/product/${product._id}`}
                className={`block group relative rounded-xl shadow-md overflow-hidden aspect-[4/5] bg-gray-100 ${isOutOfStock ? 'cursor-not-allowed saturate-50' : ''
                    }`}
            >
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                />

                <div className={`absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isOutOfStock ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <h3 className="text-xl font-bold font-serif">{product.name}</h3>

                    <div className="mt-4 flex justify-between items-center">
                        {isOutOfStock &&
                            <span className="font-bold text-sm uppercase bg-gray-700 px-3 py-1 rounded-full">Sold Out</span>
                            // (<p className="text-2xl font-bold font-serif">${product.price.toFixed(2)}</p>)
                        }
                        <div className="text-primary-text w-full bg-white font-semibold text-sm py-2 px-4 rounded-full transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0">
                            View Product
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;