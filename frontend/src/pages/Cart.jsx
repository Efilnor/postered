import React, { useState, useEffect } from "react";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Charger le panier au montage du composant
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(items);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    // On prépare les données de la commande
    const orderData = {
      items: cartItems.map((item) => ({
        designId: item.id, // L'ID du design
        price: item.price, // Le prix unitaire (TRÈS IMPORTANT pour unitPrice)
        quantity: 1,
        sizeId: item.sizeId || 1, // L'ID de la taille
      })),
      totalAmount: total,
    };

    try {
      // 1. Envoi au backend pour enregistrer la commande
      await axios.post("http://localhost:4000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Vider le panier localement (State + LocalStorage)
      setCartItems([]);
      localStorage.removeItem("cart");

      // 3. Redirection vers une page de confirmation
      // Tu peux créer une route "/order-success"
    } catch (err) {
      alert("Erreur lors de la validation de la commande");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article spécifique via son cartId unique
  const removeFromCart = (cartId) => {
    const updatedCart = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Notifier le reste de l'app (pour le badge du header)
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon-container">
          <ShoppingBag size={80} strokeWidth={1} />
        </div>
        <h2>Votre panier est vide</h2>
        <p>
          Il semble que vous n'ayez pas encore craqué pour l'un de nos posters.
        </p>
        <a href="/" className="btn-back-home">
          Découvrir la boutique
        </a>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Mon Panier</h1>
        <span className="item-count">{cartItems.length} article(s)</span>
      </header>

      <div className="cart-grid">
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.cartId} className="cart-item">
              <div className="item-image">
                <img
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `http://localhost:4000${item.image}`
                  }
                  alt={item.title}
                />
              </div>

              <div className="item-details">
                <div className="item-main">
                  <h3>{item.title}</h3>
                  {/* Affichage du format choisi */}
                  <span className="badge-size">Format {item.size}</span>
                </div>
                <div className="item-price-section">
                  <p className="item-price">
                    {Number(item.price).toFixed(2)} €
                  </p>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="btn-remove"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Résumé de la commande</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Frais de port</span>
              <span className="free-shipping">Offerts</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total TTC</span>
            <span>{total.toFixed(2)} €</span>
          </div>

          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              "Validation en cours..."
            ) : (
              <>
                Valider la commande <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="secure-payment">
            <p>Paiement 100% sécurisé</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
