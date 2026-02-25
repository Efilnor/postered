import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const r = await axios.get("http://localhost:4000/api/designs");
        setDesigns(r.data);
      } catch (err) {
        console.error("Erreur de chargement des posters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  if (loading) return <div className="loader">Chargement de la galerie...</div>;

  return (
    <div className="home-container">
      <div className="design-grid">
        {designs.map((item) => (
          <Link key={item.id} to={`/design/${item.id}`} className="design-card">
            <div className="image-wrapper">
              <img
                src={
                  item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : `http://localhost:4000${item.imageUrl}`
                }
                alt={item.title}
              />
              <div className="card-overlay">
                <span className="view-btn">Voir le produit</span>
              </div>
            </div>
            <div className="design-details">
              <h4>{item.title}</h4>
              <span className="theme-tag">
                {item.theme?.name || "Art Mural"}
              </span>
              <p className="price">{Number(item.basePrice).toFixed(2)} €</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
