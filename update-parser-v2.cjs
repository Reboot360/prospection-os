const fs = require("fs");

const file = "src/main.jsx";
let text = fs.readFileSync(file, "utf8");

text = text
  .replace(
    'const scoreMatch = text.match(/score\\\\s*[:\\\\-]?\\\\s*(\\\\d{1,2})/i);',
    'const scoreMatch = text.match(/SCORE\\\\s*[:\\\\-]?\\\\s*(\\\\d{1,2})/i) || text.match(/score\\\\s*[:\\\\-]?\\\\s*(\\\\d{1,2})/i);'
  )
  .replace(
    'const priorityMatch = text.match(/priorit[ée]\\\\s*[:\\\\-]?\\\\s*(haute|moyenne|faible)/i);',
    'const priorityMatch = text.match(/PRIORITE\\\\s*[:\\\\-]?\\\\s*(haute|moyenne|faible)/i) || text.match(/priorit[ée]\\\\s*[:\\\\-]?\\\\s*(haute|moyenne|faible)/i);'
  )
  .replace(
    'publicComment: extractBetween(text, ["Commentaire public"]) || form.publicComment,',
    'publicComment: extractBetween(text, ["COMMENTAIRE_PUBLIC", "Commentaire public"]) || form.publicComment,'
  )
  .replace(
    'privateMessage: extractBetween(text, ["Message privé", "Message prive"]) || form.privateMessage,',
    'privateMessage: extractBetween(text, ["MESSAGE_PRIVE", "Message privé", "Message prive"]) || form.privateMessage,'
  )
  .replace(
    'strategy: extractBetween(text, ["Stratégie", "Strategie", "Stratégie d\\\'approche", "Strategie d\\\'approche"]) || form.strategy,',
    'strategy: extractBetween(text, ["STRATEGIE", "Stratégie", "Strategie", "Stratégie d\\\'approche", "Strategie d\\\'approche"]) || form.strategy,'
  )
  .replace(
    'personalNotes: extractBetween(text, ["Notes", "Notes personnelles"]) || form.personalNotes,',
    'personalNotes: extractBetween(text, ["NOTE_CRM", "Notes", "Notes personnelles"]) || form.personalNotes,'
  );

fs.writeFileSync(file, text);
