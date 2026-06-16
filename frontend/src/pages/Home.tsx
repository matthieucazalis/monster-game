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

function applyTheme() {
  const bg = localStorage.getItem("ui_bg_color") ?? "#008080";
  const accent = localStorage.getItem("ui_accent_color") ?? "#000080";
  document.body.style.setProperty("--win-bg", bg);
  document.body.style.setProperty("--win-accent", accent);
}

export default function Home() {
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [allDecorations, setAllDecorations] = useState<Decoration[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    applyTheme();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

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
        setUser(userData);
        if (userData.is_first_login) setShowTutorial(true);
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
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

      // On prévient la Navbar que l'argent a changé pour qu'elle se recharge
      window.dispatchEvent(new Event("update-coins"));

      if (data.completed) {
        setMonster(null);
        alert(data.message);
      } else {
        setMonster(data.monster);
      }
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

  const equippedDecorations = allDecorations.filter((d) => d.is_equipped);

  if (loading)
    return (
      <div
        className="home-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#fff", fontFamily: "Arial", fontSize: 12 }}>
          Chargement...
        </p>
      </div>
    );

  return (
    <div className="home-wrap">
      <Navbar />

      <div className="game-area">
        {/* L'ancien badge des coins a été supprimé d'ici */}

        {error && (
          <p style={{ color: "#ff0000", fontSize: 11, fontFamily: "Arial" }}>
            {error}
          </p>
        )}

        <div className="game-main">
          <div className="monster-area">
            {monster ? (
              <MonsterCard monster={monster} onLevelUp={handleLevelUp} />
            ) : (
              <div className="no-monster-panel">
                <p>Aucun monstre actif.</p>
                <button className="win98-btn" onClick={() => navigate("/shop")}>
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
            <div className="tutorial-modal-body">
              <h2>Bienvenue dans Monster Game !</h2>
              <p>Le tutoriel arrive bientôt...</p>
              <button className="tutorial-btn" onClick={closeTutorial}>
                Commencer !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
