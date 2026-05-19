import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DecorationShelf from "../components/decorationShelf";
import "./style/home.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface Decoration {
  user_decoration_id: number;
  name: string;
  image_url: string;
  is_equipped: boolean;
}

interface User {
  id: number;
  pseudo: string;
  coins: number;
  is_first_login: boolean;
}

export default function Inventory() {
  const navigate = useNavigate();
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [monsterRes, decorationsRes] = await Promise.all([
        fetch(`${API_URL}/api/monsters/me`, { headers }),
        fetch(`${API_URL}/api/decorations/my`, { headers }),
      ]);

      if (monsterRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      }
    } catch {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        className="inventory-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#fff" }}>Chargement...</p>
      </div>
    );

  return (
    <div className="inventory-wrap">
      <Navbar />

      <div className="game-area">
        <div className="coins-badge">
          <div className="coins-icon">$</div>
          {String(user?.coins ?? 0).padStart(3, "0")}
        </div>

        {error && (
          <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 0 16px" }}>
            {error}
          </p>
        )}

        <div className="game-main">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.85)",
              padding: 24,
              borderRadius: 4,
              border: "1px solid #ddd",
              backdropFilter: "blur(4px)",
            }}
          >
            <p style={{ fontSize: 15, color: "#777", margin: 0 }}>
              Aucun monstre actif.
            </p>
            <button
              onClick={() => navigate("/boutique")}
              style={{
                padding: "8px 20px",
                borderRadius: 4,
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Obtenir un monstre →
            </button>
          </div>
        </div>

        <div className="shelf-area">
          <DecorationShelf decorations={decorations} />
        </div>
      </div>
    </div>
  );
}
