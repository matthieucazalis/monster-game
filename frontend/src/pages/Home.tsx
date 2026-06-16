import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MonsterCard from "../components/monsterCard";
import DecorationShelf from "../components/decorationShelf";
import "./style/home.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface Monster {
  id: number;
  specie_id: number;
  level: number;
  stade: number;
  next_available_at: string | null;
  species_name: string;
  hunger_interval_hours: number;
  max_level: number;
  base_image_url: string;
}

interface Decoration {
  user_decoration_id: number;
  name: string;
  image_url: string;
  is_equipped: boolean;
  position_x: number | null;
}

interface User {
  id: number;
  pseudo: string;
  coins: number;
  is_first_login: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [allDecorations, setAllDecorations] = useState<Decoration[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(false);
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

  const fetchCoins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
      }
    } catch {}
  };

  const fetchDecorations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/decorations/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAllDecorations(await res.json());
    } catch {}
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [monsterRes, decorationsRes, userRes] = await Promise.all([
        fetch(`${API_URL}/api/monsters/me`, { headers }),
        fetch(`${API_URL}/api/decorations/my`, { headers }),
        fetch(`${API_URL}/api/auth/me`, { headers }),
      ]);

      if (monsterRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (monsterRes.ok) setMonster(await monsterRes.json());
      if (decorationsRes.ok) setAllDecorations(await decorationsRes.json());
      if (userRes.ok) {
        const userData = await userRes.json();
        setCoins(userData.coins);
        setUser(userData);
        if (userData.is_first_login) setShowTutorial(true);
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setCoins(parsed.coins ?? 0);
          if (parsed.is_first_login) setShowTutorial(true);
        }
      }
    } catch {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUp = async () => {
    try {
      const res = await fetch(`${API_URL}/api/monsters/levelup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      if (data.coinsEarned) setCoins((prev) => prev + data.coinsEarned);
      if (data.completed) {
        setMonster(null);
        alert(data.message);
      } else {
        setMonster(data.monster);
      }
      await fetchCoins();
    } catch {
      setError("Erreur lors du level up");
    }
  };

  const closeTutorial = async () => {
    setShowTutorial(false);
    try {
      await fetch(`${API_URL}/api/auth/first-login`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (user) {
        const updated = { ...user, is_first_login: false };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch {}
  };

  // Décos équipées (pour l'affichage sur le comptoir)
  const equippedDecorations = allDecorations.filter((d) => d.is_equipped);

  if (loading)
    return (
      <div
        className="home-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#777" }}>Chargement...</p>
      </div>
    );

  return (
    <div className="home-wrap">
      <Navbar />

      <div className="game-area">
        <div className="coins-badge">
          <div className="coins-icon">$</div>
          {String(coins).padStart(3, "0")}
        </div>

        {error && (
          <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 0 16px" }}>
            {error}
          </p>
        )}

        <div className="game-main">
          <div className="monster-area">
            {monster ? (
              <MonsterCard monster={monster} onLevelUp={handleLevelUp} />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  background: "#f7f7f7",
                  padding: 24,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              >
                <p style={{ fontSize: 15, color: "#777", margin: 0 }}>
                  Aucun monstre actif.
                </p>
                <button
                  onClick={() => navigate("/shop")}
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
            )}
          </div>

          <div className="shelf-area">
            <DecorationShelf
              decorations={equippedDecorations}
              allDecorations={allDecorations}
              onUpdate={fetchDecorations}
            />
          </div>
        </div>
      </div>

      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-modal">
            <h2>Bienvenue dans Monster Game ! 🎉</h2>
            <p>Le tutoriel arrive bientôt...</p>
            <button className="tutorial-btn" onClick={closeTutorial}>
              Commencer !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
