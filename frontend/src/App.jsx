import React from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom"; // Ajout de useNavigate
import {
  Image,
  ShoppingCart,
  User,
  ShieldCheck,
  ClipboardCheck,
  LogOut,
} from "lucide-react";
import "./styles/App.css";

import axios from 'axios';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate(); 

  const isLoginPage = location.pathname === "/login";
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const perms = storedUser?.permissions || [];

const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (token) {
      await axios.post("http://localhost:4000/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (err) {
    console.error("Erreur lors de la déconnexion backend", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
};

  return (
    <div className="app-wrapper">
      {!isLoginPage && (
        <header className="main-header">
          <div className="header-content">
            <Link to="/" className="logo-section">
              <img src="/title.png" alt="Postered" className="nav-logo" />
            </Link>

            <nav className="nav-menu">
              {/* Permission de créer des designs */}
              {perms.includes("design:create") && (
                <NavLink to="/creator" className="nav-item">
                  <Image size={22} />
                  <span>Studio</span>
                </NavLink>
              )}

              {/* Permission de modérer (DesignManager ou Admin) */}
              {perms.includes("design:publish") && (
                <NavLink to="/verify" className="nav-item">
                  <ClipboardCheck size={22} />
                  <span>Modération</span>
                </NavLink>
              )}

              {/* Accès total (Admin uniquement) */}
              {perms.includes("*:*") && (
                <NavLink to="/admin" className="nav-item">
                  <ShieldCheck size={22} />
                  <span>Système</span>
                </NavLink>
              )}

              <NavLink to="/cart" className="nav-item">
                <ShoppingCart size={22} />
                <span>Panier</span>
              </NavLink>

              <NavLink to="/profile" className="nav-item">
                <User size={22} />
                <span>Compte</span>
              </NavLink>

              {/* Bouton de déconnexion - Visible uniquement si connecté */}
              {storedUser && (
                <button onClick={handleLogout} className="nav-item btn-logout">
                  <LogOut size={22} />
                  <span>Quitter</span>
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
