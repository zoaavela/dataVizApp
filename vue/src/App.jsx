import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

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

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter basename="/vision">

      <GlobalErrorModal />
      <SessionManager setUser={setUser} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/accueil" element={<Home user={user} />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/quadrant" element={<Quadrant />} />
          <Route path="/house" element={<House />} />
          <Route path="/demographie" element={<Demographie />} />
          <Route path="/logement" element={<Logement />} />
          <Route path="/thermique" element={<Thermique />} />
          <Route path="/chomage" element={<Chomage />} />
          <Route path="/about" element={<Propos />} />

          <Route path="/profil" element={
            <AdminRoute user={user}>
              <Profil />
            </AdminRoute>
          } />

          <Route path="/admin/import" element={
            <AdminRoute user={user}>
              <Import />
            </AdminRoute>
          } />

          <Route path="/super-admin/requests" element={
            <SuperAdminRoute user={user}>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}