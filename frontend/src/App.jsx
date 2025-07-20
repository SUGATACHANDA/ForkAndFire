/* eslint-disable no-unused-vars */
import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Import Public Pages
import HomePage from './pages/public/HomePage';
import RecipePage from './pages/public/RecipePage';
import AllRecipesPage from './pages/public/AllRecipesPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import UnsubscribePage from './pages/public/UnsubscribePage';
import ShopPage from './pages/public/ShopPage';
import ProductPage from './pages/public/ProductPage';
import PurchaseRedirectPage from './pages/public/PurchaseRedirect';

// Import Private/User Pages
import FavoritesPage from './pages/user/FavouritesPage';
import MyOrdersPage from './pages/user/MyOrdersPage';

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRecipes from './pages/admin/ManageRecipes';
import RecipeForm from './pages/admin/RecipeForm';
import ManageCategories from './pages/admin/ManageCategories';
import ManageFaqs from './pages/admin/ManageFaqs';
import SendNewsletterPage from './pages/admin/SendNewsletterPage';
import ProductForm from './pages/admin/ProductForm';
import { AnimatePresence, motion } from 'framer-motion';

// Import Route Guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import NewsletterModal from './components/layout/NewsletterModal';
import CookieConsent from "./components/layout/CookieConsent"

import NotFoundPage from './pages/public/NotFoundPage';
import SubscribePage from './pages/public/SubscribePage';
import BackToTopButton from './components/common/BackToTopButton';
import ScrollToTop from './components/common/ScrollToTop';
import NotificationBanner from './components/common/NotificationBanner';
import ManageCommentsPage from './pages/admin/ManageCommentsPage';
import PrintRecipePage from './pages/public/PrintRecipePage';
import AboutPage from './pages/public/AboutPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import PurchaseSuccessPage from './pages/public/PurchaseSuccessPage';
import PurchaseProcessingPage from './pages/public/PurchaseProcessingPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import CartPage from './pages/user/CartPage';

function App() {
  // No more `useLocation` or conditional logic for header/footer here!

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage to see if the preloader has run in this session
    const hasLoaded = sessionStorage.getItem('preloader_complete');

    if (hasLoaded) {
      setIsLoading(false); // If it has, skip the preloader
    } else {
      // If it hasn't, the Preloader component will handle the state change
    }
  }, []);


  // This function will be called by the Preloader when its animation finishes
  const handleLoadingComplete = () => {
    sessionStorage.setItem('preloader_complete', 'true');
    setIsLoading(false);
  };

  return (
    <>
      <NewsletterModal />
      <CookieConsent />
      <BackToTopButton />
      <ScrollToTop />
      {/* <NotificationBanner /> */}
      <Routes>
        {/* --- Public Routes: All nested routes will have the PublicLayout --- */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="recipes" element={<AllRecipesPage />} />
          <Route path="recipe/:id" element={<RecipePage />} />
          <Route path='*' element={<NotFoundPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductPage />} />

          {/* Private user routes can also share the public layout */}
          <Route path="" element={<PrivateRoute />}>
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Route>

        {/* --- Standalone Auth Routes (they don't need a header/footer) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route path="/print/recipe/:id" element={<PrintRecipePage />} />
        <Route path="/purchase-redirect" element={<PurchaseRedirectPage />} />
        <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
        {/* <Route path="/purchase-processing" element={<PurchaseProcessingPage />} /> */}


        {/* --- Admin Routes: All nested admin routes will have the AdminLayout --- */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="" element={<AdminLayout />}>
            {/* The index route automatically redirects /admin to /admin/dashboard */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="recipes" element={<ManageRecipes />} />
            <Route path="recipes/new" element={<RecipeForm />} />
            <Route path="recipes/edit/:id" element={<RecipeForm />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="faqs" element={<ManageFaqs />} />
            <Route path="newsletter" element={<SendNewsletterPage />} />
            <Route path="comments" element={<ManageCommentsPage />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="products" element={<ManageProductsPage />} />
            <Route path="orders" element={<ManageOrdersPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* You can add a 404 Not Found page here */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}

      </Routes>
    </>
  );
}

export default App;