USE monster_game;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  pseudo VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  coins INT NOT NULL DEFAULT 0,
  is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unlock_cost INT NOT NULL DEFAULT 0,
  hunger_interval_hours INT NOT NULL DEFAULT 8,
  max_level INT NOT NULL DEFAULT 10,
  base_image_url VARCHAR(255),
  is_starter BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monsters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  specie_id INT NOT NULL DEFAULT 1,
  level INT NOT NULL DEFAULT 1,
  stade INT NOT NULL DEFAULT 1,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (specie_id) REFERENCES species(id)
);

CREATE TABLE IF NOT EXISTS completed_monsters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  specie_id INT NOT NULL,
  max_level_reached INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (specie_id) REFERENCES species(id)
);

CREATE TABLE IF NOT EXISTS decorations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_decorations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  decoration_id INT NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
  position_x INT DEFAULT NULL,
  position_y INT DEFAULT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (decoration_id) REFERENCES decorations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_decoration (user_id, decoration_id)
);

INSERT INTO species (name, unlock_cost, hunger_interval_hours, max_level, base_image_url, is_starter) VALUES
('Dianthus', 45, 4, 9, '/species/dianthus', TRUE),
('Callistemon', 50, 6, 9, '/species/callistemon', FALSE),
('Chicory', 60, 6, 9, '/species/chicory', FALSE),
('Galanthus', 70, 8, 12, '/species/galanthus', FALSE),
('Baptisia', 100, 6, 9, '/species/baptisia', FALSE);

INSERT INTO decorations (name, description, price, image_url) VALUES
('Tapis bleu', 'Un tapis douillet pour ton monstre', 50, '/images/tapis_bleu.png'),
('Arbre miniature', 'Un petit arbre pour décorer', 100, '/images/arbre.png'),
('Château en bois', 'Un vrai château pour monstre', 500, '/images/chateau.png'),
('Ballon rouge', 'Pour jouer avec ton monstre', 30, '/images/ballon.png'),
('Lampe', 'Éclaire dans la nuit', 150, '/images/lampe.png');