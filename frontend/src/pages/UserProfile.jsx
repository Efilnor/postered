import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Mail,
  Camera,
  Lock,
  Check,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null); // Pour voir les détails d'une commande
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    group: "",
    createdAt: "",
  });

  const [orders, setOrders] = useState([]);
  const [editData, setEditData] = useState({ ...user, password: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:4000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.user;
        setUser(userData);
        setOrders(res.data.orders || []);
        setEditData({ ...userData, password: "" });
      } catch (err) {
        console.error("Erreur profile:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        "http://localhost:4000/auth/profile/update",
        editData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUser(res.data.user);
      setIsEditing(false);
      alert("Profil mis à jour !");
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className={`info-card ${isEditing ? "editing" : ""}`}>
            <div
              className="avatar-wrapper"
              onClick={() => isEditing && fileInputRef.current.click()}
            >
              <div className="user-avatar placeholder">
                {user.firstName?.charAt(0).toUpperCase()}
                {user.lastName?.charAt(0).toUpperCase()}
              </div>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  onChange={(e) =>
                    setEditData({ ...editData, password: e.target.value })
                  }
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave}>
                    <Check size={18} />
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>
                  {user.firstName} {user.lastName}
                </h3>
                <button
                  className="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  Éditer le profil
                </button>
              </>
            )}

            <div className="info-list">
              <div className="info-item">
                <Mail size={18} /> <span>{user.email}</span>
              </div>
              <div className="info-item">
                <Calendar size={18} />{" "}
                <span>Inscrit le {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="profile-content">
          <div className="orders-card">
            <div className="card-header">
              <Package size={22} />
              <h3>Historique des commandes</h3>
            </div>

            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-item-container">
                    <div
                      className={`order-row ${expandedOrder === order.id ? "active" : ""}`}
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="order-main">
                        <span className="order-number">
                          Commande #{order.id}
                        </span>
                        <span className="order-date">
                          Le{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                      <div className="order-status-price">
                        <span
                          className={`status-pill ${order.status?.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                        <span className="order-price">
                          {Number(order.totalPrice || 0).toFixed(2)} €
                        </span>
                        <ChevronDown
                          size={18}
                          className={`arrow-icon ${expandedOrder === order.id ? "rotate" : ""}`}
                        />
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="order-details-expanded">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="order-sub-item">
                              <span>Poster #{item.designId}</span>
                              <span>Qté: {item.quantity}</span>
                              <span className="order-price">
                                {Number(item.unitPrice).toFixed(2)} €
                              </span>
                            </div>
                          ))
                        ) : (
                          <p>
                            Aucun détail disponible pour cette commande
                            ancienne.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-orders">
                <p>Vous n'avez pas encore passé de commande.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
