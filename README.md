# Débarras DMS — Site vitrine

Site vitrine premium pour **Débarras DMS**, entreprise de débarras professionnel en Normandie
(Eure, Seine-Maritime). Design inspiré du site d'Apple : typographie généreuse, beaucoup d'espace,
animations fluides au défilement.

## Contenu

- Débarras de maisons, appartements, caves, greniers, garages, locaux professionnels
- Situations : succession, déménagement, logement encombré, syndrome de Diogène
- Rachat de mobilier et antiquités
- Zone : Eure (27), Seine-Maritime (76), Normandie
- Contact : 07 49 76 72 40 · contact@debarrasdms.fr · 7j/7 9h–19h

## Stack

100 % statique, sans dépendance ni build :

| Fichier       | Rôle                                                   |
|---------------|--------------------------------------------------------|
| `index.html`  | Structure et contenu de la page                        |
| `styles.css`  | Design, mise en page responsive, animations CSS        |
| `script.js`   | Reveal au scroll, nav, compteurs, parallaxe, menu mobile |

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Personnalisation rapide

- **Couleurs** : variables CSS en haut de `styles.css` (`:root`).
- **Coordonnées** : recherchez `07 49 76 72 40` et `contact@debarrasdms.fr` dans `index.html`.
- **Formulaire** : pointe actuellement vers un `mailto:`. Pour un envoi serveur, remplacer
  l'attribut `action` du formulaire `#contactForm` par l'URL de votre service (ex. Formspree).
