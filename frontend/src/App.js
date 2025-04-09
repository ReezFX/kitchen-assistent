import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { AuthProvider } from './shared/context/AuthContext';

// Pages
import HomePage from './modules/home/HomePage';
import RecipesPage from './modules/recipes/RecipesPage';
import ProfilePage from './modules/user-profile/ProfilePage';
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import NotFoundPage from './shared/components/NotFoundPage';
import RecipeDetail from './shared/components/recipe/RecipeDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
