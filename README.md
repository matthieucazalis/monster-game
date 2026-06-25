# MONSTER GAME!

Bienvenu dans le déposite du très suspicieux et semblable d'un jeu tamagochi simple.

## COMMENT LANCER CE JEU ?!

c'est simple!

il n'y a qu'à suivre ces instructions:

-installe le dossier en entier (en même temps c'est le jeu.)

-pour le docker, se placer dans le dossier : cd backend. Tu t'assures que le .env contient bien :
DB_HOST=localhost
DB_PORT=3307
DB_USER=admin
DB_PASSWORD=adminpassword
DB_NAME=monster_game
JWT_SECRET=votre_secret_jwt_ici
PORT=3000.
-pour lancer les conteneurs : docker compose up -d. Et verifie que tout tourne avec : docker ps

-puis tourne "npm run dev" sur monster-game/ dans ton terminale

-et clique sur le lien (normalement http://localhost:5173/)

-pour finir, fais ton compte, et voilà !

### SPOILER /!\

voici ce que contient ce projet en résumé:

-backend
là où nous possèdons la partie database (soit base de données en FR) et toute la partie "non visible" permmettant de faire la majorité des liaisons besoin dans le fichier. Comme les controlles (controllers) ainsi que les routes.

-frontend
là où cette fois ci, tu peux tout voir.
il y a le dossier possèdant toutes les images utilisé en .PNG ainsi que les pages en gros et leurs styles !

-ce qui est possible:
tu veux savoir nos petits points en plus ?
et bien il est possible dans les paramètres par exemple, de pouvoir changer les deux couleurs principales à ta gise. Tu souhaites avoir une ambiance rosé ? je t'en pris.
de plus, full aesthetique à là Windows 98 et notament, des minis fenètres intégré où tu peux en intéragir avec certaines.
pour finir, chaque petits monstres qui sont visibles dans ce projet, ont été chacun créé pour ce seul but par une véritable artiste et non de l'IA.

# CREDITS :

CODEURS : CAZALIS MAtthieu & BOURMAUD Simon
ARTISTE : Mad.davvg101
IMAGES AUTRE : Pinterest
