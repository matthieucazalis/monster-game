import { useState } from "react";
import "../pages/style/components.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface Decoration {
  user_decoration_id: number;
  name: string;
  image_url: string;
  position_x: number | null;
}

interface DecorationShelfProps {
  decorations: Decoration[];
  allDecorations: Decoration[];
  onUpdate: () => void;
}

const SLOT_POSITIONS = [
  { top: "55%", left: "22%" }, // slot 1
  { top: "55%", left: "50%" }, // slot 2
  { top: "55%", left: "78%" }, // slot 3
  { top: "89%", left: "22%" }, // slot 4
  { top: "89%", left: "50%" }, // slot 5
  { top: "89%", left: "78%" }, // slot 6
];

export default function DecorationShelf({
  decorations,
  allDecorations,
  onUpdate,
}: DecorationShelfProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 6 slots indexés 1–6
  const slots: (Decoration | null)[] = Array.from({ length: 6 }, (_, i) => {
    return decorations.find((d) => d.position_x === i + 1) ?? null;
  });

  const equippedIds = decorations.map((d) => d.user_decoration_id);
  const unplacedDecorations = allDecorations.filter(
    (d) => !equippedIds.includes(d.user_decoration_id),
  );

  const handlePlace = async (userDecorationId: number, slot: number) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/decorations/place/${userDecorationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slot }),
      });
      onUpdate();
    } finally {
      setLoading(false);
      setSelectedSlot(null);
    }
  };

  const handleRemove = async (userDecorationId: number) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/decorations/remove/${userDecorationId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } finally {
      setLoading(false);
      setSelectedSlot(null);
    }
  };

  const currentSlotDeco =
    selectedSlot !== null ? slots[selectedSlot - 1] : null;

  return (
    <>
      <div className="shelf-wrap">
        <img className="shelf-image" src="/images/counter.png" alt="comptoir" />

        {slots.map((item, i) => {
          const slotNumber = i + 1;
          const pos = SLOT_POSITIONS[i];
          return (
            <div
              key={i}
              className={`shelf-slot ${item ? "shelf-slot--filled" : "shelf-slot--empty"}`}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setSelectedSlot(slotNumber)}
              title={
                item
                  ? `${item.name} — cliquez pour modifier`
                  : "Slot vide — cliquez pour placer"
              }
            >
              {item ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/placeholder.png";
                  }}
                />
              ) : (
                <div className="shelf-slot-empty" />
              )}
            </div>
          );
        })}
      </div>

      {/* Popup de sélection */}
      {selectedSlot !== null && (
        <div
          className="shelf-popup-overlay"
          onClick={() => setSelectedSlot(null)}
        >
          <div className="shelf-popup" onClick={(e) => e.stopPropagation()}>
            {/* Barre de titre Win98 */}
            <div className="shelf-popup-titlebar">
              <span className="shelf-popup-titlebar-label">
                📦 Slot {selectedSlot}
              </span>
              <button
                className="shelf-popup-close"
                onClick={() => setSelectedSlot(null)}
              >
                ✕
              </button>
            </div>

            <div className="shelf-popup-body">
              <h3 className="shelf-popup-title">Slot {selectedSlot}</h3>

              {/* Déco actuellement dans ce slot */}
              {currentSlotDeco && (
                <div className="shelf-popup-current">
                  <p className="shelf-popup-label">Actuellement :</p>
                  <div className="shelf-popup-item active">
                    <img
                      src={currentSlotDeco.image_url}
                      alt={currentSlotDeco.name}
                    />
                    <span>{currentSlotDeco.name}</span>
                    <button
                      className="shelf-popup-remove"
                      onClick={() =>
                        handleRemove(currentSlotDeco.user_decoration_id)
                      }
                      disabled={loading}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              )}

              {/* Décos disponibles à placer */}
              <p className="shelf-popup-label">
                {unplacedDecorations.length === 0 && !currentSlotDeco
                  ? "Aucune décoration disponible."
                  : "Choisir une décoration :"}
              </p>

              <div className="shelf-popup-list">
                {unplacedDecorations.map((d) => (
                  <div
                    key={d.user_decoration_id}
                    className="shelf-popup-item"
                    onClick={() =>
                      !loading &&
                      handlePlace(d.user_decoration_id, selectedSlot)
                    }
                  >
                    <img
                      src={d.image_url}
                      alt={d.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/placeholder.png";
                      }}
                    />
                    <span>{d.name}</span>
                  </div>
                ))}

                {/* Décos équipées dans d'autres slots (pour déplacer) */}
                {decorations
                  .filter((d) => d.position_x !== selectedSlot)
                  .map((d) => (
                    <div
                      key={d.user_decoration_id}
                      className="shelf-popup-item other-slot"
                      onClick={() =>
                        !loading &&
                        handlePlace(d.user_decoration_id, selectedSlot)
                      }
                    >
                      <img
                        src={d.image_url}
                        alt={d.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.png";
                        }}
                      />
                      <span>{d.name}</span>
                      <span className="shelf-popup-slot-badge">
                        Slot {d.position_x}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            {/* fin shelf-popup-body */}
          </div>
        </div>
      )}
    </>
  );
}
