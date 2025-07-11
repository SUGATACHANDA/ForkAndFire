import React from 'react';

const Loader = () => {
    return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        </div>
    );
};

export default Loader;