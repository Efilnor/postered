import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"; 
import "../styles/Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDesigner, setIsDesigner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/profile";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin
      ? "http://localhost:4000/auth/login"
      : "http://localhost:4000/auth/register";

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData, group: isDesigner ? "UserCreator" : "UserBuyer" };

    try {
      const r = await axios.post(endpoint, payload);
      localStorage.setItem("token", r.data.token);
      localStorage.setItem("user", JSON.stringify(r.data.user));
      setUser(r.data.user);
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="auth-container full-center">
        <div className="auth-card success-card">
          <CheckCircle2 size={48} color="#3f00ff" />
          <h2>{isLogin ? "Bon retour !" : "Bienvenue !"}</h2>
          <p>Heureux de vous revoir, <strong>{user.firstName}</strong>.</p>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-info-side">
        <div className="info-content">
          <img src="/white-title.png" alt="Postered" className="auth-logo-white" />
          <h1>L'art du poster, <br/>le style en plus.</h1>
<p>Rejoignez la plus grande communauté de collectionneurs d'œuvres et de posters premium.</p>
          
          <div className="auth-features">
            <div className="feature"><CheckCircle2 size={18}/> Qualité Ultra HD</div>
            <div className="feature"><CheckCircle2 size={18}/> Fixation Magnétique</div>
            <div className="feature"><CheckCircle2 size={18}/> Livraison Express</div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-title-compact">{isLogin ? "Connexion" : "Créer un compte"}</h2>
          <p className="auth-subtitle">Accédez à votre galerie personnalisée</p>

          {error && <div className="error-bubble">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="input-group-row">
                  <input name="firstName" placeholder="Prénom" onChange={handleChange} required />
                  <input name="lastName" placeholder="Nom" onChange={handleChange} required />
                </div>

                <div className="role-selection">
                  <p>Type de compte :</p>
                  <div className="role-options">
                    <label className={!isDesigner ? "active" : ""}>
                      <input type="radio" name="role" checked={!isDesigner} onChange={() => setIsDesigner(false)} />
                      Acheteur
                    </label>
                    <label className={isDesigner ? "active" : ""}>
                      <input type="radio" name="role" checked={isDesigner} onChange={() => setIsDesigner(true)} />
                      Designer
                    </label>
                  </div>
                </div>
              </>
            )}

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Traitement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <button className="btn-switch" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Nouveau ici ? Créer un compte" : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;