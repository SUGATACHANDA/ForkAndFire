import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const FaqAccordion = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <h4 className="text-lg font-semibold text-primary-text">{title}</h4>
                <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} className="text-accent" />
            </button>
            <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <p className="text-secondary-text leading-relaxed">
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FaqAccordion;