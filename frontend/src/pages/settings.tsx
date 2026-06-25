import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./style/settings.css";
import {
  applyTheme,
  saveTheme,
  clearStoredTheme,
  getStoredTheme,
  DEFAULT_THEME,
  ThemeColors,
} from "../utils/theme";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

interface UserInfo {
  pseudo: string;
  email: string;
}

type EditMode = "pseudo" | "email" | "password" | null;
type ConfirmMode = "reset" | "delete" | null;

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [userInfo, setUserInfo] = useState<UserInfo>({ pseudo: "", email: "" });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);

  // Form fields
  const [newValue, setNewValue] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Personnalisation des couleurs (fond + barre de titre)
  const [themeColors, setThemeColors] = useState<ThemeColors>(getStoredTheme());

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo({ pseudo: data.pseudo, email: data.email });
      }
    } catch {}
  };

  const reset = () => {
    setEditMode(null);
    setConfirmMode(null);
    setNewValue("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePseudo = async () => {
    setError("");
    setMessage("");
    if (!newValue || !password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/username`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newValue, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setUserInfo((u) => ({ ...u, pseudo: newValue }));
      setMessage("Nom d'utilisateur mis à jour !");
      reset();
    } catch {
      setError("Erreur serveur.");
    }
  };

  const handleChangeEmail = async () => {
    setError("");
    setMessage("");
    if (!newValue || !password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newValue, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setUserInfo((u) => ({ ...u, email: newValue }));
      setMessage("Email mis à jour !");
      reset();
    } catch {
      setError("Erreur serveur.");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");
    if (!password || !newPassword || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage("Mot de passe mis à jour !");
      reset();
    } catch {
      setError("Erreur serveur.");
    }
  };

  const handleReset = async () => {
    setError("");
    setMessage("");
    if (!password) {
      setError("Mot de passe obligatoire.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage("Compte réinitialisé !");
      reset();
    } catch {
      setError("Erreur serveur.");
    }
  };

  const handleDelete = async () => {
    setError("");
    if (!password) {
      setError("Mot de passe obligatoire.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch {
      setError("Erreur serveur.");
    }
  };

  // --- Personnalisation des couleurs ---

  const handleBgColorChange = (value: string) => {
    const updated = { ...themeColors, bgColor: value };
    setThemeColors(updated);
    applyTheme(updated);
    saveTheme(updated);
  };

  const handleTitlebarColorChange = (value: string) => {
    const updated = { ...themeColors, titlebarColor: value };
    setThemeColors(updated);
    applyTheme(updated);
    saveTheme(updated);
  };

  const handleResetColors = () => {
    setThemeColors({ ...DEFAULT_THEME });
    applyTheme(DEFAULT_THEME);
    clearStoredTheme();
  };

  return (
    <div className="settings-wrap">
      <Navbar />

      <div className="settings-desktop">
        {/* Fenêtre principale Système / Paramètres */}
        <section className="settings-window">
          <div className="settings-titlebar">
            <span className="settings-titlebar-label">
              Propriétés du système
            </span>
            <div className="settings-titlebar-btns">
              <button className="settings-win-btn">─</button>
              <button className="settings-win-btn">□</button>
              <button
                className="settings-win-btn"
                onClick={() => navigate("/game")}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="settings-window-body">
            {(message || error) && (
              <div className="settings-notices">
                {message && (
                  <p className="settings-notice success">{message}</p>
                )}
                {error && <p className="settings-notice error">{error}</p>}
              </div>
            )}

            {/* Infos du compte */}
            <div className="settings-section">
              <h2 className="settings-section-title">Mon compte</h2>

              {/* Pseudo */}
              <div className="settings-info-row">
                <div className="settings-info-content">
                  <span className="settings-info-label">Nom d'utilisateur</span>
                  <span className="settings-info-value">{userInfo.pseudo}</span>
                </div>
                <button
                  className="settings-edit-btn"
                  onClick={() => {
                    reset();
                    setEditMode("pseudo");
                  }}
                >
                  Modifier
                </button>
              </div>
              {editMode === "pseudo" && (
                <div className="settings-edit-form">
                  <input
                    className="settings-input"
                    type="text"
                    placeholder="Nouveau nom d'utilisateur"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="settings-form-actions">
                    <button
                      className="settings-submit-btn"
                      onClick={handleChangePseudo}
                    >
                      Confirmer
                    </button>
                    <button className="settings-cancel-btn" onClick={reset}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="settings-info-row" style={{ marginTop: 16 }}>
                <div className="settings-info-content">
                  <span className="settings-info-label">Email</span>
                  <span className="settings-info-value">{userInfo.email}</span>
                </div>
                <button
                  className="settings-edit-btn"
                  onClick={() => {
                    reset();
                    setEditMode("email");
                  }}
                >
                  Modifier
                </button>
              </div>
              {editMode === "email" && (
                <div className="settings-edit-form">
                  <input
                    className="settings-input"
                    type="email"
                    placeholder="Nouvel email"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="settings-form-actions">
                    <button
                      className="settings-submit-btn"
                      onClick={handleChangeEmail}
                    >
                      Confirmer
                    </button>
                    <button className="settings-cancel-btn" onClick={reset}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Changer mot de passe */}
            <div className="settings-section">
              <h2 className="settings-section-title">Sécurité</h2>
              {editMode !== "password" ? (
                <button
                  className="settings-action-btn"
                  onClick={() => {
                    reset();
                    setEditMode("password");
                  }}
                >
                  Changer le mot de passe...
                </button>
              ) : (
                <div className="settings-edit-form">
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="settings-form-actions">
                    <button
                      className="settings-submit-btn"
                      onClick={handleChangePassword}
                    >
                      Confirmer
                    </button>
                    <button className="settings-cancel-btn" onClick={reset}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Personnalisation */}
            <div className="settings-section">
              <h2 className="settings-section-title">Personnalisation</h2>

              <div className="settings-color-row">
                <span className="settings-color-label">
                  Couleur du fond d'écran
                </span>
                <input
                  className="settings-color-picker"
                  type="color"
                  value={themeColors.bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                />
              </div>

              <div className="settings-color-row">
                <span className="settings-color-label">
                  Couleur des barres de fenêtres
                </span>
                <input
                  className="settings-color-picker"
                  type="color"
                  value={themeColors.titlebarColor}
                  onChange={(e) => handleTitlebarColorChange(e.target.value)}
                />
              </div>

              <button
                className="settings-action-btn"
                onClick={handleResetColors}
              >
                Réinitialiser les couleurs
              </button>
            </div>

            {/* Session */}
            <div className="settings-section">
              <h2 className="settings-section-title">Session</h2>
              <button className="settings-action-btn" onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>

            {/* Réinitialiser */}
            <div className="settings-section">
              <h2 className="settings-section-title">Zone de danger</h2>
              <p className="settings-danger-text">
                Réinitialiser : Supprime vos monstres/décorations et remet vos
                coins à 0.
              </p>
              {confirmMode !== "reset" ? (
                <button
                  className="settings-danger-btn"
                  onClick={() => {
                    reset();
                    setConfirmMode("reset");
                  }}
                >
                  Réinitialiser le jeu...
                </button>
              ) : (
                <div className="settings-delete-confirm">
                  <p className="settings-warn-label">
                    Cette action est irréversible.
                  </p>
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="settings-delete-actions">
                    <button
                      className="settings-danger-btn execution"
                      onClick={handleReset}
                    >
                      Confirmer la remise à zéro
                    </button>
                    <button className="settings-cancel-btn" onClick={reset}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Supprimer le compte */}
              <p className="settings-danger-text" style={{ marginTop: 20 }}>
                Supprimer : Désactive et détruit définitivement votre compte
                joueur.
              </p>
              {confirmMode !== "delete" ? (
                <button
                  className="settings-danger-btn"
                  onClick={() => {
                    reset();
                    setConfirmMode("delete");
                  }}
                >
                  Supprimer le compte...
                </button>
              ) : (
                <div className="settings-delete-confirm">
                  <p className="settings-warn-label">
                    Êtes-vous sûr ? Tout sera perdu.
                  </p>
                  <input
                    className="settings-input"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="settings-delete-actions">
                    <button
                      className="settings-danger-btn execution"
                      onClick={handleDelete}
                    >
                      Supprimer définitivement
                    </button>
                    <button className="settings-cancel-btn" onClick={reset}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Crédits */}
            <div className="settings-section">
              <h2 className="settings-section-title">Crédits système</h2>
              <div className="settings-credits">
                <div className="settings-credit-row">
                  <span className="settings-credit-role">Développeur</span>
                  <span className="settings-credit-name">CAZALIS Matthieu</span>
                </div>
                <div className="settings-credit-row">
                  <span className="settings-credit-role">Développeur</span>
                  <span className="settings-credit-name">BOURMAUD Simon</span>
                </div>
                <div className="settings-credit-row">
                  <span className="settings-credit-role">Artiste</span>
                  <span className="settings-credit-name">mad.davvg101</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
