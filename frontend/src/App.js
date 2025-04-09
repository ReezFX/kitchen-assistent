import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';

// Pages
import HomePage from './modules/home/HomePage';
import RecipesPage from './modules/recipes/RecipesPage';
import CookingAssistantPage from './modules/cooking-guide/CookingAssistantPage';
import ProfilePage from './modules/user-profile/ProfilePage';
import NotFoundPage from './shared/components/NotFoundPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/cooking-assistant" element={<CookingAssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
