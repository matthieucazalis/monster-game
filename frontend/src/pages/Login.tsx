import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/auth.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Échec de la connexion.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/game");
    } catch {
      setError("Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* Fenêtre de session */}
      <div className="auth-window">
        <div className="auth-titlebar">
          <span className="auth-titlebar-label">
            Connexion
          </span>
          <div className="auth-titlebar-btns">
            <button className="auth-win-btn">?</button>
            <button className="auth-win-btn" onClick={() => navigate("/")}>
              ✕
            </button>
          </div>
        </div>

        <div className="auth-window-body">
          {/* En-tête avec illustration rétro */}
          <div className="auth-header-zone">
            <div className="auth-retro-icon" aria-hidden="true">
              🔑
            </div>
            <div className="auth-welcome-text">
              <h1 className="auth-title">MONSTER GAME</h1>
              <p className="auth-subtitle">
                Tapez votre identifiant et votre mot de passe pour accéder à
                votre espace de jeu Tamagotchi.
              </p>
            </div>
          </div>

          <hr className="auth-separator" />

          {/* Formulaire & Actions côte à côte (Style Windows classique) */}
          <div className="auth-main-layout">
            <div className="auth-form-fields">
              <div className="auth-field">
                <label className="auth-label" htmlFor="email">
                  Nom d'utilisateur (Email) :
                </label>
                <input
                  id="email"
                  className="auth-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoFocus
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

              {error && <p className="auth-error">{error}</p>}

              <p className="auth-nav-text">
                Nouveau membre ?{" "}
                <a href="/register" className="auth-link">
                  Créer un nouveau compte joueur...
                </a>
              </p>
            </div>

            {/* Colonne des boutons de commande à droite */}
            <div className="auth-action-buttons">
              <button
                className="auth-btn default"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Attente..." : "OK"}
              </button>
              <button
                className="auth-btn"
                onClick={() => setForm({ email: "", password: "" })}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
