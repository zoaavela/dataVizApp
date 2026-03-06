import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Login from './component/Login/Login';
import Layout from './component/Layout/Layout';
import Carte from './component/Carte/Carte';
import Quadrant from './component/Quadrant/Quadrant';
import Modules from './component/Modules/Modules';
import Beton from './component/Beton/Beton';
import Logement from './component/Logement/Logement';
import Thermique from './component/Thermique/Thermique';
import Demographie from './component/Demographie/Demographie';
import Propos from './component/Propos/Propos';
import Settings from './component/Settings/Settings';
import Profil from './component/Profil/Profil';
import Register from './component/Register/Register';
import Home from './component/Home/Home';
import Import from './component/Import/Import';
import Miroir from './component/Miroir/Miroir';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ user, children }) => {
  if (!user || !user.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/accueil" replace />;
  }
  return children;
};

export default function App() {
  // On initialise le state avec ce qui est stocké dans le navigateur
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        <Route element={
          <ProtectedRoute user={user}>
            <Layout user={user} setUser={setUser} />
          </ProtectedRoute>
        }>
          <Route path="/accueil" element={<Home user={user} />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/carte" element={<Carte />} />

          <Route path="/modules" element={<Modules />} />
          <Route path="/quadrant" element={<Quadrant />} />
          <Route path="/beton" element={<Beton />} />
          <Route path="/demographie" element={<Demographie />} />
          <Route path="/logement" element={<Logement />} />
          <Route path="/thermique" element={<Thermique />} />
          <Route path="/miroir" element={<Miroir />} />

          <Route path="/admin/import" element={
            <AdminRoute user={user}>
              <Import />
            </AdminRoute>
          } />

          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<Propos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

