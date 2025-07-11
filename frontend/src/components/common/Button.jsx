import React from 'react';

const Button = ({ children, type = 'button', onClick, disabled, fullWidth = false, variant = 'primary' }) => {
    const baseClasses = `group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`;

    const variantClasses = {
        primary: 'text-white bg-accent hover:bg-opacity-90 focus:ring-accent',
        secondary: 'text-accent bg-accent-light hover:bg-opacity-70 focus:ring-accent',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass}`}
        >
            {children}
        </button>
    );
};

export default Button;