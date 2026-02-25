import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";
import "../styles/VerifyDesigns.css";

export default function VerifyDesigns() {
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/designs/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDesigns(res.data);
      if (res.data.length > 0) setSelectedDesign(res.data[0]);
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement", err);
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:4000/api/designs/${id}/verify`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Retirer du dashboard local
      const updated = designs.filter((d) => d.id !== id);
      setDesigns(updated);
      setSelectedDesign(updated[0] || null);
    } catch (err) {
      alert("Erreur lors de la validation");
    }
  };

  if (loading)
    return <div className="loader">Chargement de la file d'attente...</div>;

  return (
    <div className="verify-container">
      <aside className="verify-sidebar">
        <div className="sidebar-header">
          <h2>File de modération</h2>
          <span className="count-badge">{designs.length}</span>
        </div>
        <div className="design-list">
          {designs.map((d) => (
            <div
              key={d.id}
              className={`design-card-mini ${selectedDesign?.id === d.id ? "active" : ""}`}
              onClick={() => setSelectedDesign(d)}
            >
              <img
                src={
                  d.imageUrl.startsWith("http")
                    ? d.imageUrl
                    : `http://localhost:4000${d.imageUrl}`
                }
                alt=""
              />
              <div className="mini-info">
                <h4>{d.title}</h4>
                <p>par {d.designer?.firstName}</p>
              </div>
            </div>
          ))}
          {designs.length === 0 && (
            <div className="empty-state">
              <CheckCircle size={40} color="#2ed573" />
              <p>Tout est validé !</p>
            </div>
          )}
        </div>
      </aside>

      <main className="verify-main">
        {selectedDesign ? (
          <div className="inspection-zone">
            <div className="preview-container">
              <img
                src={
                  selectedDesign.imageUrl.startsWith("http")
                    ? selectedDesign.imageUrl
                    : `http://localhost:4000${selectedDesign.imageUrl}`
                }
                alt="Full preview"
              />
            </div>

            <div className="details-panel">
              <div className="details-header">
                <h1>{selectedDesign.title}</h1>
                <div className="action-buttons">
                  <button
                    className="btn-reject"
                    onClick={() => handleVerify(selectedDesign.id, "REJECTED")}
                  >
                    <XCircle size={20} /> Refuser
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleVerify(selectedDesign.id, "APPROVED")}
                  >
                    <CheckCircle size={20} /> Approuver
                  </button>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <User size={18} />
                  <div>
                    <span>Créateur</span>
                    <p>
                      {selectedDesign.designer?.firstName}{" "}
                      {selectedDesign.designer?.lastName}
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <Tag size={18} />
                  <div>
                    <span>Thème</span>
                    <p>{selectedDesign.theme?.name || "Général"}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={18} />
                  <div>
                    <span>Soumis le</span>
                    <p>
                      {new Date(selectedDesign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="description-box">
                <label>Description du créateur</label>
                <p>
                  {selectedDesign.description || "Aucune description fournie."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <Eye size={60} />
            <h2>Sélectionnez un design pour l'inspecter</h2>
          </div>
        )}
      </main>
    </div>
  );
}
