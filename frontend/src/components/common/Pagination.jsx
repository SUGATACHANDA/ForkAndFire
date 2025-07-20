// components/Pagination.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [inputPage, setInputPage] = useState(currentPage);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        const page = Number(inputPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="text-sm text-gray-700">
                {totalItems === 0 ? '0 of 0' : `${startItem}–${endItem} of ${totalItems}`}
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-md border border-gray-300 ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                >
                    <ChevronLeft size={16} />
                </button>
                <form onSubmit={handleInputSubmit} className="flex items-center space-x-1">
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputPage}
                        onChange={handleInputChange}
                        className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded no-spinner"
                        placeholder="Page"
                    />
                    <span className="text-sm text-gray-500">/ {totalPages}</span>
                </form>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-md border border-gray-300 ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
