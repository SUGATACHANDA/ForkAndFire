import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useScreenSize } from '../../hooks/useScreenSize'; // <-- 1. Import our new hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreenButton, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// A message component to show when the dashboard is blocked on mobile.
const MobileBlocker = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-8">
        <FontAwesomeIcon icon={faMobileScreenButton} className="text-5xl text-accent mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard Not Available</h2>
        <p className="text-gray-600 mt-2 max-w-sm">
            For the best experience and to prevent accidental changes, the admin panel is only accessible on larger screens (tablets and desktops).
        </p>
        <a href="/" className="mt-6 bg-accent text-white font-semibold py-2 px-5 rounded-md flex items-center gap-2 hover:bg-opacity-90 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Main Site
        </a>
    </div>
);


const AdminLayout = () => {
    const isMobile = useScreenSize(); // <-- 2. Use the hook to get the screen state

    // 3. Conditionally render either the full layout or the blocker message
    if (isMobile) {
        return <MobileBlocker />;
    }

    // If not mobile, render the standard admin layout.
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-8 ml-64">
                {/* The <Outlet/> will render the specific admin page */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;