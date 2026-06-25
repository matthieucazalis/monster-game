import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MonsterCard from "../components/monsterCard";
import DecorationShelf from "../components/decorationShelf";
import "./style/home.css";
import { applyTheme } from "../utils/theme";

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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tutorialSteps = [
    {
      selector: '[data-tutorial="monster"]',
      text: "Voici ton monstre ! Une fois qu'il a faim, clique sur le bouton qui apparaît pour le faire évoluer.",
    },
    {
      selector: '[data-tutorial="boutique"]',
      text: "Rends-toi à la Boutique pour acheter de nouvelles espèces de monstres et des décorations.",
    },
    {
      selector: '[data-tutorial="inventaire"]',
      text: "Dans l'Inventaire, retrouve tous tes monstres et décorations, et active celui que tu veux faire grandir.",
    },
  ];

  const token = localStorage.getItem("token");

  useEffect(() => {
    applyTheme();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!showTutorial) return;
    const update = () => {
      const el = document.querySelector(tutorialSteps[tutorialStep].selector);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [showTutorial, tutorialStep]);

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

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep((s) => s + 1);
    } else {
      closeTutorial();
    }
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
        {error && (
          <p style={{ color: "#ff0000", fontSize: 11, fontFamily: "Arial" }}>
            {error}
          </p>
        )}

        <div className="game-main">
          <div className="monster-area" data-tutorial="monster">
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

      {showTutorial && targetRect && (
        <>
          <div
            className="tutorial-spot"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
          <div
            className="tutorial-tooltip"
            style={{
              top: targetRect.bottom + 16,
              left: Math.min(targetRect.left, window.innerWidth - 300),
            }}
          >
            <p>{tutorialSteps[tutorialStep].text}</p>
            <div className="tutorial-tooltip-actions">
              <span className="tutorial-step-count">
                {tutorialStep + 1} / {tutorialSteps.length}
              </span>
              <button className="tutorial-btn" onClick={nextTutorialStep}>
                {tutorialStep < tutorialSteps.length - 1
                  ? "Suivant"
                  : "Terminer"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
