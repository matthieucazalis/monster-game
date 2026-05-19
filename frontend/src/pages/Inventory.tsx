import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMonsterImageUrl } from "../utils/evolutionUtils";
import "./style/inventory.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface Monster {
  id: number;
  specie_id: number;
  species_name: string;
  base_image_url: string;
  level: number;
  stade: number;
  max_level: number;
  is_archived: boolean;
}

interface Decoration {
  id: number;
  user_decoration_id: number;
  name: string;
  description: string;
  image_url: string;
  is_equipped: boolean;
}

export default function Inventory() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Monster[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
      const [collectionRes, decorationsRes] = await Promise.all([
        fetch(`${API_URL}/api/monsters/collection`, { headers }),
        fetch(`${API_URL}/api/decorations/my`, { headers }),
      ]);
      if (collectionRes.ok) setCollection(await collectionRes.json());
      if (decorationsRes.ok) setDecorations(await decorationsRes.json());
    } catch {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (monsterId: number) => {
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/monsters/activate/${monsterId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage("Monstre activé !");
      fetchData();
    } catch {
      setError("Erreur lors de l'activation.");
    }
  };

  if (loading)
    return (
      <div className="inventory-wrap">
        <Navbar />
        <p style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
          Chargement...
        </p>
      </div>
    );

  return (
    <div className="inventory-wrap">
      <Navbar />
      <div className="inventory-content">
        {message && <p className="inventory-notice success">{message}</p>}
        {error && <p className="inventory-notice error">{error}</p>}

        {/* Section Monstres */}
        <div className="inventory-section">
          <h2 className="inventory-section-title">
            Monstres
            <span className="inventory-section-count">{collection.length}</span>
          </h2>

          {collection.length === 0 ? (
            <p className="inventory-empty">
              Aucun monstre dans votre collection.
            </p>
          ) : (
            <div className="inventory-list">
              {collection.map((m) => {
                const imageUrl = getMonsterImageUrl(
                  m.base_image_url,
                  m.level,
                  m.max_level,
                );
                return (
                  <div
                    key={m.id}
                    className={`inventory-row ${!m.is_archived ? "active" : ""}`}
                  >
                    <img
                      src={imageUrl}
                      alt={m.species_name}
                      className="inventory-row-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/species/placeholder.png";
                      }}
                    />
                    <div className="inventory-row-info">
                      <span className="inventory-row-name">
                        {m.species_name}
                      </span>
                      <span className="inventory-row-sub">
                        Niveau {m.level} / {m.max_level} · Stade {m.stade}/3
                      </span>
                    </div>
                    <div className="inventory-row-action">
                      {!m.is_archived ? (
                        <span className="inventory-status active">Actif</span>
                      ) : (
                        <button
                          className="inventory-activate-btn"
                          onClick={() => handleActivate(m.id)}
                        >
                          Activer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section Décorations */}
        <div className="inventory-section">
          <h2 className="inventory-section-title">
            Décorations
            <span className="inventory-section-count">
              {decorations.length}
            </span>
          </h2>

          {decorations.length === 0 ? (
            <p className="inventory-empty">Aucune décoration achetée.</p>
          ) : (
            <div className="inventory-list">
              {decorations.map((d) => (
                <div key={d.user_decoration_id} className="inventory-row">
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="inventory-row-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder.png";
                    }}
                  />
                  <div className="inventory-row-info">
                    <span className="inventory-row-name">{d.name}</span>
                    <span className="inventory-row-sub">{d.description}</span>
                  </div>
                  <div className="inventory-row-action">
                    {d.is_equipped ? (
                      <span className="inventory-status equipped">Équipé</span>
                    ) : (
                      <span className="inventory-status unequipped">
                        Non équipé
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
