import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./style/shop.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface Species {
  id: number;
  name: string;
  unlock_cost: number;
  hunger_interval_hours: number;
  max_level: number;
  base_image_url: string;
}

interface Decoration {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface MyDecoration {
  id: number;
  user_decoration_id: number;
}

export default function Shop() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"species" | "decorations">("species");
  const [species, setSpecies] = useState<Species[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [ownedDecoIds, setOwnedDecoIds] = useState<number[]>([]);
  const [coins, setCoins] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAll();
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

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [speciesRes, decoRes, myDecoRes, meRes] = await Promise.all([
        fetch(`${API_URL}/api/species`, { headers }),
        fetch(`${API_URL}/api/decorations`, { headers }),
        fetch(`${API_URL}/api/decorations/my`, { headers }),
        fetch(`${API_URL}/api/auth/me`, { headers }),
      ]);
      if (speciesRes.ok) setSpecies(await speciesRes.json());
      if (decoRes.ok) setDecorations(await decoRes.json());
      if (myDecoRes.ok) {
        const data: MyDecoration[] = await myDecoRes.json();
        setOwnedDecoIds(data.map((d) => d.id));
      }
      if (meRes.ok) {
        const me = await meRes.json();
        setCoins(me.coins);
      }
    } catch {
      setError("Erreur lors du chargement de la boutique.");
    }
  };

  const handleBuySpecies = async (s: Species) => {
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/species/buy/${s.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage(data.message);
      await fetchCoins();
      navigate("/game");
    } catch {
      setError("Erreur lors de l'achat.");
    }
  };

  const handleBuyDecoration = async (d: Decoration) => {
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/decorations/buy/${d.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setOwnedDecoIds((prev) => [...prev, d.id]);
      setMessage(data.message);
      await fetchCoins();
    } catch {
      setError("Erreur lors de l'achat.");
    }
  };

  return (
    <div className="shop-wrap">
      <Navbar />
      <div className="shop-content">
        <div className="shop-header">
          <h1 className="shop-title">Boutique</h1>
          <div className="coins-badge">
            <div className="coins-icon">$</div>
            {String(coins).padStart(3, "0")}
          </div>
        </div>

        {message && <p className="shop-notice success">{message}</p>}
        {error && <p className="shop-notice error">{error}</p>}

        <div className="shop-tabs">
          <button
            className={`shop-tab ${tab === "species" ? "active" : ""}`}
            onClick={() => setTab("species")}
          >
            Espèces
          </button>
          <button
            className={`shop-tab ${tab === "decorations" ? "active" : ""}`}
            onClick={() => setTab("decorations")}
          >
            Décorations
          </button>
        </div>

        {tab === "species" && (
          <div className="shop-grid">
            {species.map((s) => {
              const canAfford = coins >= s.unlock_cost;
              return (
                <div key={s.id} className="shop-card">
                  <img
                    src={`${s.base_image_url}_1.png`}
                    alt={s.name}
                    className="shop-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/species/placeholder.png";
                    }}
                  />
                  <div className="shop-card-body">
                    <h3 className="shop-card-name">{s.name}</h3>
                    <p className="shop-card-info">
                      Niv. max : {s.max_level} · Faim :{" "}
                      {s.hunger_interval_hours}h
                    </p>
                    <div className="shop-card-footer">
                      <span className="shop-price">{s.unlock_cost} coins</span>
                      <button
                        className={`shop-buy-btn${!canAfford ? " disabled" : ""}`}
                        onClick={() => canAfford && handleBuySpecies(s)}
                        disabled={!canAfford}
                      >
                        Acheter
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "decorations" && (
          <div className="shop-grid">
            {decorations.map((d) => {
              const owned = ownedDecoIds.includes(d.id);
              const canAfford = coins >= d.price;
              return (
                <div key={d.id} className="shop-card">
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="shop-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder.png";
                    }}
                  />
                  <div className="shop-card-body">
                    <h3 className="shop-card-name">{d.name}</h3>
                    <p className="shop-card-info">{d.description}</p>
                    <div className="shop-card-footer">
                      <span className="shop-price">{d.price} coins</span>
                      {owned ? (
                        <span className="shop-badge">Possédé</span>
                      ) : (
                        <button
                          className={`shop-buy-btn${!canAfford ? " disabled" : ""}`}
                          onClick={() => canAfford && handleBuyDecoration(d)}
                          disabled={!canAfford}
                        >
                          Acheter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
