import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, TrendingUp, ShoppingBag, Eye, X, UploadCloud,
  CheckCircle2, Clock, AlertCircle, Hash,
} from "lucide-react";
import "../styles/CreatorDashboard.css";

export default function CreatorDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myWorks, setMyWorks] = useState([]); // Initialisé par défaut
  const [themes, setThemes] = useState([]);
  const [preview, setPreview] = useState(null);

  const [newDesign, setNewDesign] = useState({
    title: "",
    description: "",
    basePrice: "",
    themeId: null,
    image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [designsResult, themesResult] = await Promise.allSettled([
          axios.get("http://localhost:4000/api/designs/my-designs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/themes"),
        ]);

        if (designsResult.status === "fulfilled") {
          // Sécurité : s'assurer que c'est un tableau
          setMyWorks(Array.isArray(designsResult.value.data) ? designsResult.value.data : []);
        }

        if (themesResult.status === "fulfilled") {
          setThemes(themesResult.value.data);
        }
      } catch (err) {
        console.error("Erreur critique inattendue", err);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDesign({ ...newDesign, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDesign.themeId) return alert("Veuillez sélectionner un thème !");
    if (!newDesign.image) return alert("Veuillez ajouter une image !");

    setLoading(true);
    const data = new FormData();
    data.append("title", newDesign.title);
    data.append("description", newDesign.description || "");
    data.append("basePrice", newDesign.basePrice);
    data.append("themeId", newDesign.themeId);
    data.append("image", newDesign.image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:4000/api/designs", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      // Au lieu de reload(), on pourrait fetch à nouveau pour plus de fluidité
      window.location.reload(); 
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Calcul des stats (avec sécurité Number)
  const totalEarnings = myWorks.reduce((acc, curr) => acc + (Number(curr.salesCount || 0) * Number(curr.basePrice || 0)), 0);
  const totalSales = myWorks.reduce((acc, curr) => acc + Number(curr.salesCount || 0), 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Studio Créateur</h1>
          <p>Gérez votre collection et suivez vos performances.</p>
        </div>
        <button className="btn-add-design" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nouveau Design
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon earnings"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span>Revenus Estimés</span>
            <h3>{totalEarnings.toFixed(2)} €</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sales"><ShoppingBag size={24} /></div>
          <div className="stat-info">
            <span>Ventes Totales</span>
            <h3>{totalSales}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon views"><Eye size={24} /></div>
          <div className="stat-info">
            <span>Designs Actifs</span>
            <h3>{myWorks.length}</h3>
          </div>
        </div>
      </div>

      <section className="works-section">
        <div className="section-header"><h3>Mes créations</h3></div>
        <div className="works-list">
          {myWorks.map((item) => (
            <div key={item.id} className="work-item">
              <div className="work-img-container">
                <img 
                  src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:4000${item.imageUrl}`} 
                  alt={item.title} 
                />
              </div>
              <div className="work-details">
                <div className="work-title-price">
                  <div>
                    <h4>{item.title}</h4>
                    <span className="aesthetic-hash"><Hash size={12} /> {item.theme?.name || "Général"}</span>
                  </div>
                  <p className="price-tag">{Number(item.basePrice).toFixed(2)} €</p>
                </div>

                <p className="work-description">{item.description || "Aucune description."}</p>
                
                <div className="work-meta">
                  {/* Utilisation dynamique des classes CSS : approved, pending, rejected */}
                  <div className={`status-pill ${item.status?.toLowerCase()}`}>
                    {item.status === "APPROVED" && <CheckCircle2 size={14} />}
                    {item.status === "PENDING" && <Clock size={14} />}
                    {item.status === "REJECTED" && <AlertCircle size={14} />}
                    <span>
                      {item.status === "APPROVED" ? "En ligne" : item.status === "PENDING" ? "En révision" : "Refusé"}
                    </span>
                  </div>
                  <span className="sales-indicator">{item.salesCount || 0} ventes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}><X size={24} /></button>
            <h2>Publier un Poster</h2>
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="upload-zone" onClick={() => document.getElementById("fileInput").click()}>
                {preview ? <img src={preview} alt="Preview" className="img-preview" /> : 
                  <div className="upload-placeholder"><UploadCloud size={40} /><p>Cliquer pour uploader</p></div>
                }
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} hidden />
              </div>

              <div className="theme-selector">
                <label><Hash size={16} /> Thème du design</label>
                <div className="theme-tags">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tag-btn ${newDesign.themeId === t.id ? "active" : ""}`}
                      onClick={() => setNewDesign({ ...newDesign, themeId: t.id })}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-grid">
                <div className="input-field">
                  <label>Titre</label>
                  <input type="text" placeholder="Nom du poster" onChange={(e) => setNewDesign({ ...newDesign, title: e.target.value })} required />
                </div>
                <div className="input-field">
                  <label>Prix (€)</label>
                  <input type="number" step="0.01" placeholder="29.99" onChange={(e) => setNewDesign({ ...newDesign, basePrice: e.target.value })} required />
                </div>
              </div>

              <div className="input-field">
                <label>Description</label>
                <textarea placeholder="Description..." onChange={(e) => setNewDesign({ ...newDesign, description: e.target.value })} rows="3" />
              </div>

              <button type="submit" className="btn-submit-main" disabled={loading}>
                {loading ? "Chargement..." : "Soumettre pour validation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}