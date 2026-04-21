-- Utiliser la base créée par Docker
USE monster_game;


-- Table des utilisateurs

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  pseudo VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  coins INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des monstres
-- Un monstre appartient à un utilisateur

CREATE TABLE IF NOT EXISTS monsters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  hunger_level INT NOT NULL DEFAULT 50,
  evolution_stage INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  last_fed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de la boutique

CREATE TABLE IF NOT EXISTS decorations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table de liaison users <-> decorations
-- Ce que chaque utilisateur possède et a équipé

CREATE TABLE IF NOT EXISTS user_decorations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  decoration_id INT NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (decoration_id) REFERENCES decorations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_decoration (user_id, decoration_id)
);


-- Données de base pour la boutique
-- On insère quelques décorations pour démarrer

INSERT INTO decorations (name, description, price, image_url) VALUES
('Tapis bleu', 'Un tapis douillet pour ton monstre', 50, '/images/tapis_bleu.png'),
('Arbre miniature', 'Un petit arbre pour décorer', 100, '/images/arbre.png'),
('Château en bois', 'Un vrai château pour monstre', 500, '/images/chateau.png'),
('Ballon rouge', 'Pour jouer avec ton monstre', 30, '/images/ballon.png'),
('Lampe', 'Éclaire dans la nuit', 150, '/images/lampe.png');