import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const AdminRoute = () => {
    const { userInfo, loading } = useAuth();

    const location = useLocation()

    if (loading) {
        return <Loader />;
    }

    return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default AdminRoute;