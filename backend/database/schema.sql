SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS monster_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
  image_url VARCHAR(255)
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
('Dianthus', 45, 4, 9, '/species/dianthus', TRUE, 'Dianthus est le compagnon idéal pour les débutants. Facile à élever et toujours joyeux, il apporte une énergie positive à son entourage. Sa transformation finale révèle une force différente et rebelle, la sagesse n`est pas toujours là où on l`attend.'),
('Callistemon', 50, 6, 9, '/species/callistemon', FALSE, 'Callistemon est un esprit libre et indomptable. Il aime explorer et découvrir de nouveaux horizons. Sa forme finale incarne la liberté et l`audace avec force, inspirant ceux qui le rencontrent à suivre leur propre chemin.'),
('Chicory', 60, 6, 9, '/species/chicory', FALSE, 'Chicory est un être mystérieux et énigmatique. Il aime se cacher dans l`ombre et observer le monde qui l`entoure. Il incarne la seconde chance à la vie, mais même adulte, il reste lui même.'),
('Galanthus', 70, 8, 12, '/species/galanthus', FALSE, 'Galanthus est ###### une creature douce et gentille, sa forme finale est ######### ##### ##### #### you should be seeing that. #### ######### ## ####'),
('Baptisia', 100, 6, 9, '/species/baptisia', FALSE, 'Baptisia est le propre gardien de ces terre. Ses ailles sont symbole de grandeur et force étant donné qu`il sagit de la seule espèce pouvant voler. SAUF ### ### #######');

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