import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// This component defines the structure for all public-facing pages.
const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {/* The <Outlet/> will render the specific page component (e.g., HomePage, RecipePage) */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;