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

interface CompletedMonster {
  id: number;
  specie_id: number;
  species_name: string;
  base_image_url: string;
  max_level_reached: number;
  completed_at: string;
  lore?: string;
}

interface Decoration {
  id: number;
  user_decoration_id: number;
  name: string;
  description: string;
  image_url: string;
  is_equipped: boolean;
}

type PopupData =
  | { type: "active"; monster: Monster }
  | { type: "completed"; monster: CompletedMonster };

export default function Inventory() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Monster[]>([]);
  const [completed, setCompleted] = useState<CompletedMonster[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [popup, setPopup] = useState<PopupData | null>(null);

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
      const [collectionRes, completedRes, decorationsRes] = await Promise.all([
        fetch(`${API_URL}/api/monsters/collection`, { headers }),
        fetch(`${API_URL}/api/monsters/inventory`, { headers }),
        fetch(`${API_URL}/api/decorations/my`, { headers }),
      ]);
      if (collectionRes.ok) setCollection(await collectionRes.json());
      if (completedRes.ok) setCompleted(await completedRes.json());
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

  const activeMonsters = collection.filter((m) => !m.is_archived);
  const archivedMonsters = collection.filter((m) => m.is_archived);

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

        {/* Section : Monstres en cours */}
        <div className="inventory-section">
          <h2 className="inventory-section-title">
            Monstres en cours
            <span className="inventory-section-count">
              {activeMonsters.length + archivedMonsters.length}
            </span>
          </h2>
          {activeMonsters.length === 0 && archivedMonsters.length === 0 ? (
            <p className="inventory-empty">Aucun monstre en cours.</p>
          ) : (
            <div className="inventory-grid">
              {[...activeMonsters, ...archivedMonsters].map((m) => {
                const imageUrl = getMonsterImageUrl(
                  m.base_image_url,
                  m.level,
                  m.max_level,
                );
                return (
                  <div
                    key={m.id}
                    className={`inventory-card ${!m.is_archived ? "active" : ""}`}
                    onClick={() => setPopup({ type: "active", monster: m })}
                  >
                    <img
                      src={imageUrl}
                      alt={m.species_name}
                      className="inventory-card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/species/placeholder.png";
                      }}
                    />
                    <div className="inventory-card-body">
                      <span className="inventory-card-name">
                        {m.species_name}
                      </span>
                      <span className="inventory-card-sub">
                        Lv. {m.level} / {m.max_level}
                      </span>
                      {!m.is_archived ? (
                        <span className="inventory-status active">Actif</span>
                      ) : (
                        <button
                          className="inventory-activate-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(m.id);
                          }}
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

        {/* Section : Monstres terminés */}
        <div className="inventory-section">
          <h2 className="inventory-section-title">
            Monstres terminés
            <span className="inventory-section-count">{completed.length}</span>
          </h2>
          {completed.length === 0 ? (
            <p className="inventory-empty">
              Aucun monstre terminé pour l'instant.
            </p>
          ) : (
            <div className="inventory-grid">
              {completed.map((m) => (
                <div
                  key={m.id}
                  className="inventory-card completed"
                  onClick={() => setPopup({ type: "completed", monster: m })}
                >
                  <img
                    src={`${m.base_image_url}_3.png`}
                    alt={m.species_name}
                    className="inventory-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/species/placeholder.png";
                    }}
                  />
                  <div className="inventory-card-body">
                    <span className="inventory-card-name">
                      {m.species_name}
                    </span>
                    <span className="inventory-card-sub">
                      Niv. max {m.max_level_reached}
                    </span>
                    <span className="inventory-status completed">Terminé</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section : Décorations */}
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

      {/* Popup */}
      {popup && (
        <div className="inv-popup-overlay" onClick={() => setPopup(null)}>
          <div className="inv-popup" onClick={(e) => e.stopPropagation()}>
            <button className="inv-popup-close" onClick={() => setPopup(null)}>
              ✕
            </button>

            {popup.type === "active" && (
              <>
                <h2 className="inv-popup-title">
                  {popup.monster.species_name}
                </h2>
                <img
                  src={getMonsterImageUrl(
                    popup.monster.base_image_url,
                    popup.monster.level,
                    popup.monster.max_level,
                  )}
                  alt={popup.monster.species_name}
                  className="inv-popup-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/species/placeholder.png";
                  }}
                />
                <p className="inv-popup-locked">
                  Finis le monstre pour découvrir son histoire.
                </p>
                <p className="inv-popup-levels">
                  {popup.monster.max_level - popup.monster.level} niveau
                  {popup.monster.max_level - popup.monster.level > 1
                    ? "x"
                    : ""}{" "}
                  restant
                  {popup.monster.max_level - popup.monster.level > 1 ? "s" : ""}
                </p>
              </>
            )}

            {popup.type === "completed" && (
              <>
                <h2 className="inv-popup-title">
                  {popup.monster.species_name}
                </h2>
                <div className="inv-popup-stages">
                  {[1, 2, 3].map((stage) => (
                    <div key={stage} className="inv-popup-stage">
                      <img
                        src={`${popup.monster.base_image_url}_${stage}.png`}
                        alt={`Stade ${stage}`}
                        className="inv-popup-stage-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/species/placeholder.png";
                        }}
                      />
                      <span className="inv-popup-stage-label">
                        Stade {stage}
                      </span>
                    </div>
                  ))}
                </div>
                {popup.monster.lore && (
                  <p className="inv-popup-lore">{popup.monster.lore}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
