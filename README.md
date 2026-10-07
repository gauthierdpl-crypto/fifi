# Le Débarras Français — ledebarrasfrancais.fr

Site statique (HTML/CSS/JS, sans build) de Le Débarras Français : débarras de maisons en Normandie.

- `index.html`, `devis.html`, `partenaires.html` : pages principales
- `services/` : pages par prestation
- `villes/` : pages locales par commune (SEO)
- `medias/`, `vendor/` : images, vidéos et bibliothèques
- `_headers`, `_redirects` : configuration Netlify

Source de travail : dossier `SITE CLAUDE` sur le Mac, copie déployable `_SITE_A_DEPLOYER` (générée par `sync.sh`). Ce dépôt reflète cette copie.

Aperçu local : `python3 -m http.server 8000` puis http://localhost:8000
