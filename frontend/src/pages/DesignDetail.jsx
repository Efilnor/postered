import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Check, Loader2 } from "lucide-react"; // Pour les icônes d'animation
import axios from "axios";
import "../styles/DesignDetail.css";

const DesignDetail = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Nouveaux états pour la logique moderne
  const [selectedSize, setSelectedSize] = useState("A3");
  const [buttonState, setButtonState] = useState("idle"); // 'idle' | 'loading' | 'success'

  const sizes = [
    { id: "A4", label: "A4 (21x29.7cm)", extra: 0 },
    { id: "A3", label: "A3 (29.7x42cm)", extra: 10 },
    { id: "A2", label: "A2 (42x59.4cm)", extra: 20 },
  ];

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Pas connecté ? On redirige vers login en mémorisant l'URL actuelle
      alert("Veuillez vous connecter pour ajouter au panier.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // Si connecté, on appelle ta fonction addToCart existante
    addToCart();
  };

  const addToCart = () => {
    if (!design || buttonState !== "idle") return;

    setButtonState("loading");

    // On simule un petit délai réseau pour l'effet "chargement"
    setTimeout(() => {
      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

      // On calcule le prix final selon la taille
      const sizeInfo = sizes.find((s) => s.id === selectedSize);
      const finalPrice = Number(design.basePrice) + sizeInfo.extra;

      const updatedCart = [
        ...existingCart,
        {
          cartId: Date.now(), // ID unique pour pouvoir en acheter plusieurs
          id: design.id,
          title: design.title,
          price: finalPrice,
          size: selectedSize,
          image: design.imageUrl,
        },
      ];

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdate"));

      setButtonState("success");

      // On remet le bouton à l'état normal après 2 secondes
      setTimeout(() => setButtonState("idle"), 2000);
    }, 800);
  };

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const r = await axios.get(`http://localhost:4000/api/designs/${id}`);
        setDesign(r.data);
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [id]);

  if (loading) return <div className="loader">Chargement...</div>;
  if (!design) return <div className="error">Design introuvable</div>;

  return (
    <div className="details-container">
      <div className="details-grid">
        <div className="image-section">
          <img
            src={
              design.imageUrl.startsWith("http")
                ? design.imageUrl
                : `http://localhost:4000${design.imageUrl}`
            }
            alt={design.title}
          />
        </div>

        <div className="info-section">
          <h1>{design.title}</h1>
          <div className="theme-badge">
            {design.theme?.name || "Collection Permanente"}
          </div>
          <p className="price-tag">
            {(
              Number(design.basePrice) +
              sizes.find((s) => s.id === selectedSize).extra
            ).toFixed(2)}{" "}
            €
          </p>

          <div className="size-selector">
            <h3>Format</h3>
            <div className="size-options">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  className={`size-btn ${selectedSize === size.id ? "active" : ""}`}
                  onClick={() => setSelectedSize(size.id)}
                >
                  {size.id}
                </button>
              ))}
            </div>
            <p className="size-desc">
              {sizes.find((s) => s.id === selectedSize).label}
            </p>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{design.description || "Aucune description."}</p>
          </div>

          <button
            className={`btn-add-cart ${buttonState}`}
            onClick={handleAddToCart}
            disabled={buttonState !== "idle"}
          >
            {buttonState === "idle" && "Ajouter au panier"}
            {buttonState === "loading" && <Loader2 className="spinner" />}
            {buttonState === "success" && (
              <>
                <Check size={20} /> Ajouté !
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignDetail;
