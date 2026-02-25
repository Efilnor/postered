import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import VerifyDesigns from './pages/VerifyDesigns'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import UserProfile from './pages/UserProfile'
import CreatorDashboard from './pages/CreatorDashboard'
import DesignDetail from './pages/DesignDetail'
import Admin from './pages/Admin'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          {/* Accueil : Liste des posters */}
          <Route index element={<Home/>} />
          
          {/* Détails d'un poster spécifique (id dynamique) */}
          <Route path="design/:id" element={<DesignDetail/>} />
          
          <Route path="verify" element={<VerifyDesigns/>}/>
          {/* Authentification */}
          <Route path="login" element={<Auth/>} />
          
          {/* Panier (Accessible à tous) */}
          <Route path="cart" element={<Cart/>} />
          
          {/* Espace Utilisateur Connecté */}
          <Route path="profile" element={<UserProfile/>} />
          
          {/* Espace Créateur */}
          <Route path="creator" element={<CreatorDashboard/>} />
          
          {/* Administration */}
          <Route path="admin" element={<Admin/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)