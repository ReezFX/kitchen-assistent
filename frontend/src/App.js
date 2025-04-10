import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
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
import ExampleRecipeDetail from './shared/components/recipe/ExampleRecipeDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes - Accessible without login */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/example-recipe/:id" element={<ExampleRecipeDetailWrapper />} />
            
            {/* Protected Routes - Require authentication */}
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

// Wrapper component to pass the recipe ID to ExampleRecipeDetail
const ExampleRecipeDetailWrapper = () => {
  const { id } = useParams();
  return <ExampleRecipeDetail recipeId={id} />;
};

export default App;
