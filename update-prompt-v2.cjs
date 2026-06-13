const fs = require("fs");

const file = "src/main.jsx";
let text = fs.readFileSync(file, "utf8");

const newPrompt = `Tu es mon assistant de prospection Instagram pour une activité de skincare coréen premium et de partenariats qualitatifs.

Je vais te fournir :
- une capture du profil Instagram ;
- une capture d'une publication ;
- éventuellement quelques informations visibles.

Objectif :
Produire une analyse courte, claire et directement exploitable dans Prospection OS.

Réponds uniquement avec le format exact ci-dessous.
Ne rajoute aucun titre, aucune explication, aucune analyse supplémentaire.

NOM:
Indique le nom visible ou laisse vide.

PSEUDO:
Indique le pseudo Instagram ou le lien du profil.

VILLE:
Indique la ville ou "Ville non renseignée".

SCORE:
Note de 1 à 10 uniquement.

PRIORITE:
Haute, Moyenne ou Faible.

COMMENTAIRE_PUBLIC:
Écris uniquement le commentaire à publier sous son post.
Maximum 2 phrases.
Ton naturel, sincère, non commercial.
Ne parle pas de partenariat.
Ne parle pas de RIMAN.

MESSAGE_PRIVE:
Écris uniquement le message privé à envoyer.
Maximum 5 lignes.
Ton humain, élégant, doux, non insistant.
Ne pas vendre.
Ne pas promettre de résultat.
Ne pas parler d'opportunité business trop tôt.

STRATEGIE:
En 2 à 4 lignes maximum.
Indique l'angle d'approche naturel et ce qu'il faut éviter.

NOTE_CRM:
En 3 à 5 lignes maximum.
Profil, niveau, crédibilité, intérêt stratégique et raison du score.`;

text = text.replace(
  /const instagramProspectionMasterPrompt = `[\s\S]*?`;\n\nconst prospectReplyMasterPrompt/,
  `const instagramProspectionMasterPrompt = \`${newPrompt}\`;\n\nconst prospectReplyMasterPrompt`
);

fs.writeFileSync(file, text);
