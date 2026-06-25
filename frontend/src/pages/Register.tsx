import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/auth.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pseudo: "",
    password: "",
    confirm: "",
    email: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.pseudo || !form.password || !form.email) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.consent) {
      setError("Vous devez accepter les conditions pour continuer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo: form.pseudo,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Échec de l'inscription.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Compte configuré avec succès ! Démarrage...");

      setTimeout(() => {
        navigate("/game");
      }, 1200);
    } catch {
      setError("Erreur serveur lors de l'installation. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-screen-wrap">
      <div className="setup-main-layout">
        {/* Colonne latérale gauche de progression d'installation */}
        <aside className="setup-sidebar">
          <ul className="setup-steps-list">
            <li className="setup-step-item done">
              Avoir cliqué sur le lien du jeu
            </li>
            <li className="setup-step-item active">Collecte d'informations</li>
            <li className="setup-step-item">Lancement du tutoriel</li>
            <li className="setup-step-item">Bon jeu !</li>
          </ul>
          <div className="setup-sidebar-footer">
            <div className="setup-countdown">
              <span className="countdown-label">CAZALIS Matthieu</span>
              <span className="countdown-value">BOURMAUD SIMON</span>
            </div>
            <div className="setup-vendor-logo">Mad.dawg101</div>
          </div>
        </aside>

        {/* Fenêtre principale (Wizard Dialog) */}
        <main className="setup-wizard-window">
          <div className="auth-titlebar">
            <span className="auth-titlebar-label">
              Assistant de création de compte
            </span>
            <div className="auth-titlebar-btns">
              <button
                className="auth-win-btn"
                onClick={() => navigate("/login")}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="setup-wizard-body">
            <h2 className="setup-section-title">
              Création de votre compte joueur
            </h2>
            <p className="setup-section-desc">
              Veuillez configurer vos identifiants pour enregistrer votre profil
              de joueur.
            </p>

            <div className="setup-wizard-content-split">
              <div className="setup-info-panel">
                <div className="setup-info-box">
                  <p className="auth-spoiler-title">TW : Spoilers</p>
                </div>
                <ul className="auth-feature-list">
                  <li className="auth-feature-item">
                    5 monstres avec designs et évolutions uniques !
                  </li>
                  <li className="auth-feature-item">
                    Objets rétro à collecter et décorations !
                  </li>
                  <li className="auth-feature-item">
                    Soyez patients avec vos petits monstres.
                  </li>
                </ul>
              </div>

              <div className="setup-form-panel">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="pseudo">
                    Nom d'utilisateur (Pseudo) :
                  </label>
                  <input
                    id="pseudo"
                    className="auth-input"
                    name="pseudo"
                    type="text"
                    value={form.pseudo}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Adresse e-mail :
                  </label>
                  <input
                    id="email"
                    className="auth-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">
                    Mot de passe :
                  </label>
                  <input
                    id="password"
                    className="auth-input"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirm">
                    Confirmer le mot de passe :
                  </label>
                  <input
                    id="confirm"
                    className="auth-input"
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-check-row">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={handleChange}
                  />
                  <label htmlFor="consent" className="auth-check-label">
                    Je consens à ce que ce jeu contienne des surprises… ouais.
                  </label>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}
              </div>
            </div>

            {/* Pied de page du Wizard contenant la rangée de boutons officiels */}
            <div className="setup-wizard-footer">
              <hr className="auth-separator" />
              <div className="setup-wizard-actions">
                <button className="auth-btn" onClick={() => navigate("/login")}>
                  &lt; Précédent
                </button>
                <button
                  className="auth-btn default"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Chargement..." : "Suivant >"}
                </button>
                <button className="auth-btn" onClick={() => navigate("/login")}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
