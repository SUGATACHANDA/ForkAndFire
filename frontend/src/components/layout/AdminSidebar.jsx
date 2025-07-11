import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faPaperPlane, faBookOpen, faTag, faQuestionCircle, faSignOutAlt, faComments, faBoxOpen, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const AdminSidebar = () => {
    const commonClasses = "flex items-center p-3 my-1 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors";
    const activeClassName = "bg-accent text-white font-bold";
    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col fixed">
            <div className="text-2xl font-serif font-bold p-6 border-b border-gray-700">
                Admin Panel
            </div>
            <nav className="flex-grow p-4">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" /> Dashboard
                </NavLink>
                <NavLink to="/admin/recipes" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faBookOpen} className="mr-3" /> Recipes
                </NavLink>
                <NavLink to="/admin/categories" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faTag} className="mr-3" /> Categories
                </NavLink>
                <NavLink to="/admin/faqs" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faQuestionCircle} className="mr-3" /> FAQs
                </NavLink>
                <NavLink to="/admin/comments" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faComments} className="mr-3 w-5" /> Comments
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5" /> Ecommerce
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-3 w-5" /> Orders
                </NavLink>
                <NavLink to="/admin/newsletter" className={({ isActive }) => `${commonClasses} ${isActive ? activeClassName : ''}`}>
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-3 w-5" /> Newsletter
                </NavLink>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <NavLink to="/" className={commonClasses}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Back to Site
                </NavLink>
            </div>
        </div>
    );
};

export default AdminSidebar;