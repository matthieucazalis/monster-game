import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/style/Navbar.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [coins, setCoins] = useState<number>(0);
  const token = localStorage.getItem("token");

  // Fonction autonome pour récupérer la monnaie
  const fetchCoins = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCoins(parsed.coins ?? 0);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchCoins();

    // Écoute un événement personnalisé pour se mettre à jour à la volée (ex: lors d'un level up)
    window.addEventListener("update-coins", fetchCoins);
    return () => window.removeEventListener("update-coins", fetchCoins);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* COINS */}
      <div className="coins-badge">
        <div className="coins-icon">
          <img
            src="/images/money-icon.png"
            alt="Coins" 
            width="35"
            height="35"
          />
        </div>
        {String(coins).padStart(3, "0")}
      </div>

      <div className="navbar-center">
        {/* HOME */}
        <button
          className={`navbar-item ${isActive("/game") ? "active" : ""}`}
          onClick={() => navigate("/game")}
        >
          <img src="/images/home-icon.png" alt="Home" width="25" height="25" />
          Home
        </button>

        {/* INVENTAIRE */}
        <button
          className={`navbar-item ${isActive("/inventory") ? "active" : ""}`}
          onClick={() => navigate("/inventory")}
          data-tutorial="inventaire"
        >
          <img
            src="/images/inventory-icon.png"
            alt="Inventaire"
            width="25"
            height="25"
          />
          Inventaire
        </button>

        {/* SHOP */}
        <button
          className={`navbar-item ${isActive("/shop") ? "active" : ""}`}
          onClick={() => navigate("/shop")}
          data-tutorial="boutique"
        >
          <img
            src="/images/shop-icon.png"
            alt="Boutique"
            width="25"
            height="25"
          />
          Boutique
        </button>
      </div>

      {/* SETTINGS */}
      <button className="navbar-settings" onClick={() => navigate("/settings")}>
        <img
          src="/images/settings-icon.png"
          alt="Settings"
          width="35"
          height="35"
        />
      </button>
    </nav>
  );
}
