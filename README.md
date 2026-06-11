# Prospection OS

Application web locale responsive pour structurer la prospection quotidienne autour du skincare coreen premium et du marketing relationnel.

## Lancer l'application

```bash
npm install --cache ./work/npm-cache
npm run build
npm run preview -- --port 4173
```

Ouvrir ensuite l'adresse locale affichee par Vite dans le terminal.

## CRM professionnel

La version actuelle inclut :

- fiches prospects completes : telephone, WhatsApp, email, ville, profession, recommandation, tags et notes ;
- historique chronologique automatique sur chaque fiche ;
- relances automatiques quand le statut change ;
- scoring commercial `Chaud`, `Tiede`, `Froid` ;
- recherche CRM et filtres avances ;
- statistiques de conversion ;
- pipeline RIMAN : `Rituel propose`, `Rituel realise`, `Cliente`, `Partenaire`, `Commande` ;
- bibliotheque de scripts et reponses aux objections.

## Donnees

L'application utilise `localStorage` avec deux cles principales :

- `prospection-os:prospects` pour le CRM et le Kanban.
- `prospection-os:daily` pour les objectifs et compteurs du jour.

La lecture/ecriture passe par `storageAdapter` dans `src/main.jsx`. Cette forme est volontairement simple pour remplacer plus tard localStorage par Supabase sans refaire les composants d'interface.
