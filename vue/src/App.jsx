import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import Carte from './modules/Carte/Carte';
import Quadrant from './modules/Quadrant/Quadrant';
import Modules from './pages/Modules/Modules';
import Logement from './modules/Logement/Logement';
import Thermique from './modules/Thermique/Thermique';
import Demographie from './modules/Demographie/Demographie';
import Propos from './pages/Propos/Propos';
import Profil from './pages/Profil/Profil';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Import from './pages/Import/Import';
import Chomage from './modules/Chomage/Chomage';
import House from './modules/House/House';
import SuperAdminDashboard from './pages/SuperAdminDashboard/SuperAdminDashboard';
import LandingPage from './pages/LandingPage/LandingPage';
import SessionManager from './components/SessionManager/SessionManager';
import GlobalErrorModal from './components/GlobalErrorModal/GlobalErrorModal';
import PageTransition from './components/PageTransition/PageTransition';

const AdminRoute = ({ user, children }) => {
  if (!user || (!user.roles?.includes("ROLE_ADMIN") && !user.roles?.includes("ROLE_SUPER_ADMIN"))) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const SuperAdminRoute = ({ user, children }) => {
  if (!user || !user.roles?.includes("ROLE_SUPER_ADMIN")) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Sous-composant pour gérer les animations de sortie avec useLocation
function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login setUser={setUser} /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/accueil" element={<PageTransition><Home user={user} /></PageTransition>} />
          <Route path="/carte" element={<PageTransition><Carte /></PageTransition>} />
          <Route path="/modules" element={<PageTransition><Modules /></PageTransition>} />
          <Route path="/quadrant" element={<PageTransition><Quadrant /></PageTransition>} />
          <Route path="/house" element={<PageTransition><House /></PageTransition>} />
          <Route path="/demographie" element={<PageTransition><Demographie /></PageTransition>} />
          <Route path="/logement" element={<PageTransition><Logement /></PageTransition>} />
          <Route path="/thermique" element={<PageTransition><Thermique /></PageTransition>} />
          <Route path="/chomage" element={<PageTransition><Chomage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><Propos /></PageTransition>} />

          <Route path="/profil" element={
            <AdminRoute user={user}>
              <PageTransition><Profil /></PageTransition>
            </AdminRoute>
          } />

          <Route path="/admin/import" element={
            <AdminRoute user={user}>
              <PageTransition><Import /></PageTransition>
            </AdminRoute>
          } />

          <Route path="/super-admin/requests" element={
            <SuperAdminRoute user={user}>
              <PageTransition><SuperAdminDashboard /></PageTransition>
            </SuperAdminRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter basename="/">
      <GlobalErrorModal />
      <SessionManager setUser={setUser} />
      <AnimatedRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}