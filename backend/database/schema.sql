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
  lore TEXT,
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
  next_available_at TIMESTAMP NULL DEFAULT NULL,
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

INSERT INTO species (name, unlock_cost, hunger_interval_hours, max_level, base_image_url, is_starter, lore) VALUES
('Dianthus', 45, 4, 9, '/species/dianthus', TRUE, 'Né dans les jardins oubliés, Dianthus est une créature timide qui s\'éveille lentement à la vie. Sa fragilité cache une volonté de fer, et ceux qui prennent soin de lui découvrent un compagnon d\'une fidélité sans égale. On dit que sa floraison finale illumine même les nuits les plus sombres.'),
('Callistemon', 50, 6, 9, '/species/callistemon', FALSE, 'Callistemon est né du feu et de la sève. Farouche et indépendant, il ne s\'attache qu\'à ceux qui ont su gagner sa confiance. Sa transformation finale révèle une créature d\'une beauté ardente, dont les flammes réchauffent sans brûler.'),
('Chicory', 60, 6, 9, '/species/chicory', FALSE, 'Chicory pousse dans les terrains difficiles là où les autres abandonnent. Humble et persévérant, il accumule une sagesse silencieuse au fil des niveaux. Sa forme finale dévoile un être contemplatif dont la présence apaise tout ce qui l\'entoure.'),
('Galanthus', 70, 8, 12, '/species/galanthus', FALSE, 'Galanthus est l\'enfant de l\'hiver et du renouveau. Plus long à élever que les autres, il révèle progressivement une nature complexe et profonde. Son histoire est celle d\'une renaissance perpétuelle, et sa forme ultime incarne l\'espoir dans sa forme la plus pure.'),
('Baptisia', 100, 6, 9, '/species/baptisia', FALSE, 'Baptisia est une créature rare et précieuse. Son élevage demande patience et richesse, mais la récompense est à la hauteur du sacrifice. Sa forme finale dévoile une puissance tranquille et une élégance sauvage que peu d\'yeux ont eu la chance de contempler.');

INSERT INTO decorations (name, description, price, image_url) VALUES
('Jukebox', 'Il fait de la musique, normalement.', 30, '/objets/Jukebox.png'),
('Le gentil chat', 'Il avait faim, ce vieux chat.', 30, '/objets/Low_poly_cat.png'),
('Pepsi frog', 'Des gens disent qu\'il est pote avec PepsiMan.', 30, '/objets/Pepsi_frog.png'),
('Boite de pizza', 'ELLE EST VIDE, pourquoi voudrais-tu l\'acheter ?', 30, '/objets/Pizza_box.png'),
('La patate chat', 'mmmmmh miam', 30, '/objets/Potato_cat.png'),
('Boite qui tourne', 'YOU SPIN ME RIGHT ROUND, BABY RIGHT ROUND-', 30, '/objets/Spining_box.gif'),
('Springul', 'Hello pigeon, HE! HE! HE!', 30, '/objets/Springul.png'),
('Fraise', 'C\'est une fraise.', 30, '/objets/Strawberry.png'),
('Nounours', 'Il est en chemin!', 30, '/objets/Walking_bear.gif');