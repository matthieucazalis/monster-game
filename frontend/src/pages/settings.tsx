import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./style/settings.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Settings() {
  const navigate = useNavigate();
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messages, setMessages] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  const token = localStorage.getItem("token");

  const setMsg = (key: string, msg: string) =>
    setMessages((prev) => ({ ...prev, [key]: msg }));
  const setErr = (key: string, err: string) =>
    setErrors((prev) => ({ ...prev, [key]: err }));
  const clearSection = (key: string) => {
    setMessages((prev) => ({ ...prev, [key]: "" }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    clearSection("email");
    try {
      const res = await fetch(`${API_URL}/api/auth/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr("email", data.message);
        return;
      }
      setMsg("email", data.message);
      setEmailForm({ email: "", password: "" });
      const stored = localStorage.getItem("user");
      if (stored) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...JSON.parse(stored), email: emailForm.email }),
        );
      }
    } catch {
      setErr("email", "Erreur serveur.");
    }
  };

  const handleReset = async () => {
    clearSection("reset");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setErr("reset", data.message);
        return;
      }
      setShowResetConfirm(false);
      setResetPassword("");
      setMsg("reset", data.message);
      const stored = localStorage.getItem("user");
      if (stored) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...JSON.parse(stored), coins: 100 }),
        );
      }
    } catch {
      setErr("reset", "Erreur serveur.");
    }
  };

  const handleDeleteAccount = async () => {
    clearSection("delete");
    try {
      const res = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr("delete", data.message);
        return;
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch {
      setErr("delete", "Erreur serveur.");
    }
  };

  return (
    <div className="settings-wrap">
      <Navbar />
      <div className="settings-content">
        <h1 className="settings-title">Paramètres</h1>

        {/* Déconnexion */}
        <div className="settings-section">
          <h2 className="settings-section-title">Session</h2>
          <button className="settings-logout-btn" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>

        {/* Changer email */}
        <div className="settings-section">
          <h2 className="settings-section-title">Changer l'email</h2>
          {messages.email && (
            <p className="settings-notice success">{messages.email}</p>
          )}
          {errors.email && (
            <p className="settings-notice error">{errors.email}</p>
          )}
          <form className="settings-form" onSubmit={handleChangeEmail}>
            <input
              className="settings-input"
              type="email"
              placeholder="Nouvel email"
              value={emailForm.email}
              onChange={(e) =>
                setEmailForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
            <input
              className="settings-input"
              type="password"
              placeholder="Mot de passe actuel"
              value={emailForm.password}
              onChange={(e) =>
                setEmailForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
            <button className="settings-submit-btn" type="submit">
              Confirmer
            </button>
          </form>
        </div>

        {/* Réinitialiser le compte */}
        <div className="settings-section">
          <h2 className="settings-section-title">Réinitialiser le jeu</h2>
          <p className="settings-danger-text">
            Supprime tous vos monstres et décorations, et remet vos coins à 100.
          </p>
          {messages.reset && (
            <p className="settings-notice success">{messages.reset}</p>
          )}
          {!showResetConfirm ? (
            <button
              className="settings-delete-btn"
              onClick={() => setShowResetConfirm(true)}
            >
              Réinitialiser
            </button>
          ) : (
            <div className="settings-delete-confirm">
              {errors.reset && (
                <p className="settings-notice error">{errors.reset}</p>
              )}
              <p style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
                Es-tu sûr ? Cette action est irréversible.
              </p>
              <div className="settings-delete-actions">
                <button className="settings-delete-btn" onClick={handleReset}>
                  Confirmer
                </button>
                <button
                  className="settings-cancel-btn"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supprimer le compte */}
        <div className="settings-section danger">
          <h2 className="settings-section-title danger">Supprimer le compte</h2>
          <p className="settings-danger-text">
            Cette action est irréversible. Tous vos monstres et décorations
            seront supprimés.
          </p>
          {!showDeleteConfirm ? (
            <button
              className="settings-delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="settings-delete-confirm">
              {errors.delete && (
                <p className="settings-notice error">{errors.delete}</p>
              )}
              <input
                className="settings-input"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="settings-delete-actions">
                <button
                  className="settings-delete-btn"
                  onClick={handleDeleteAccount}
                >
                  Confirmer la suppression
                </button>
                <button
                  className="settings-cancel-btn"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
