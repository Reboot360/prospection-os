import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Brain,
  CalendarClock,
  Check,
  ChevronRight,
  AlertCircle,
  Clock3,
  ClipboardList,
  Copy,
  Flame,
  LayoutDashboard,
  Library,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  Video
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import "./styles.css";

const APP_VERSION = "relances-auto-v3";
console.log(`[Prospection OS] Version active : ${APP_VERSION}`);

const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const nowISO = () => new Date().toISOString();

const statuses = [
  "A contacter",
  "Contacte",
  "Reponse recue",
  "Video 9 min envoyee",
  "Video 25 min envoyee",
  "Call propose",
  "Call prevu",
  "Client",
  "Partenaire",
  "A relancer",
  "Pas interesse"
];

const rimanStages = [
  "Prospect",
  "Rituel propose",
  "Rituel realise",
  "Cliente",
  "Partenaire",
  "Commande"
];

const instagramStages = [
  "Discussion en cours",
  "Intéressé par l'information",
  "Vidéo envoyée",
  "Intéressé par le concept",
  "RDV proposé",
  "RDV / Call effectué",
  "Intérêt partenaire ou client",
  "Partenaire ou client",
  "Pas intéressé"
];

const scoreLabels = ["Froid", "Tiede", "Chaud"];

const followUpRules = {
  Contacte: { days: 2, title: "Relance apres contact", source: "statut" },
  "Reponse recue": { days: 2, title: "Relance apres reponse", source: "statut" },
  "Video 9 min envoyee": { days: 2, title: "Relance video 9 min", source: "statut" },
  "Video 25 min envoyee": { days: 3, title: "Relance video 25 min", source: "statut" },
  "Call propose": { days: 2, title: "Relance call propose", source: "statut" },
  "Call prevu": { days: 1, title: "Relance call prevu", source: "statut" },
  "Rituel propose": { days: 2, title: "Relance rituel propose", source: "pipeline" },
  "Rituel realise": { days: 3, title: "Relance rituel realise", source: "pipeline" }
};

const answeredFollowUpStatuses = [
  "Reponse recue",
  "Video 9 min envoyee",
  "Video 25 min envoyee",
  "Call propose",
  "Call prevu",
  "Client",
  "Partenaire"
];

const statusToRiman = {
  "Call propose": "Rituel propose",
  "Call prevu": "Rituel propose",
  Client: "Cliente",
  Partenaire: "Partenaire"
};

const avatars = [
  {
    id: "cliente-premium-skincare",
    name: "Cliente premium skincare",
    tone: "Elegante, attentive aux resultats, sensible a l'experience.",
    where: ["Instagram beauty premium", "groupes Facebook skincare", "salons wellness", "profils marques luxe"],
    keywords: ["glass skin", "routine coreenne", "soin anti-age", "peau lumineuse", "luxe skincare"],
    signals: ["achete deja du soin haut de gamme", "parle de peau sensible", "aime les rituels", "suit des facialistes"],
    approach: "Entrer par le rituel, la qualite sensorielle et une recommandation personnalisee.",
    objections: ["J'ai deja ma routine", "C'est trop cher", "Ma peau est sensible"]
  },
  {
    id: "estheticienne",
    name: "Estheticienne",
    tone: "Professionnelle, orientee confiance et resultats clientes.",
    where: ["Instagram local", "Google Maps instituts", "LinkedIn beaute", "evenements bien-etre"],
    keywords: ["estheticienne independante", "institut beaute", "soin visage", "cabine esthetique", "peeling doux"],
    signals: ["cherche des nouveautes", "publie avant/apres", "propose soins visage", "parle fidelisation"],
    approach: "Valoriser son expertise et proposer une decouverte professionnelle sans pression.",
    objections: ["Je travaille deja avec une marque", "Je n'ai pas le temps", "Mes clientes ne demandent pas ca"]
  },
  {
    id: "facialiste",
    name: "Facialiste",
    tone: "Experte, exigeante, sensible a la gestuelle et au resultat peau.",
    where: ["Instagram facialistes", "annuaires wellness", "reseaux beaute haut de gamme", "formations massage facial"],
    keywords: ["facialiste", "kobido", "massage visage", "glow facial", "soin liftant naturel"],
    signals: ["contenu educatif peau", "clientele premium", "mise en avant protocoles", "gout pour l'innovation"],
    approach: "Parler protocole, experience client et complement naturel a ses soins.",
    objections: ["Je selectionne peu de marques", "Je veux tester longtemps", "Je ne fais pas de vente produit"]
  },
  {
    id: "spa-institut",
    name: "Spa / institut",
    tone: "Business local, besoin de differenciation et de panier moyen.",
    where: ["Google Maps", "Instagram lieux premium", "hotels spa", "centres wellness", "LinkedIn dirigeants"],
    keywords: ["spa premium", "institut haut de gamme", "soin signature", "rituel visage", "bien-etre luxe"],
    signals: ["menus de soins", "cartes cadeaux", "partenariats locaux", "avis clients sur experience"],
    approach: "Proposer une piste de rituel differenciant, facile a tester avec une cliente type.",
    objections: ["Nous avons deja une carte", "Il faut voir avec la direction", "Pas de budget maintenant"]
  },
  {
    id: "entrepreneuse",
    name: "Entrepreneuse",
    tone: "Curieuse, active, cherche equilibre entre image, revenus et liberte.",
    where: ["LinkedIn", "Instagram business", "reseaux d'entrepreneures", "coworkings", "evenements locaux"],
    keywords: ["entrepreneuse bien-etre", "business feminin", "revenu complementaire", "independante", "personal branding"],
    signals: ["parle liberte", "cherche nouveaux projets", "a une audience", "aime recommander"],
    approach: "Ouvrir sur une opportunite relationnelle alignee avec son image et ses valeurs.",
    objections: ["Je suis deja occupee", "Je ne veux pas vendre", "Je ne connais pas le skincare"]
  },
  {
    id: "future-distributrice",
    name: "Future distributrice",
    tone: "Potentiel reseau, envie d'apprendre, besoin de cadre rassurant.",
    where: ["Instagram lifestyle", "groupes business", "TikTok skincare", "communautes mamans actives", "LinkedIn reconversion"],
    keywords: ["complement revenu", "reconversion", "skincare addict", "business a domicile", "marque coreenne"],
    signals: ["pose des questions business", "recommande naturellement", "cherche flexibilite", "aime apprendre"],
    approach: "Parler accompagnement, simplicite du systeme et premier pas concret.",
    objections: ["Je n'ai pas de reseau", "Je debute", "J'ai peur de deranger"]
  },
  {
    id: "personne-recommandee",
    name: "Personne recommandee",
    tone: "Relation de confiance a preserver, approche courte et chaleureuse.",
    where: ["contacts communs", "recommandations clientes", "amis d'amis", "reseau local", "evenements prives"],
    keywords: ["recommandee par", "amie de", "contact commun", "peau sensible", "cherche routine"],
    signals: ["besoin evoque par un tiers", "interet beaute", "changement de routine", "question recente"],
    approach: "Mentionner la recommandation, demander la permission et rester tres leger.",
    objections: ["Je ne m'y attendais pas", "Je dois reflechir", "Envoie-moi juste l'info"]
  }
];

const platforms = ["Instagram", "LinkedIn", "Facebook", "Google Maps", "TikTok", "Reseau personnel"];
const goals = ["Trouver des prospects", "Creer une conversation", "Proposer une video", "Obtenir un call", "Rechercher partenaires"];
const conversationContexts = [
  "Premier contact",
  "Discussion en cours",
  "Apres video 9 min",
  "Apres video 25 min",
  "Apres rituel",
  "Apres test produit",
  "Opportunite business",
  "Objection",
  "Relance"
];

const scriptLibrary = [
  {
    category: "Premier message",
    title: "Approche douce",
    text: "Bonjour {nom}, je suis tombee sur votre profil et j'ai aime votre univers. Je developpe une approche autour du skincare coreen premium et je me suis dit que cela pourrait resonner avec vous. Est-ce que je peux vous poser une petite question ?"
  },
  {
    category: "Premier message",
    title: "Approche recommandation",
    text: "Bonjour {nom}, votre profil m'a ete recommande car vous semblez sensible aux soins de qualite. Je decouvre des profils qui pourraient aimer un rituel coreen premium. Est-ce que je peux vous envoyer 2 lignes pour voir si c'est pertinent ?"
  },
  {
    category: "Professionnel",
    title: "Institut / spa",
    text: "Bonjour {nom}, je contacte quelques lieux beaute et bien-etre pour presenter une piste simple autour d'un rituel skincare coreen premium. L'objectif est de voir si cela peut enrichir votre experience cliente ou votre offre actuelle."
  },
  {
    category: "RIMAN",
    title: "Invitation rituel",
    text: "Je peux vous presenter le rituel de facon tres simple : les etapes, pour quel type de peau, et ce qui le rend different. Vous preferez que je vous l'envoie ici ?"
  },
  {
    category: "RIMAN",
    title: "Video courte",
    text: "J'ai une video courte qui explique tres bien le concept, sans discours complique. Je peux vous l'envoyer et vous me dites simplement si cela vous parle ?"
  },
  {
    category: "Call",
    title: "Proposition de call",
    text: "Si vous voulez, on peut gagner du temps avec un echange de 10 a 15 minutes. Je vous pose quelques questions, je vous explique le rituel, et vous voyez tranquillement si c'est adapte."
  },
  {
    category: "Relance",
    title: "Relance J+2",
    text: "Bonjour {nom}, je voulais juste savoir si vous aviez eu le temps de regarder mon message. Je peux aussi vous resumer l'idee en deux lignes."
  },
  {
    category: "Relance",
    title: "Relance J+5",
    text: "Je reviens vers vous tranquillement. Si le sujet skincare coreen premium vous intrigue encore, je peux vous envoyer la version courte."
  },
  {
    category: "Relance",
    title: "Relance J+10",
    text: "Derniere petite relance de mon cote. Si ce n'est pas le bon moment, aucun souci, je prefere vous laisser de l'espace."
  }
];

const objectionScripts = [
  {
    objection: "C'est trop cher",
    answer: "Je comprends totalement. Quand on compare juste le prix, cela peut sembler eleve. Ce que je regarde surtout, c'est la qualite du rituel, la duree d'utilisation et le resultat attendu. On peut deja voir si c'est adapte a votre peau avant de parler achat."
  },
  {
    objection: "Je n'ai pas le temps",
    answer: "Je comprends, les journees sont deja pleines. Justement, l'idee n'est pas d'ajouter une contrainte mais de voir si un rituel simple peut s'integrer facilement. Je peux vous envoyer la version courte et vous regardez quand c'est confortable."
  },
  {
    objection: "Je ne veux pas vendre",
    answer: "Je vous rejoins, forcer une vente n'est pas agreable. L'approche ici est relationnelle : recommander quand c'est pertinent, a des personnes qui ont deja un interet. On peut regarder cela comme une decouverte, sans engagement."
  },
  {
    objection: "J'ai deja une marque",
    answer: "C'est plutot bon signe, cela veut dire que vous prenez le sujet au serieux. Je ne cherche pas a remplacer ce qui fonctionne. On peut simplement voir si ce rituel peut completer une approche existante ou ouvrir une nouvelle option."
  },
  {
    objection: "Je dois reflechir",
    answer: "Bien sur, prenez le temps. Pour vous aider a reflechir simplement : est-ce que votre hesitation vient plutot du timing, du budget, ou du fait que vous voulez mieux comprendre le rituel ?"
  },
  {
    objection: "Je n'ai pas de reseau",
    answer: "Je comprends cette peur. Le point de depart n'est pas d'avoir un grand reseau, mais de savoir identifier les bonnes conversations et recommander avec justesse. On peut commencer tres petit."
  }
];

const defaultDaily = {
  date: todayISO(),
  objectives: "Ajouter 5 prospects premium, envoyer 8 messages, obtenir 1 call.",
  messagesSent: 0,
  followUpsDone: 0,
  callsBooked: 0,
  activeStreak: 1
};

function Card({ children, className = "" }) {
  return <section className={`rounded-lg border border-black/10 bg-white shadow-soft ${className}`}>{children}</section>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-ink/55">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-black/10 bg-ivory px-3 py-2 text-sm outline-none transition focus:border-ocean focus:bg-white ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-black/10 bg-ivory px-3 py-2 text-sm outline-none transition focus:border-ocean focus:bg-white ${props.className || ""}`}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-lg border border-black/10 bg-ivory px-3 py-2 text-sm outline-none transition focus:border-ocean focus:bg-white ${props.className || ""}`}
    />
  );
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const styles =
    variant === "secondary"
      ? "border border-black/10 bg-white text-ink hover:bg-mist"
      : "bg-ocean text-white hover:bg-ink";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setSession(null);
        return;
      }
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) return <SupabaseSetupScreen />;
  if (session === undefined) return <FullPageStatus label="Verification de la session..." />;
  if (!session) return <AuthScreen />;
  return <ProspectionApp session={session} />;
}

function ProspectionApp({ session }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedProspectId, setSelectedProspectId] = useState(null);
  const [form, setForm] = useState(emptyProspect());
  const {
    prospects,
    tasks,
    aiAnalyses,
    daily,
    loading,
    error,
    setDaily,
    addProspect,
    updateProspect,
    removeProspect,
    saveAiAnalysis,
    updateAiAnalysis,
    deleteAiAnalysis,
    convertAiAnalysisToProspect
  } = useSupabaseCrm(session.user);

  const normalizedProspects = useMemo(() => prospects.map(normalizeProspect), [prospects]);
  const stats = useMemo(() => computeStats(normalizedProspects, daily, aiAnalyses), [normalizedProspects, daily, aiAnalyses]);

  const handleAddProspect = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    addProspect(form);
    setForm(emptyProspect());
  };

  const createProspectFromAnalysis = async (analysis) => {
    const created = await convertAiAnalysisToProspect(analysis, {
      ...emptyProspect(),
      name: analysis.prospectName || analysis.instagramHandle || "",
      city: analysis.city || "",
      network: "Instagram",
      profileUrl: normalizeInstagramProfileUrl(analysis.instagramHandle),
     score: analysis.priority === "Haute" || analysis.score >= 8
  ? "Chaud"
  : analysis.priority === "Moyenne" || analysis.score >= 5
    ? "Tiede"
    : "Froid",
status: "A contacter",
type: "Prospect",
notes: buildCrmNotesFromAnalysis(analysis),
tags: `analyse ia, instagram, ${
  analysis.priority === "Haute" || analysis.score >= 8
    ? "chaud"
    : analysis.priority === "Moyenne" || analysis.score >= 5
      ? "tiede"
      : "froid"
}`,
nextFollowUp: analysis.priority === "Haute" || analysis.score >= 8
  ? addDays(1)
  : analysis.priority === "Moyenne" || analysis.score >= 5
    ? addDays(2)
    : addDays(4)
    });
    if (created) {
      setForm(emptyProspect());
      setActiveTab("CRM");
    }
  };

  const tabs = [
    ["Dashboard", LayoutDashboard],
    ["CRM", UsersRound],
    ["Pipeline CRM", ClipboardList],
    ["Pipeline RIMAN", ClipboardList],
    ["Statistiques", BarChart3],
    ["Analyse IA", Brain],
    ["Historique IA", ClipboardList],
    ["Avatars", UserRound],
    ["Generateurs", Sparkles],
    ["Assistant IA", Sparkles],
    ["Scripts", Library],
    ["Relances", CalendarClock],
    ["Mon compte", UserRound]
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const openCrmProspect = (prospectId = null) => {
    setSelectedProspectId(prospectId);
    setActiveTab("CRM");
  };

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-black/10 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-champagne">CRM equipe premium</p>
              <h1 className="mt-2 font-display text-4xl leading-tight md:text-6xl">Prospection OS</h1>
              <p className="mt-2 text-sm text-white/65">{session.user.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
              <MiniStat label="Score" value={stats.score} />
              <MiniStat label="Chaud" value={stats.hot} />
              <MiniStat label="Conv." value={`${stats.customerRate}%`} />
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map(([tab, Icon]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={tab}
                >
                  <Icon size={16} />
                  {tab}
                </button>
              ))}
            </nav>
            <button onClick={signOut} className="shrink-0 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</Card>}
        {loading && <Card className="mb-4 p-4 text-sm text-ink/60">Chargement de votre espace...</Card>}
        {activeTab === "Dashboard" && <Dashboard daily={daily} setDaily={setDaily} stats={stats} prospects={normalizedProspects} updateProspect={updateProspect} onOpenCrm={openCrmProspect} />}
        {activeTab === "CRM" && (
          <CRM
            prospects={normalizedProspects}
            selectedProspectId={selectedProspectId}
            form={form}
            setForm={setForm}
            addProspect={handleAddProspect}
            updateProspect={updateProspect}
            removeProspect={removeProspect}
          />
        )}
        {activeTab === "Pipeline CRM" && <InstagramPipeline prospects={prospects} updateProspect={updateProspect} />}
        {activeTab === "Pipeline RIMAN" && <RimanPipeline prospects={normalizedProspects} updateProspect={updateProspect} />}
        {activeTab === "Statistiques" && <StatsView stats={stats} prospects={normalizedProspects} />}
        {activeTab === "Analyse IA" && <InstagramAIAnalyzer
  saveAiAnalysis={saveAiAnalysis}
  createProspectFromAnalysis={createProspectFromAnalysis}
/>}
        {activeTab === "Historique IA" && <AIHistory analyses={aiAnalyses} updateAiAnalysis={updateAiAnalysis} deleteAiAnalysis={deleteAiAnalysis} createProspectFromAnalysis={createProspectFromAnalysis} />}
        {activeTab === "Avatars" && <Avatars />}
        {activeTab === "Generateurs" && <Generators />}
        {activeTab === "Assistant IA" && <ChatGPTAssistant />}
        {activeTab === "Scripts" && <ScriptsLibrary />}
        {activeTab === "Relances" && <FollowUps prospects={normalizedProspects} tasks={tasks} updateProspect={updateProspect} />}
        {activeTab === "Mon compte" && <AccountPage user={session.user} />}
      </main>
      <div className="fixed bottom-2 right-3 z-50 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink/55 shadow-soft backdrop-blur">
        Version : {APP_VERSION}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
      <p className="text-xs text-white/65">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FullPageStatus({ label }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 text-ink">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="font-display text-4xl">Prospection OS</h1>
        <p className="mt-3 text-sm text-ink/60">{label}</p>
      </Card>
    </div>
  );
}

function SupabaseSetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 text-ink">
      <Card className="w-full max-w-2xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-ocean">Configuration requise</p>
        <h1 className="mt-2 font-display text-4xl">Prospection OS</h1>
        <p className="mt-4 text-sm text-ink/65">
          Ajoutez les variables Vite `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans votre fichier `.env.local` ou dans Vercel pour activer la connexion equipe.
        </p>
      </Card>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    let result;
    if (mode === "signup") {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
    } else if (mode === "reset") {
      result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    const { error } = result;
    if (error) setMessage(error.message);
    if (!error && mode === "signup") setMessage("Compte cree. Verifiez votre email si la confirmation est activee.");
    if (!error && mode === "reset") setMessage("Lien de recuperation envoye si cet email existe.");
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen bg-ivory text-ink lg:grid-cols-[1fr_460px]">
      <div className="flex items-center bg-ink px-6 py-12 text-white lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.18em] text-champagne">CRM multi-utilisateurs</p>
          <h1 className="mt-3 font-display text-5xl leading-tight lg:text-7xl">Prospection OS</h1>
          <p className="mt-5 max-w-xl text-white/70">
            Chaque membre de l'equipe dispose de son propre espace : prospects, notes, relances, historique et objectifs restent separes.
          </p>
        </div>
      </div>
      <div className="flex items-center px-4 py-10 sm:px-8">
        <Card className="w-full p-6">
          <h2 className="text-2xl font-semibold">{mode === "login" ? "Connexion" : mode === "signup" ? "Inscription" : "Recuperation"}</h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            {mode !== "reset" && <Field label="Mot de passe"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" /></Field>}
            {message && <p className="rounded-lg bg-ivory p-3 text-sm text-ink/70">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Patientez..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Creer mon compte" : "Envoyer le lien"}</Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-ocean">
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Creer un compte" : "J'ai deja un compte"}
            </button>
            <button onClick={() => setMode("reset")}>Mot de passe oublie</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AccountPage({ user }) {
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Mon compte</h2>
        <div className="mt-4 space-y-3 text-sm">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> user</p>
          <p><strong>Espace:</strong> donnees personnelles uniquement</p>
        </div>
        <Button className="mt-5" onClick={signOut}>Deconnexion</Button>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Confidentialite equipe</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          Les prospects, objectifs, relances, historiques et statistiques sont attaches a votre `user_id`. Les tables sont aussi preparees avec `team_id` et un role pour un futur mode manager.
        </p>
      </Card>
    </div>
  );
}

function useSupabaseCrm(user) {
  const [prospects, setProspects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiAnalyses, setAiAnalyses] = useState([]);
  const [daily, setDailyState] = useState(defaultDaily);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleError = (err) => {
    if (err) setError(err.message || "Une erreur Supabase est survenue.");
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      role: "user",
      daily_date: todayISO(),
      updated_at: nowISO()
    });

    const [
      { data: prospectRows, error: prospectsError },
      { data: historyRows, error: historyError },
      { data: noteRows, error: notesError },
      { data: taskRows, error: tasksError },
      { data: aiRows, error: aiError },
{ data: dailyStatsRows, error: dailyStatsError },
      { data: profileRow, error: profileError }
    ] = await Promise.all([
      supabase.from("prospects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
      supabase.from("ai_analyses").select("*").eq("user_id", user.id).order("analysis_date", { ascending: false }),
supabase.from("daily_stats").select("*").eq("user_id", user.id).order("stat_date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    ]);

   handleError(prospectsError || historyError || notesError || tasksError || aiError || dailyStatsError || profileError);

    const historiesByProspect = (historyRows || []).reduce((acc, item) => {
      acc[item.prospect_id] = acc[item.prospect_id] || [];
      acc[item.prospect_id].push(fromDbHistory(item));
      return acc;
    }, {});

    const latestNotes = (noteRows || []).reduce((acc, note) => {
      if (!acc[note.prospect_id]) acc[note.prospect_id] = note.body || "";
      return acc;
    }, {});

    setProspects((prospectRows || []).map((row) => fromDbProspect({ ...row, notes: latestNotes[row.id] || row.notes }, historiesByProspect[row.id] || [])));
    setTasks(taskRows || []);
    setAiAnalyses((aiRows || []).map(fromDbAiAnalysis));
    const today = todayISO();
const todayDailyStats = (dailyStatsRows || []).find((row) => row.stat_date === today);
setDailyState(todayDailyStats ? fromDbDaily(todayDailyStats) : { ...defaultDaily, date: today });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const setDaily = async (next) => {
    const resolved = typeof next === "function" ? next(daily) : next;
    setDailyState(resolved);
    const { error: upsertError } = await supabase.from("daily_stats").upsert({
  user_id: user.id,
  stat_date: resolved.date || todayISO(),
  messages_sent: Number(resolved.messagesSent || 0),
  follow_ups_done: Number(resolved.followUpsDone || 0),
  calls_booked: Number(resolved.callsBooked || 0),
  score: Number(resolved.messagesSent || 0) + Number(resolved.followUpsDone || 0) * 2 + Number(resolved.callsBooked || 0) * 5,
  updated_at: nowISO()
}, { onConflict: "user_id,stat_date" });
    handleError(upsertError);
  };

  const addProspect = async (form) => {
    const payload = normalizeProspect({ ...form, tags: form.tags.trim() });
    const { data, error: insertError } = await supabase.from("prospects").insert(toDbProspect(payload, user)).select().single();
    if (insertError) {
      handleError(insertError);
      return null;
    }

    const history = historyItem("Creation fiche", "Prospect ajoute au CRM");
    await supabase.from("history").insert(toDbHistory(history, data.id, user));
    if (payload.notes) await supabase.from("notes").insert(toDbNote(payload.notes, data.id, user));
    if (payload.nextFollowUp) await createTask(data.id, user, payload.nextFollowUp, "Premiere relance");

    const created = fromDbProspect(data, [history]);
    setProspects((items) => [created, ...items]);
    return created;
  };

  const updateProspect = async (id, patch, label = "Mise a jour") => {
    const current = prospects.find((item) => item.id === id);
    if (!current) return;
    const automaticFollowUp = getAutomaticFollowUp(current, patch);
    console.log("[Prospection OS] updateProspect diagnostic", {
      patch,
      currentStatus: current.status,
      patchStatus: patch.status,
      currentRimanStage: current.rimanStage,
      patchRimanStage: patch.rimanStage,
      automaticFollowUp
    });
    const enrichedPatch = enrichPatch(current, patch, automaticFollowUp);
    const next = normalizeProspect({ ...current, ...enrichedPatch });
    if (automaticFollowUp && !Object.prototype.hasOwnProperty.call(patch, "nextFollowUp")) {
      next.nextFollowUp = automaticFollowUp.dueDate;
    }
    const entries = buildHistory(current, next, label, { skipNextFollowUp: Boolean(automaticFollowUp) });
    if (label === "Relance effectuee") {
      entries.unshift(historyItem("Relance effectuee", "Relance marquee comme effectuee"));
    }

    setProspects((items) => items.map((item) => (item.id === id ? { ...next, history: [...entries, ...item.history].slice(0, 80) } : item)));

    const { error: updateError } = await supabase.from("prospects").update(toDbProspect(next, user)).eq("id", id).eq("user_id", user.id);
    handleError(updateError);

    if (!updateError && entries.length) {
      await supabase.from("history").insert(entries.map((entry) => toDbHistory(entry, id, user)));
    }

    if (!updateError && Object.prototype.hasOwnProperty.call(enrichedPatch, "notes")) {
      await supabase.from("notes").insert(toDbNote(next.notes, id, user));
    }

    if (!updateError && automaticFollowUp) {
      console.log("[Prospection OS] PATH = AUTOMATIC_FOLLOWUP", { automaticFollowUp });
      await createAutomaticFollowUp(id, automaticFollowUp);
    } else if (!updateError && enrichedPatch.nextFollowUp && Object.prototype.hasOwnProperty.call(patch, "nextFollowUp") && !isStatusOrPipelinePatch(patch)) {
      console.log("[Prospection OS] PATH = MANUAL_FOLLOWUP", { patch, enrichedPatch });
      await createTask(id, user, enrichedPatch.nextFollowUp, label);
    } else {
      console.log("[Prospection OS] PATH = NO_FOLLOWUP", { updateError, automaticFollowUp, patch, enrichedPatch });
    }
  };

  const removeProspect = async (id) => {
    setProspects((items) => items.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("prospects").delete().eq("id", id).eq("user_id", user.id);
    handleError(deleteError);
  };

  const createTask = async (prospectId, currentUser, dueDate, label) => {
    const taskPayload = {
      user_id: currentUser.id,
      team_id: null,
      prospect_id: prospectId,
      due_date: dueDate,
      title: label,
      status: "pending"
    };
    const { data: task, error: taskError } = await supabase.from("tasks").insert(taskPayload).select().single();
    if (taskError) {
      console.error("[Prospection OS] Erreur creation task Supabase", {
        error: taskError,
        payload: taskPayload
      });
    }
    handleError(taskError);
    if (!taskError && task) setTasks((items) => [...items, task].sort((a, b) => String(a.due_date).localeCompare(String(b.due_date))));
    return taskError ? null : task;
  };

  const createAutomaticFollowUp = async (prospectId, automaticFollowUp) => {
    const task = await createTask(prospectId, user, automaticFollowUp.dueDate, automaticFollowUp.title);
    if (!task) return null;
    const automaticHistory = historyItem("Relance automatique", automaticFollowUp.detail);
    const { data: historyRow, error: historyError } = await supabase.from("history").insert(toDbHistory(automaticHistory, prospectId, user)).select().single();
    if (historyError) {
      console.error("[Prospection OS] Erreur creation history relance automatique", { error: historyError, prospectId, automaticFollowUp });
      handleError(historyError);
      return task;
    }
    const historyEntry = historyRow ? fromDbHistory(historyRow) : automaticHistory;
    setProspects((items) => items.map((item) => (item.id === prospectId ? { ...item, history: [historyEntry, ...item.history].slice(0, 80) } : item)));
    return task;
  };

  const uploadAnalysisImage = async (file, type) => {
    if (!file) return "";
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const path = `${user.id}/${crypto.randomUUID()}-${type}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("ai-analyses").upload(path, file, { upsert: false });
    if (uploadError) {
      handleError(uploadError);
      return "";
    }
    const { data } = supabase.storage.from("ai-analyses").getPublicUrl(path);
    return data.publicUrl || "";
  };

  const saveAiAnalysis = async (form, files) => {
    const [profileImageUrl, postImageUrl] = await Promise.all([
      uploadAnalysisImage(files.profileCapture, "profile"),
      uploadAnalysisImage(files.postCapture, "post")
    ]);
    const payload = toDbAiAnalysis({ ...form, profileImageUrl, postImageUrl }, user);
    const { data, error: insertError } = await supabase.from("ai_analyses").insert(payload).select().single();
    handleError(insertError);
    if (!insertError && data) setAiAnalyses((items) => [fromDbAiAnalysis(data), ...items]);
    return insertError ? null : fromDbAiAnalysis(data);
  };

  const updateAiAnalysis = async (id, patch) => {
    const current = aiAnalyses.find((item) => item.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    setAiAnalyses((items) => items.map((item) => (item.id === id ? next : item)));
    const { error: updateError } = await supabase.from("ai_analyses").update(toDbAiAnalysis(next, user)).eq("id", id).eq("user_id", user.id);
    handleError(updateError);
  };

  const deleteAiAnalysis = async (id) => {
    setAiAnalyses((items) => items.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("ai_analyses").delete().eq("id", id).eq("user_id", user.id);
    handleError(deleteError);
  };

  const convertAiAnalysisToProspect = async (analysis, form) => {
    const hasSavedAnalysis = Boolean(analysis?.id);
    const payload = normalizeProspect({ ...form, tags: form.tags.trim() });
    const { data, error: insertError } = await supabase.from("prospects").insert(toDbProspect(payload, user)).select().single();
    if (insertError) {
      handleError(insertError);
      return null;
    }
if (hasSavedAnalysis) {
    const { error: updateError } = await supabase
      .from("ai_analyses")
      .update({ prospect_id: data.id, converted_to_crm: true, updated_at: nowISO() })
      .eq("id", analysis.id)
      .eq("user_id", user.id);

    if (updateError) {
      handleError(updateError);
      return null;
    }
}

    const creationHistory = historyItem("Creation fiche", "Prospect ajoute au CRM depuis une analyse IA");
    const conversionHistory = historyItem("Analyse IA convertie", "Analyse Instagram convertie en prospect CRM");
    const historyEntries = [creationHistory, conversionHistory];
    const { error: historyError } = await supabase.from("history").insert(historyEntries.map((entry) => toDbHistory(entry, data.id, user)));
    handleError(historyError);
    if (payload.notes) await supabase.from("notes").insert(toDbNote(payload.notes, data.id, user));
    if (payload.nextFollowUp) await createTask(data.id, user, payload.nextFollowUp, "Premiere relance");

    const created = fromDbProspect(data, historyEntries);
    setProspects((items) => [created, ...items]);
    setAiAnalyses((items) => items.map((item) => (item.id === analysis.id ? { ...item, prospectId: data.id, convertedToCrm: true } : item)));
    return created;
  };

  return { prospects, tasks, aiAnalyses, daily, loading, error, setDaily, addProspect, updateProspect, removeProspect, saveAiAnalysis, updateAiAnalysis, deleteAiAnalysis, convertAiAnalysisToProspect };
}

function Dashboard({ daily, setDaily, stats, prospects, updateProspect, onOpenCrm }) {
  const due = prospects.filter((p) => isDue(p)).slice(0, 6);
  const followUpGroups = getDashboardFollowUps(prospects);
  const markFollowUpDone = (prospect) => {
    const patch = { nextFollowUp: calculateNextFollowUp(prospect, { afterDone: true }).dueDate };
    if (prospect.status === "A contacter") patch.status = "Contacte";
    updateProspect(prospect.id, patch, "Relance effectuee");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Target} label="Prospects a contacter" value={stats.toContact} />
        <Metric icon={MessageCircle} label="Messages envoyes" value={daily.messagesSent} />
        <Metric icon={CalendarClock} label="Relances a faire" value={stats.followUps} />
        <Metric icon={Video} label="Calls proposes" value={stats.callsProposed} />
        <Metric icon={BarChart3} label="Score prospection" value={stats.score} />
      </div>

      <DashboardFollowUpBlock
        title="Actions prioritaires du jour"
        icon={Flame}
        prospects={followUpGroups.priority}
        empty="Aucune action prioritaire aujourd'hui."
        onDone={markFollowUpDone}
        onOpenCrm={onOpenCrm}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardFollowUpBlock
          title="Relances en retard"
          icon={AlertCircle}
          prospects={followUpGroups.overdue}
          empty="Aucune relance en retard."
          onDone={markFollowUpDone}
          onOpenCrm={onOpenCrm}
        />
        <DashboardFollowUpBlock
          title="Relances aujourd'hui"
          icon={CalendarClock}
          prospects={followUpGroups.today}
          empty="Aucune relance prevue aujourd'hui."
          onDone={markFollowUpDone}
          onOpenCrm={onOpenCrm}
        />
        <DashboardFollowUpBlock
          title="Relances demain"
          icon={Clock3}
          prospects={followUpGroups.tomorrow}
          empty="Aucune relance prevue demain."
          onDone={markFollowUpDone}
          onOpenCrm={onOpenCrm}
        />
        <DashboardFollowUpBlock
          title="Relances a venir"
          icon={CalendarClock}
          prospects={followUpGroups.upcoming}
          empty="Aucune relance a venir."
          onDone={markFollowUpDone}
          onOpenCrm={onOpenCrm}
          showDoneAction={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Objectifs et activite du jour</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_240px]">
            <Textarea value={daily.objectives} onChange={(e) => setDaily({ ...daily, objectives: e.target.value })} />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
              <Counter label="Messages" value={daily.messagesSent} onChange={(v) => setDaily({ ...daily, messagesSent: v })} />
              <Counter label="Relances" value={daily.followUpsDone} onChange={(v) => setDaily({ ...daily, followUpsDone: v })} />
              <Counter label="Calls" value={daily.callsBooked} onChange={(v) => setDaily({ ...daily, callsBooked: v })} />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Relances automatiques</h2>
            <Flame className="text-ocean" size={22} />
          </div>
          <div className="mt-4 space-y-3">
            {due.length === 0 && <p className="text-sm text-ink/60">Aucune relance urgente aujourd'hui.</p>}
            {due.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-ivory p-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-ink/55">{p.status} · {formatDate(p.nextFollowUp)}</p>
                </div>
                <Button variant="secondary" className="px-3" onClick={() => markFollowUpDone(p)}>
                  <Check size={16} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardFollowUpBlock({ title, icon: Icon, prospects, empty, onDone, onOpenCrm, showDoneAction = true }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Icon className="text-ocean" size={22} />
      </div>
      <div className="mt-4 space-y-3">
        {prospects.length === 0 && <p className="text-sm text-ink/60">{empty}</p>}
        {prospects.map((prospect) => (
          <DashboardFollowUpCard key={prospect.id} prospect={prospect} onDone={onDone} onOpenCrm={onOpenCrm} showDoneAction={showDoneAction} />
        ))}
      </div>
    </Card>
  );
}

function DashboardFollowUpCard({ prospect, onDone, onOpenCrm, showDoneAction = true }) {
  const lateDays = getLateDays(prospect.nextFollowUp);
  const lastActivity = getLastProspectActivity(prospect);
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{prospect.name}</p>
          <p className="mt-1 text-xs text-ink/55">{prospect.status} · {prospect.rimanStage}</p>
          <p className="mt-2 text-sm text-ink/70">Derniere activite : {formatDate(lastActivity)}</p>
          <p className="mt-2 text-sm text-ink/70">Relance : {formatDate(prospect.nextFollowUp)}</p>
          {lateDays > 0 && <p className="mt-1 text-xs font-semibold text-red-700">En retard de {lateDays} jour{lateDays > 1 ? "s" : ""}</p>}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {showDoneAction && (
            <Button variant="secondary" className="px-3" onClick={() => onDone(prospect)}>
              <Check size={16} /> Relance faite
            </Button>
          )}
          <Button variant="ghost" className="px-3" onClick={() => onOpenCrm(prospect.id)}>
            Voir prospect <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="relative overflow-hidden p-5 border border-ocean/10 bg-gradient-to-br from-white via-mist to-ivory shadow-soft">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-ocean/10" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-champagne/15" />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">{label}</p>
        <div className="rounded-full bg-ocean/10 p-2">
          <Icon size={20} className="text-ocean" />
        </div>
      </div>

      <p className="relative mt-4 text-4xl font-semibold tracking-tight text-ink">{value}</p>
    </Card>
  );
}
function Counter({ label, value, onChange }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-3">
      <p className="text-xs font-semibold text-ink/55">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button className="h-8 w-8 rounded-lg bg-mist font-bold" onClick={() => onChange(Math.max(0, Number(value) - 1))}>-</button>
        <span className="text-xl font-semibold">{value}</span>
        <button className="h-8 w-8 rounded-lg bg-ocean font-bold text-white" onClick={() => onChange(Number(value) + 1)}>+</button>
      </div>
    </div>
  );
}

function CRM({ prospects, selectedProspectId, form, setForm, addProspect, updateProspect, removeProspect }) {
  const [filters, setFilters] = useState({
    query: "",
    status: "Tous",
    replyStatus: "Tous",
    avatarId: "Tous",
    score: "Tous",
    rimanStage: "Tous",
    city: "",
    dueOnly: false
  });

  const filtered = useMemo(() => filterProspects(prospects, filters), [prospects, filters]);
  const displayedProspects = useMemo(() => {
    if (!selectedProspectId) return filtered;
    const selected = prospects.find((prospect) => prospect.id === selectedProspectId);
    if (!selected) return filtered;
    return [selected, ...filtered.filter((prospect) => prospect.id !== selectedProspectId)];
  }, [prospects, filtered, selectedProspectId]);

  useEffect(() => {
    if (!selectedProspectId) return;
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [selectedProspectId, displayedProspects]);

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Fiche prospect complete</h2>
        <form onSubmit={addProspect} className="mt-4 space-y-3">
          <Field label="Nom"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telephone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          </div>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Profession"><Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></Field>
          </div>
          <Field label="Recommande par"><Input value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reseau"><Input value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} /></Field>
            <Field label="Score"><Select value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })}>{scoreLabels.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          </div>
          <Field label="Lien profil"><Input value={form.profileUrl} onChange={(e) => setForm({ ...form, profileUrl: e.target.value })} /></Field>
          <Field label="Avatar"><Select value={form.avatarId} onChange={(e) => setForm({ ...form, avatarId: e.target.value })}>{avatars.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Statut"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="RIMAN"><Select value={form.rimanStage} onChange={(e) => setForm({ ...form, rimanStage: e.target.value })}>{rimanStages.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Premier contact"><Input type="date" value={form.firstContact} onChange={(e) => setForm({ ...form, firstContact: e.target.value })} /></Field>
            <Field label="Prochaine relance"><Input type="date" value={form.nextFollowUp} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Field label="Tags"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="premium, local, chaud" /></Field>
          <Button type="submit" className="w-full"><Plus size={16} /> Ajouter au CRM</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <CRMFilters filters={filters} setFilters={setFilters} count={displayedProspects.length} />
        {displayedProspects.map((p) => (
          <ProspectCard key={p.id} prospect={p} updateProspect={updateProspect} removeProspect={removeProspect} isSelected={p.id === selectedProspectId} />
        ))}
        {displayedProspects.length === 0 && <Card className="p-6 text-sm text-ink/60">Aucun prospect ne correspond aux filtres.</Card>}
      </div>
    </div>
  );
}

function CRMFilters({ filters, setFilters, count }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Search size={18} className="text-ocean" />
        <Input
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          placeholder="Rechercher nom, ville, email, tag, note..."
        />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-6">
        <Field label="Statut"><Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option>Tous</option>{statuses.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Reponse"><Select value={filters.replyStatus} onChange={(e) => setFilters({ ...filters, replyStatus: e.target.value })}><option>Tous</option><option>Silencieux</option><option>Repondu</option></Select></Field>
        <Field label="Avatar"><Select value={filters.avatarId} onChange={(e) => setFilters({ ...filters, avatarId: e.target.value })}><option>Tous</option>{avatars.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field>
        <Field label="Score"><Select value={filters.score} onChange={(e) => setFilters({ ...filters, score: e.target.value })}><option>Tous</option>{scoreLabels.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="RIMAN"><Select value={filters.rimanStage} onChange={(e) => setFilters({ ...filters, rimanStage: e.target.value })}><option>Tous</option>{rimanStages.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Ville"><Input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.dueOnly} onChange={(e) => setFilters({ ...filters, dueOnly: e.target.checked })} /> Relances dues uniquement</label>
        <span className="text-sm font-semibold text-ink/60">{count} resultat(s)</span>
      </div>
    </Card>
  );
}

function ProspectCard({ prospect, updateProspect, removeProspect, isSelected = false }) {
  const [open, setOpen] = useState(false);
  const scoreStyle = {
    Chaud: "bg-ocean text-white",
    Tiede: "bg-linen text-ink",
    Froid: "bg-mist text-ink"
  }[prospect.score];

  return (
    <Card id={`prospect-${prospect.id}`} data-prospect-id={prospect.id} className={`p-4 transition ${isSelected ? "ring-2 ring-ocean" : ""}`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{prospect.name}</h3>
            <span className="rounded-full bg-ink px-2 py-1 text-xs text-white">{prospect.status}</span>
            <span className={`rounded-full px-2 py-1 text-xs ${scoreStyle}`}>{prospect.score}</span>
            <span className="rounded-full border border-black/10 px-2 py-1 text-xs">{prospect.rimanStage}</span>
            <span className={`rounded-full px-2 py-1 text-xs ${hasProspectAnswered(prospect) ? "bg-ocean/10 text-ocean" : "bg-linen text-ink"}`}>
              {hasProspectAnswered(prospect) ? "Actif" : "Silencieux"}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/60">{prospect.network} · {findAvatar(prospect.avatarId).name}</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
            <ContactLine icon={Phone} text={prospect.phone || "Telephone manquant"} />
            <ContactLine icon={MessageCircle} text={prospect.whatsapp || "WhatsApp manquant"} />
            <ContactLine icon={Mail} text={prospect.email || "Email manquant"} />
            <p><strong>Ville:</strong> {prospect.city || "-"}</p>
            <p><strong>Profession:</strong> {prospect.profession || "-"}</p>
            <p><strong>Recommande par:</strong> {prospect.referredBy || "-"}</p>
          </div>
          <p className="mt-3 text-sm">{prospect.notes || "Aucune note."}</p>
          <div className="mt-3 flex flex-wrap gap-2">{splitTags(prospect.tags).map((tag) => <span key={tag} className="rounded-full border border-black/10 px-2 py-1 text-xs">{tag}</span>)}</div>
        </div>
        <div className="space-y-2">
          <Select value={prospect.status} onChange={(e) => updateProspect(prospect.id, { status: e.target.value }, "Changement de statut")}>{statuses.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={prospect.score} onChange={(e) => updateProspect(prospect.id, { score: e.target.value }, "Scoring mis a jour")}>{scoreLabels.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={prospect.rimanStage} onChange={(e) => updateProspect(prospect.id, { rimanStage: e.target.value }, "Pipeline RIMAN")}>{rimanStages.map((s) => <option key={s}>{s}</option>)}</Select>
          <Input type="date" value={prospect.nextFollowUp} onChange={(e) => updateProspect(prospect.id, { nextFollowUp: e.target.value }, "Relance planifiee")} />
          <div className="grid grid-cols-2 gap-2">
            <a className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold" href={prospect.profileUrl || "#"} target="_blank" rel="noreferrer">Profil</a>
            <Button variant="secondary" onClick={() => setOpen(!open)}>Historique</Button>
          </div>
          <Button variant="secondary" className="w-full" onClick={() => removeProspect(prospect.id)}>Retirer</Button>
        </div>
      </div>
      {open && <HistoryTimeline history={prospect.history} />}
    </Card>
  );
}

function ContactLine({ icon: Icon, text }) {
  return <p className="flex items-center gap-2"><Icon size={15} className="text-ocean" />{text}</p>;
}

function HistoryTimeline({ history }) {
  const sortedHistory = [...history].sort((a, b) => new Date(b.at) - new Date(a.at));
  return (
    <div className="mt-5 border-t border-black/10 pt-4">
      <h4 className="text-sm font-semibold">Historique chronologique</h4>
      <div className="mt-3 space-y-3">
        {sortedHistory.length === 0 && <p className="text-sm text-ink/60">Aucune action enregistree.</p>}
        {sortedHistory.map((item) => (
          <div key={item.id} className="rounded-lg bg-ivory p-3 text-sm">
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-ink/65">{item.detail}</p>
            <p className="mt-1 text-xs text-ink/45">{formatDateTime(item.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstagramPipeline({ prospects, updateProspect }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-[1680px] grid-cols-9 gap-3">
        {instagramStages.map((stage) => {
          const items = prospects.filter((p) => p.instagramStage === stage);
          return (
            <div key={stage} className="rounded-lg border border-black/10 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="min-h-10 text-sm font-semibold">{stage}</h2>
                <span className="rounded-full bg-ivory px-2 py-1 text-xs">{items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="rounded-lg bg-ivory p-3 text-sm">
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-ink/55">{p.network || "Reseau non renseigne"} · {p.score || "Score non renseigne"}</p>
                    <Select className="mt-2" value={p.instagramStage} onChange={(e) => updateProspect(p.id, { instagramStage: e.target.value }, "Pipeline CRM Instagram")}>
                      {instagramStages.map((item) => <option key={item}>{item}</option>)}
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RimanPipeline({ prospects, updateProspect }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-[1120px] grid-cols-6 gap-3">
        {rimanStages.map((stage) => {
          const items = prospects.filter((p) => p.rimanStage === stage);
          return (
            <div key={stage} className="rounded-lg border border-black/10 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="min-h-10 text-sm font-semibold">{stage}</h2>
                <span className="rounded-full bg-ivory px-2 py-1 text-xs">{items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="rounded-lg bg-ivory p-3 text-sm">
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-ink/55">{p.score} · {p.status}</p>
                    <Select className="mt-2" value={p.rimanStage} onChange={(e) => updateProspect(p.id, { rimanStage: e.target.value }, "Pipeline RIMAN")}>{rimanStages.map((s) => <option key={s}>{s}</option>)}</Select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsView({ stats, prospects }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={UsersRound} label="Prospects total" value={prospects.length} />
        <Metric icon={Flame} label="Prospects chauds" value={stats.hot} />
        <Metric icon={Check} label="Clients" value={stats.clients} />
        <Metric icon={BarChart3} label="Conversion client" value={`${stats.customerRate}%`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Brain} label="Analyses IA" value={stats.aiCount} />
        <Metric icon={BarChart3} label="Score IA moyen" value={stats.aiAverageScore} />
        <Metric icon={Flame} label="Haute priorite IA" value={stats.aiHighPriority} />
        <Metric icon={Check} label="Convertis en CRM" value={stats.aiConvertedToCrm} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Metric icon={MessageCircle} label="Prospects actifs" value={stats.activeProspects} />
        <Metric icon={Clock3} label="Prospects silencieux" value={stats.silentProspects} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Conversion par statut</h2>
          <StatsBars rows={statuses.map((s) => [s, prospects.filter((p) => p.status === s).length])} total={prospects.length} />
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Pipeline RIMAN</h2>
          <StatsBars rows={rimanStages.map((s) => [s, prospects.filter((p) => p.rimanStage === s).length])} total={prospects.length} />
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-ink/55">Taux rituel propose</p><p className="mt-2 text-3xl font-semibold">{stats.ritualRate}%</p></Card>
        <Card className="p-5"><p className="text-sm text-ink/55">Taux commande</p><p className="mt-2 text-3xl font-semibold">{stats.orderRate}%</p></Card>
        <Card className="p-5"><p className="text-sm text-ink/55">Taux partenaire</p><p className="mt-2 text-3xl font-semibold">{stats.partnerRate}%</p></Card>
      </div>
    </div>
  );
}

function StatsBars({ rows, total }) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map(([label, count]) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={label}>
            <div className="flex justify-between gap-3 text-sm"><span>{label}</span><span className="font-semibold">{count}</span></div>
            <div className="mt-1 h-2 rounded-full bg-ivory"><div className="h-2 rounded-full bg-ocean" style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function InstagramAIAnalyzer({
  saveAiAnalysis,
  createProspectFromAnalysis
}) {
  const [profileCapture, setProfileCapture] = useState(null);
  const [postCapture, setPostCapture] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [analysisForm, setAnalysisForm] = useState(emptyAiAnalysisForm());

  const copyPrompt = async () => {
    await navigator.clipboard?.writeText(instagramProspectionMasterPrompt);
    setNotice("Prompt copie.\n\nDepose maintenant :\n- la capture du profil\n- la capture du post\n\ndans ChatGPT puis colle le prompt.");
  };

  const openChatGPT = () => {
    window.open("https://chatgpt.com", "_blank", "noopener,noreferrer");
  };

  const analyzeInChatGPT = async () => {
    await copyPrompt();
    openChatGPT();
  };

  const handleSaveAnalysis = async () => {
    if (!analysisForm.prospectName.trim() && !analysisForm.instagramHandle.trim()) {
      setNotice("Ajoute au moins un nom prospect ou un pseudo Instagram avant d'enregistrer.");
      return;
    }
    setSaving(true);
    const ok = await saveAiAnalysis(analysisForm, { profileCapture, postCapture });
    setSaving(false);
    if (ok) {
      setNotice("Analyse enregistree dans l'Historique IA.");
      setAnalysisForm(emptyAiAnalysisForm());
      setProfileCapture(null);
      setPostCapture(null);
    }
  };
  const handleSaveAnalysisAndCreateProspect = async () => {
    if (!analysisForm.prospectName.trim() && !analysisForm.instagramHandle.trim()) {
      setNotice("Ajoute au moins un nom prospect ou un pseudo Instagram avant d'ajouter au CRM.");
      return;
    }

    setSaving(true);
    const savedAnalysis = await saveAiAnalysis(analysisForm, { profileCapture, postCapture });
    setSaving(false);

    if (!savedAnalysis) {
      setNotice("L'analyse n'a pas pu etre enregistree. Le prospect CRM n'a pas ete cree.");
      return;
    }

    await createProspectFromAnalysis({ ...analysisForm, id: savedAnalysis.id });

    setNotice("Analyse enregistree dans l'Historique IA et prospect ajoute au CRM.");
    setAnalysisForm(emptyAiAnalysisForm());
    setProfileCapture(null);
    setPostCapture(null);
  };
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean">Prospection Instagram</p>
            <h2 className="mt-1 text-2xl font-semibold">Analyse IA</h2>
            <p className="mt-2 max-w-3xl text-sm text-ink/60">
              Charge les captures, copie le prompt maitre et ouvre ChatGPT pour obtenir l'analyse du profil, le score, le commentaire public, le message prive et la strategie d'approche.
            </p>
          </div>
          <Button onClick={analyzeInChatGPT}><Brain size={16} /> Analyser dans ChatGPT</Button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <UploadCapture title="Capture du profil" file={profileCapture} onChange={setProfileCapture} />
          <UploadCapture title="Capture du post" file={postCapture} onChange={setPostCapture} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={copyPrompt}><Copy size={16} /> Copier uniquement le prompt</Button>
          <Button variant="secondary" onClick={openChatGPT}><Sparkles size={16} /> Ouvrir ChatGPT</Button>
        </div>
        {notice && <div className="mt-5 whitespace-pre-line rounded-lg bg-mist p-4 text-sm font-semibold text-ocean">{notice}</div>}
      </Card>

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-semibold">Enregistrer l'analyse</h2>
            <p className="mt-2 text-sm text-ink/60">Apres avoir recupere l'analyse dans ChatGPT, colle les elements ici pour les conserver et les reutiliser.</p>
          </div>
         <div className="flex flex-wrap gap-2">
  
  <Button
    variant="secondary"
   onClick={() => handleSaveAnalysisAndCreateProspect()}
    disabled={saving || (!analysisForm.prospectName.trim() && !analysisForm.instagramHandle.trim())}
  >
   Enregistrer le prospect
  </Button>
</div>
        </div>
        <AIAnalysisForm form={analysisForm} setForm={setAnalysisForm} />
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-semibold">Aide</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/70">
          <li>Charger les captures.</li>
          <li>Cliquer sur Analyser dans ChatGPT.</li>
          <li>Les captures restent disponibles localement.</li>
          <li>Deposer les captures dans ChatGPT.</li>
          <li>Coller le prompt.</li>
          <li>Recuperer l'analyse du profil, le score, le commentaire public, le message prive et la strategie d'approche.</li>
        </ol>
      </Card>
    </div>
  );
}

function UploadCapture({ title, file, onChange }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="rounded-lg border border-black/10 bg-ivory p-4">
      <p className="text-sm font-semibold">{title}</p>
      <input
        className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      {file && (
        <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-white">
          <img className="max-h-64 w-full object-contain" src={previewUrl} alt={title} />
          <p className="border-t border-black/10 px-3 py-2 text-xs text-ink/55">{file.name}</p>
        </div>
      )}
    </div>
  );
}

function AIAnalysisForm({ form, setForm }) {
  const [rawAnalysis, setRawAnalysis] = useState("");

  const extractBetween = (text, labels) => {
    const pattern = labels.join("|");
    const regex = new RegExp(`(?:${pattern})\\s*[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:Nom|Pseudo|Ville|Score|Priorité|Priorite|Commentaire public|Message privé|Message prive|Stratégie|Strategie|Notes)\\s*[:\\-]|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

 const autofillFromAnalysis = () => {
  const text = rawAnalysis.trim();
  if (!text) return;

 const extractField = (labels) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  const labelPattern = labelList
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const stopPattern =
    "NOM|PSEUDO|VILLE|SCORE|PRIORITE|PRIORITÉ|COMMENTAIRE_PUBLIC|COMMENTAIRE PUBLIC|MESSAGE_PRIVE|MESSAGE_PRIVÉ|MESSAGE PRIVE|MESSAGE PRIVÉ|STRATEGIE|STRATÉGIE|NOTE_CRM|NOTES|NOTES PERSONNELLES|VERSION COURTE|OBJECTIONS|PROCHAINE ETAPE|PROCHAINE ÉTAPE";

  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:${labelPattern})\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:${stopPattern})\\s*:?|$)`,
    "i"
  );

  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const scoreMatch = text.match(/SCORE\s*:?\s*(\d{1,2})/i);
const priorityMatch = text.match(/PRIORIT[ÉE]\s*:?\s*(Haute|Moyenne|Faible)/i);

alert("Score trouvé : " + (scoreMatch ? scoreMatch[1] : "RIEN"));
alert("Priorité trouvée : " + (priorityMatch ? priorityMatch[1] : "RIEN"));

const scoreValue = scoreMatch ? scoreMatch[1] : form.score;
const priorityValue = priorityMatch ? priorityMatch[1] : form.priority;
  setForm({
    ...form,
    prospectName: extractField(["NOM", "Nom", "Nom prospect"]) || form.prospectName,
    instagramHandle: extractField(["PSEUDO", "Pseudo", "Pseudo Instagram", "Profil Instagram"]) || form.instagramHandle,
    city: extractField(["VILLE", "Ville"]) || form.city,
    score: scoreValue || form.score,
    priority: priorityValue,
    publicComment: extractField(["COMMENTAIRE_PUBLIC", "Commentaire public"]) || form.publicComment,
    privateMessage: extractField(["MESSAGE_PRIVE", "MESSAGE_PRIVÉ", "Message privé", "Message prive"]) || form.privateMessage,
    strategy: extractField(["STRATEGIE", "STRATÉGIE", "Strategie", "Stratégie"]) || form.strategy,
    personalNotes: extractField(["NOTE_CRM", "NOTES", "Notes", "Notes CRM", "Notes personnelles"]) || form.personalNotes,
  });
};

  return (
    <div className="mt-5 space-y-4">
      <Field label="Coller l'analyse complète ChatGPT">
        <Textarea
          value={rawAnalysis}
          onChange={(e) => setRawAnalysis(e.target.value)}
          placeholder="Colle ici toute la réponse ChatGPT, puis clique sur Remplir automatiquement."
        />
      </Field>

      <Button type="button" onClick={autofillFromAnalysis}>
        Remplir automatiquement
      </Button>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nom prospect"><Input value={form.prospectName} onChange={(e) => setForm({ ...form, prospectName: e.target.value })} /></Field>
        <Field label="Pseudo Instagram"><Input value={form.instagramHandle} onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })} placeholder="@profil" /></Field>
        <Field label="Ville"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Date"><Input type="date" value={form.analysisDate} onChange={(e) => setForm({ ...form, analysisDate: e.target.value })} /></Field>
        <Field label="Priorité">
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {["Haute", "Moyenne", "Faible"].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Score"><Input type="number" min="1" max="10" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></Field>
        <div className="lg:col-span-2"><Field label="Commentaire public"><Textarea value={form.publicComment} onChange={(e) => setForm({ ...form, publicComment: e.target.value })} /></Field></div>
        <div className="lg:col-span-2"><Field label="Message privé"><Textarea value={form.privateMessage} onChange={(e) => setForm({ ...form, privateMessage: e.target.value })} /></Field></div>
        <div className="lg:col-span-2"><Field label="Stratégie d'approche"><Textarea value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} /></Field></div>
        <div className="lg:col-span-2"><Field label="Notes personnelles"><Textarea value={form.personalNotes} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })} /></Field></div>
      </div>
    </div>
  );
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Field label="Nom prospect"><Input value={form.prospectName} onChange={(e) => setForm({ ...form, prospectName: e.target.value })} /></Field>
      <Field label="Pseudo Instagram"><Input value={form.instagramHandle} onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })} placeholder="@profil" /></Field>
      <Field label="Ville"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
      <Field label="Date"><Input type="date" value={form.analysisDate} onChange={(e) => setForm({ ...form, analysisDate: e.target.value })} /></Field>
      <Field label="Priorite">
        <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {["Haute", "Moyenne", "Faible"].map((item) => <option key={item}>{item}</option>)}
        </Select>
      </Field>
      <Field label="Score"><Input type="number" min="1" max="10" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></Field>
      <div className="lg:col-span-2"><Field label="Commentaire public"><Textarea value={form.publicComment} onChange={(e) => setForm({ ...form, publicComment: e.target.value })} /></Field></div>
      <div className="lg:col-span-2"><Field label="Message prive"><Textarea value={form.privateMessage} onChange={(e) => setForm({ ...form, privateMessage: e.target.value })} /></Field></div>
      <div className="lg:col-span-2"><Field label="Strategie d'approche"><Textarea value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} /></Field></div>
      <div className="lg:col-span-2"><Field label="Notes personnelles"><Textarea value={form.personalNotes} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })} /></Field></div>
    </div>
  );
}

function AIHistory({ analyses, updateAiAnalysis, deleteAiAnalysis, createProspectFromAnalysis }) {
  const [filters, setFilters] = useState({ query: "", score: "Tous", priority: "Toutes", city: "", date: "" });
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => filterAiAnalyses(analyses, filters), [analyses, filters]);
  const selectedAnalysis = selected ? analyses.find((item) => item.id === selected.id) || selected : null;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_130px_150px_160px_150px]">
          <Field label="Recherche texte"><Input value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} placeholder="pseudo, ville, strategie..." /></Field>
          <Field label="Score">
            <Select value={filters.score} onChange={(e) => setFilters({ ...filters, score: e.target.value })}>
              <option>Tous</option>
              {["8+", "5-7", "1-4"].map((item) => <option key={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Priorite">
            <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option>Toutes</option>
              {["Haute", "Moyenne", "Faible"].map((item) => <option key={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Ville"><Input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></Field>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          {filtered.map((analysis) => (
            <button key={analysis.id} onClick={() => { setSelected(analysis); setEditing(null); }} className="rounded-lg border border-black/10 bg-white p-4 text-left shadow-soft transition hover:border-ocean/40">
              <div className="flex gap-3">
                <AIThumbnail src={analysis.profileImageUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{analysis.instagramHandle || analysis.prospectName || "Analyse Instagram"}</p>
                    <span className={`rounded-full px-2 py-1 text-xs ${priorityPill(analysis.priority)}`}>{analysis.priority}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/55">{formatDate(analysis.analysisDate)} · score {analysis.score}/10</p>
                  <p className="mt-2 text-sm text-ink/60">{analysis.city || "Ville non renseignee"}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <Card className="p-5 text-sm text-ink/60">Aucune analyse ne correspond aux filtres.</Card>}
        </div>

        <Card className="p-5">
          {!selectedAnalysis && <p className="text-sm text-ink/60">Selectionne une analyse pour voir le detail.</p>}
          {selectedAnalysis && !editing && (
            <AIAnalysisDetail analysis={selectedAnalysis} onEdit={() => setEditing(selectedAnalysis)} onDelete={() => { deleteAiAnalysis(selectedAnalysis.id); setSelected(null); }} onCreateProspect={() => createProspectFromAnalysis(selectedAnalysis)} />
          )}
          {editing && (
            <AIAnalysisEditor analysis={editing} onCancel={() => setEditing(null)} onSave={(next) => { updateAiAnalysis(editing.id, next); setEditing(null); }} />
          )}
        </Card>
      </div>
    </div>
  );
}

function AIThumbnail({ src }) {
  return src ? <img className="h-20 w-20 shrink-0 rounded-lg object-cover" src={src} alt="Capture profil" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-ivory text-xs text-ink/45">Profil</div>;
}

function AIAnalysisDetail({ analysis, onEdit, onDelete, onCreateProspect }) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">{analysis.instagramHandle || analysis.prospectName || "Analyse Instagram"}</h2>
          <p className="mt-1 text-sm text-ink/55">{analysis.city || "-"} · {formatDate(analysis.analysisDate)} · score {analysis.score}/10</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onEdit}>Modifier</Button>
          <Button variant="secondary" onClick={onDelete}>Supprimer</Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {analysis.profileImageUrl && <img className="max-h-80 w-full rounded-lg object-contain bg-ivory" src={analysis.profileImageUrl} alt="Capture profil" />}
        {analysis.postImageUrl && <img className="max-h-80 w-full rounded-lg object-contain bg-ivory" src={analysis.postImageUrl} alt="Capture post" />}
      </div>
      <div className="mt-5 grid gap-4">
        <CopyResultCard title="Commentaire public" text={analysis.publicComment || "-"} />
        <CopyResultCard title="Message prive" text={analysis.privateMessage || "-"} />
        <ResultCard title="Strategie" text={analysis.strategy || "-"} />
        <ResultCard title="Notes" text={analysis.personalNotes || "-"} />
      </div>
      <Button className="mt-5" onClick={onCreateProspect}><Plus size={16} /> Creer un prospect dans le CRM</Button>
    </div>
  );
}

function AIAnalysisEditor({ analysis, onCancel, onSave }) {
  const [form, setForm] = useState(analysis);
  return (
    <div>
      <h2 className="text-xl font-semibold">Modifier l'analyse</h2>
      <AIAnalysisForm form={form} setForm={setForm} />
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onSave(form)}>Enregistrer</Button>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

function InstagramAIResult({ analysis }) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className={`rounded-lg p-5 text-white ${analysis.priorityClass}`}>
            <p className="text-sm text-white/75">Score strategique</p>
            <p className="mt-2 text-5xl font-semibold">{analysis.score}/10</p>
            <p className="mt-3 text-sm font-semibold">{analysis.priority}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ResultMetric label="Profil" value={analysis.profileType} />
            <ResultMetric label="Niveau" value={analysis.level} />
            <ResultMetric label="Style" value={analysis.communicationStyle} />
            <ResultMetric label="Audience" value={analysis.audience} />
            <ResultMetric label="Engagement" value={analysis.engagement} />
            <ResultMetric label="Credibilite" value={analysis.credibility} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultCard title="Angle d'approche recommande" text={analysis.angle} />
        <ResultCard title="Effet miroir" text={analysis.mirror} />
        <CopyResultCard title="Commentaire public" text={analysis.publicComment} />
        <CopyResultCard title="Message prive" text={analysis.privateMessage} />
        <CopyResultCard title="Version courte Instagram mobile" text={analysis.shortMessage} />
        <ResultListCard title="Objections probables" items={analysis.objections} />
        <ResultCard title="Prochaine etape recommandee" text={analysis.nextStep} />
        <ResultListCard title="Points a verifier avant DM" items={analysis.checkpoints} />
      </div>
    </div>
  );
}

function ResultMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ResultCard({ title, text }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">{text}</p>
    </Card>
  );
}

function CopyResultCard({ title, text }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="secondary" className="px-3 py-1.5" onClick={() => navigator.clipboard?.writeText(text)}>
          <Copy size={15} /> Copier
        </Button>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">{text}</p>
    </Card>
  );
}

function ResultListCard({ title, items }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => <CopyLine key={item} text={item} />)}
      </div>
    </Card>
  );
}

function analyzeInstagramProspect({ profileCapture, postCapture, extraInfo }) {
  const text = normalizeText([extraInfo, profileCapture?.name, postCapture?.name].filter(Boolean).join(" "));
  const profileType = detectInstagramProfileType(text);
  const level = detectInstagramLevel(text, Boolean(profileCapture), Boolean(postCapture));
  const communicationStyle = detectCommunicationStyle(text);
  const audience = estimateAudience(text, level);
  const engagement = estimateEngagement(text, level);
  const credibility = estimateCredibility(text, level);
  const score = computeInstagramStrategicScore({ text, profileType, level, audience, engagement, credibility });
  const priority = score >= 8 ? "Haute priorite" : score >= 5 ? "Interessant" : "Faible interet";
  const priorityClass = score >= 8 ? "bg-ocean" : score >= 5 ? "bg-champagne text-ink" : "bg-ink";
  const angle = recommendInstagramAngle(profileType, text);

  return {
    profileType,
    level,
    audience,
    engagement,
    credibility,
    score,
    priority,
    priorityClass,
    communicationStyle,
    angle,
    mirror: mirrorGuidance(communicationStyle, level),
    publicComment: buildPublicComment(profileType, communicationStyle),
    privateMessage: buildPrivateMessage(profileType, communicationStyle, angle),
    shortMessage: buildShortInstagramMessage(profileType, angle),
    objections: likelyInstagramObjections(profileType),
    nextStep: recommendedInstagramNextStep(score, profileType),
    checkpoints: [
      "Verifier les abonnes actifs et coherents avec le skincare premium.",
      "Lire 5 a 10 commentaires recents avant de contacter.",
      "Regarder si la personne repond ou interagit avec sa communaute.",
      "Laisser un commentaire public naturel avant le DM si possible."
    ]
  };
}

function detectInstagramProfileType(text) {
  const matches = [
    ["facialiste", ["facialiste", "kobido", "massage visage", "face sculpting", "facegym"]],
    ["estheticienne", ["estheticienne", "esthetique", "cabine", "soin visage"]],
    ["institut", ["institut", "centre esthetique", "beauty salon", "salon de beaute"]],
    ["spa", ["spa", "wellness", "hotel spa", "massage", "detente"]],
    ["therapeute", ["therapeute", "holistique", "energetique", "naturopathe", "bien etre"]],
    ["influenceuse beaute", ["influenceuse", "creator", "creatrice contenu", "beauty blogger", "collab"]],
    ["entrepreneuse", ["entrepreneuse", "fondatrice", "business", "coach", "independante"]],
    ["passionnee skincare", ["skincare addict", "routine", "glass skin", "peau", "beauty routine"]]
  ];
  return matches.find(([, terms]) => hasAny(text, terms))?.[0] || "autre";
}

function detectInstagramLevel(text, hasProfile, hasPost) {
  let points = 0;
  if (hasProfile) points += 1;
  if (hasPost) points += 1;
  if (hasAny(text, ["collaboration", "partenariat", "presse", "formation", "certifie", "expert", "clinique", "fondatrice"])) points += 3;
  if (hasAny(text, ["feed coherent", "branding", "premium", "luxe", "professionnel", "avant apres"])) points += 2;
  if (hasAny(text, ["debut", "nouveau compte", "lancement"])) points -= 1;
  if (points >= 5) return "expert";
  if (points >= 2) return "intermediaire";
  return "debutant";
}

function estimateAudience(text, level) {
  const number = extractAudienceNumber(text);
  if (number >= 10000) return "forte";
  if (number >= 2000) return "moyenne";
  if (number > 0) return "niche";
  return level === "expert" ? "moyenne a forte" : level === "intermediaire" ? "niche a moyenne" : "niche";
}

function estimateEngagement(text, level) {
  if (hasAny(text, ["beaucoup de commentaires", "engagement fort", "communaute active", "likes eleves"])) return "fort";
  if (hasAny(text, ["peu de commentaires", "faible engagement", "peu actif"])) return "faible";
  return level === "expert" ? "moyen a fort" : level === "intermediaire" ? "moyen" : "a verifier";
}

function estimateCredibility(text, level) {
  if (hasAny(text, ["certifie", "formation", "diplome", "expert", "clinique", "presse", "partenariat"])) return "elevee";
  if (level === "expert") return "elevee";
  if (level === "intermediaire") return "bonne";
  return "a verifier";
}

function computeInstagramStrategicScore({ text, profileType, level, audience, engagement, credibility }) {
  let score = 3;
  if (["facialiste", "estheticienne", "institut", "spa"].includes(profileType)) score += 2;
  if (["influenceuse beaute", "entrepreneuse", "passionnee skincare"].includes(profileType)) score += 1;
  if (level === "expert") score += 2;
  if (level === "intermediaire") score += 1;
  if (["forte", "moyenne", "moyenne a forte"].includes(audience)) score += 1;
  if (["fort", "moyen a fort"].includes(engagement)) score += 1;
  if (["elevee", "bonne"].includes(credibility)) score += 1;
  if (hasAny(text, ["premium", "luxe", "skincare", "soin visage", "coreen", "anti age", "peau sensible"])) score += 1;
  return Math.max(1, Math.min(10, score));
}

function detectCommunicationStyle(text) {
  if (hasAny(text, ["formation", "conseil", "expert", "diagnostic", "pedagogique"])) return "pedagogique";
  if (hasAny(text, ["business", "entrepreneuse", "fondatrice", "strategie"])) return "business";
  if (hasAny(text, ["energie", "holistique", "spirituel", "intuition", "alignement"])) return "spirituel";
  if (hasAny(text, ["minimaliste", "clean", "simple", "essentiel"])) return "minimaliste";
  if (hasAny(text, ["emotion", "histoire", "ressenti", "confiance"])) return "emotionnel";
  if (hasAny(text, ["premium", "luxe", "haut de gamme", "excellence"])) return "luxe";
  if (hasAny(text, ["expert", "clinique", "protocole", "resultat"])) return "expert";
  return "premium";
}

function recommendInstagramAngle(profileType, text) {
  if (profileType === "facialiste") return "facialisme";
  if (profileType === "estheticienne") return "protocole cabine";
  if (profileType === "institut" || profileType === "spa") return "partenariat professionnel";
  if (profileType === "therapeute") return "beaute naturelle";
  if (profileType === "influenceuse beaute") return "decouverte du concept";
  if (profileType === "entrepreneuse") return "partenariat professionnel";
  if (hasAny(text, ["anti age", "bien vieillir", "age"])) return "bien vieillir";
  if (hasAny(text, ["routine", "rituel", "peau"])) return "rituel de peau";
  return "innovation skincare";
}

function mirrorGuidance(style, level) {
  const tone = {
    expert: "ton precis, vocabulaire professionnel, phrases courtes et respectueuses",
    pedagogique: "ton clair, logique simple, questions ouvertes",
    business: "ton direct, qualitatif, axe partenariat",
    spirituel: "ton doux, sensible, mots autour de l'equilibre et du ressenti",
    minimaliste: "phrases tres courtes, peu d'adjectifs, message epure",
    emotionnel: "ton chaleureux, valorisation du ressenti et de l'univers",
    premium: "ton sobre, elegant, vocabulaire qualitatif",
    luxe: "ton tres soigne, peu de mots, forte attention au detail"
  }[style] || "ton naturel et qualitatif";
  return `${tone}. Niveau ${level} : rester humble, ne pas sur-expliquer, ouvrir la discussion sans pousser.`;
}

function buildPublicComment(profileType, style) {
  if (profileType === "facialiste") return "Votre gestuelle et votre approche du soin sont tres coherentes. On sent une vraie attention au detail.";
  if (profileType === "estheticienne") return "Tres beau contenu, on sent une approche professionnelle et une vraie attention a l'experience cliente.";
  if (profileType === "spa" || profileType === "institut") return "Votre univers est tres harmonieux, on ressent bien la qualite de l'experience que vous proposez.";
  if (style === "minimaliste") return "Tres beau contenu, simple et tres juste. L'univers est vraiment coherent.";
  if (style === "spirituel") return "J'aime beaucoup la douceur de votre approche. On sent une vraie intention derriere le soin.";
  return "J'aime beaucoup votre approche du soin, c'est elegant et tres coherent.";
}

function buildPrivateMessage(profileType, style, angle) {
  const reference = profileType === "autre" ? "votre univers" : `votre profil de ${profileType}`;
  const styleHint = style === "luxe" ? "avec beaucoup de soin dans le detail" : "avec une vraie coherence";
  return `Bonjour {nom}, je viens de decouvrir ${reference} et j'ai beaucoup aime votre approche, ${styleHint}.\nJe developpe une approche de skincare coreen premium encore peu presente en Europe.\nJe cherche surtout a echanger avec des profils sensibles a la qualite, au rituel et aux partenariats bien faits.\nJe ne sais pas si l'angle "${angle}" pourrait vous parler ?`;
}

function buildShortInstagramMessage(profileType, angle) {
  const target = profileType === "autre" ? "votre univers" : `votre profil ${profileType}`;
  return `Bonjour {nom}, j'ai beaucoup aime ${target}.\nJe developpe une approche skincare coreenne premium, encore assez nouvelle en Europe.\nJe me suis dit que l'angle "${angle}" pourrait peut-etre vous parler.\nOu pas du tout ?`;
}

function likelyInstagramObjections(profileType) {
  const common = ["deja une routine", "je reflechis", "pas le temps", "je ne connais pas"];
  if (["facialiste", "estheticienne", "institut", "spa"].includes(profileType)) return ["deja une marque", "pas le temps", "je reflechis", "je ne connais pas", "deja une routine"];
  if (["entrepreneuse", "influenceuse beaute"].includes(profileType)) return ["pas le temps", "je ne veux pas vendre", "je n'ai pas de reseau", "je reflechis", "je ne connais pas"];
  return common;
}

function recommendedInstagramNextStep(score, profileType) {
  if (score >= 8 && ["facialiste", "estheticienne", "institut", "spa"].includes(profileType)) return "Laisser un commentaire public naturel, puis proposer un simple echange qualitatif.";
  if (score >= 8) return "Interagir avec 1 ou 2 contenus, puis envoyer un DM court et ouvert.";
  if (score >= 5) return "Observer davantage les commentaires et likes avant d'envoyer un DM.";
  return "Attendre davantage et ne contacter que si un signal d'interet skincare apparait.";
}

function extractAudienceNumber(text) {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(k|m|abonnes|followers)/);
  if (!match) return 0;
  const value = Number(match[1].replace(",", "."));
  if (match[2] === "m") return value * 1000000;
  if (match[2] === "k") return value * 1000;
  return value;
}

function Avatars() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {avatars.map((avatar) => (
        <Card key={avatar.id} className="overflow-hidden">
          <div className="border-b border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ocean">Avatar client</p>
            <h2 className="mt-1 text-2xl font-semibold">{avatar.name}</h2>
            <p className="mt-2 text-sm text-ink/60">{avatar.tone}</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoList title="Ou chercher" items={avatar.where} />
            <InfoList title="Mots-cles" items={avatar.keywords} />
            <InfoList title="Signaux" items={avatar.signals} />
            <InfoList title="Objections" items={avatar.objections} />
            <div className="sm:col-span-2 rounded-lg bg-ivory p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/55">Approche</p>
              <p className="mt-2 text-sm">{avatar.approach}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function InfoList({ title, items }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-ink/65">
        {items.map((item) => (
          <li key={item} className="flex gap-2"><ChevronRight className="mt-0.5 shrink-0 text-champagne" size={14} />{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Generators() {
  const [keyword, setKeyword] = useState({ avatarId: avatars[0].id, city: "Paris", platform: "Instagram", goal: goals[0] });
  const [msg, setMsg] = useState({ style: scriptLibrary[0].title, name: "Camille" });
  const [conversation, setConversation] = useState({ message: "", context: "Premier contact", variants: [] });
  const avatar = findAvatar(keyword.avatarId);
  const keywordGroups = buildProspectionQueries(keyword, avatar);
  const isInstagram = keyword.platform === "Instagram";
  const selectedScript = scriptLibrary.find((s) => s.title === msg.style) || scriptLibrary[0];
  const message = selectedScript.text.replaceAll("{nom}", msg.name || "");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Generateur de mots-cles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Avatar"><Select value={keyword.avatarId} onChange={(e) => setKeyword({ ...keyword, avatarId: e.target.value })}>{avatars.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field>
          <Field label="Ville"><Input value={keyword.city} onChange={(e) => setKeyword({ ...keyword, city: e.target.value })} /></Field>
          <Field label="Plateforme"><Select value={keyword.platform} onChange={(e) => setKeyword({ ...keyword, platform: e.target.value })}>{platforms.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Objectif"><Select value={keyword.goal} onChange={(e) => setKeyword({ ...keyword, goal: e.target.value })}>{goals.map((g) => <option key={g}>{g}</option>)}</Select></Field>
        </div>
        <div className="mt-5 space-y-4">
          {isInstagram ? (
            <InstagramProspectionAssistant groups={keywordGroups} avatarId={avatar.id} city={keyword.city} />
          ) : (
            keywordGroups.map((group) => <KeywordGroup key={group.title} group={group} />)
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-semibold">Generateur de messages</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Style"><Select value={msg.style} onChange={(e) => setMsg({ ...msg, style: e.target.value })}>{scriptLibrary.map((s) => <option key={s.title}>{s.title}</option>)}</Select></Field>
          <Field label="Prenom / nom"><Input value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} /></Field>
        </div>
        <div className="mt-5 rounded-lg bg-ivory p-4 text-sm leading-relaxed">{message}</div>
        <Button className="mt-4" onClick={() => navigator.clipboard?.writeText(message)}><Copy size={16} /> Copier</Button>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <h2 className="text-xl font-semibold">Assistant Conversation</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <Field label="Message du prospect">
              <Textarea value={conversation.message} onChange={(e) => setConversation({ ...conversation, message: e.target.value })} placeholder="Ex. C'est interessant mais je trouve ca un peu cher..." />
            </Field>
            <Field label="Contexte de la conversation">
              <Select value={conversation.context} onChange={(e) => setConversation({ ...conversation, context: e.target.value })}>
                {conversationContexts.map((context) => <option key={context}>{context}</option>)}
              </Select>
            </Field>
            <Button onClick={() => setConversation({ ...conversation, variants: generateConversationVariants(conversation) })}>
              <Sparkles size={16} /> Analyser et generer
            </Button>
          </div>
          <div className="rounded-lg bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/55">Reponse prete a envoyer</p>
            {conversation.variants.length === 0 && (
              <p className="mt-3 min-h-32 text-sm leading-relaxed text-ink/60">
                Les variantes apparaitront ici. Elles resteront courtes, calmes et conversationnelles.
              </p>
            )}
            <div className="mt-3 space-y-3">
              {conversation.variants.map((variant) => (
                <div key={variant.label} className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{variant.label}</p>
                    <Button className="px-3 py-1.5" variant="secondary" onClick={() => navigator.clipboard?.writeText(variant.text)}>
                      <Copy size={15} /> Copier
                    </Button>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{variant.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KeywordGroup({ group }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{group.title}</h3>
          {group.description && <p className="mt-1 text-xs text-ink/55">{group.description}</p>}
        </div>
        <span className="rounded-full bg-ivory px-2 py-1 text-xs text-ink/55">{group.items.length}</span>
      </div>
      <div className="space-y-2">
        {group.items.map((line) => <CopyLine key={`${group.title}-${line}`} text={line} />)}
      </div>
    </div>
  );
}

function InstagramProspectionAssistant({ groups, avatarId, city }) {
  const comments = instagramPublicComments(avatarId);
  const dm = instagramDmAfterInteraction(city);

  return (
    <>
      {groups.map((group) => <KeywordGroup key={group.title} group={group} />)}
      <KeywordGroup
        group={{
          title: "Action a faire apres la recherche",
          description: "Methode terrain pour transformer une recherche Instagram en prospects CRM.",
          items: instagramActionPlan()
        }}
      />
      <KeywordGroup
        group={{
          title: "Commentaire public conseille",
          description: "A laisser avant le DM si le contenu s'y prete.",
          items: comments
        }}
      />
      <KeywordGroup
        group={{
          title: "DM apres interaction",
          description: "Message court apres un commentaire, un like ou une reaction naturelle.",
          items: [dm]
        }}
      />
    </>
  );
}

function buildProspectionQueries({ city, platform, goal }, avatar) {
  const cleanCity = city.trim() || "Paris";
  const localCities = nearbyCities(cleanCity);
  const baseTerms = termsForAvatar(avatar.id);
  const objectiveTerms = termsForGoal(goal);

  if (platform === "Instagram") {
    return [
      {
        title: "Comptes a rechercher",
        description: "Pistes a taper dans Instagram puis a verifier : ce ne sont pas forcement des comptes existants.",
        items: instagramAccountSearches(avatar.id, cleanCity).slice(0, 12)
      },
      {
        title: "Hashtags reellement utilises",
        description: "Hashtags courts et larges. Eviter les hashtags inventes ville + theme trop longs.",
        items: instagramBroadHashtags(avatar.id).slice(0, 12)
      },
      {
        title: "Comptes / marques a espionner",
        description: "Observer abonnes, commentaires et likes pour reperer des profils actifs et coherents.",
        items: instagramSpyTargets(avatar.id).slice(0, 12)
      },
      {
        title: "Lieux a explorer",
        description: "Explorer ville principale, villes premium proches et quartiers a fort potentiel.",
        items: unique(localCities).slice(0, 10)
      }
    ];
  }

  if (platform === "Google Maps") {
    return [
      {
        title: "Recherches locales Google Maps",
        items: unique([
          ...baseTerms.slice(0, 12).map((term) => `${term} ${cleanCity}`),
          ...objectiveTerms.slice(0, 5).map((term) => `${term} ${cleanCity}`),
          ...localCities.slice(1, 5).flatMap((place) => baseTerms.slice(0, 2).map((term) => `${term} ${place}`))
        ]).slice(0, 18)
      }
    ];
  }

  if (platform === "LinkedIn") {
    return [
      {
        title: "Metiers, roles et positionnements",
        items: unique([
          ...baseTerms.slice(0, 10).map((term) => `${term} ${cleanCity}`),
          ...professionalTerms(avatar.id).map((term) => `${term} ${cleanCity}`),
          ...objectiveTerms.slice(0, 5).map((term) => `${term} ${cleanCity}`)
        ]).slice(0, 18)
      }
    ];
  }

  if (platform === "Facebook") {
    return [
      {
        title: "Groupes et communautes",
        items: unique([
          ...baseTerms.slice(0, 8).map((term) => `groupe ${term} ${cleanCity}`),
          ...objectiveTerms.slice(0, 5).map((term) => `communaute ${term} ${cleanCity}`),
          `femmes entrepreneures ${cleanCity}`,
          `beaute bien-etre ${cleanCity}`,
          `bons plans beaute ${cleanCity}`
        ]).slice(0, 18)
      }
    ];
  }

  if (platform === "TikTok") {
    return [
      {
        title: "Hashtags TikTok",
        items: unique([...baseTerms.slice(0, 8).map((term) => hashtag(term, cleanCity)), ...objectiveTerms.slice(0, 4).map((term) => hashtag(term, cleanCity))]).slice(0, 12)
      },
      {
        title: "Recherches texte TikTok",
        items: unique([
          ...baseTerms.slice(0, 8).map((term) => `${term} ${cleanCity}`),
          ...objectiveTerms.slice(0, 5).map((term) => `${term} ${cleanCity}`),
          `routine skincare coreenne ${cleanCity}`
        ]).slice(0, 12)
      }
    ];
  }

  return [
    {
      title: "Recherches de prospection",
      items: unique([...baseTerms, ...objectiveTerms].map((term) => `${term} ${cleanCity}`)).slice(0, 16)
    }
  ];
}

function CopyLine({ text }) {
  return (
    <button onClick={() => navigator.clipboard?.writeText(text)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-ivory p-3 text-left text-sm transition hover:bg-mist">
      <span>{text}</span>
      <Copy size={15} className="shrink-0 text-ocean" />
    </button>
  );
}

function termsForAvatar(avatarId) {
  const terms = {
    "cliente-premium-skincare": [
      "skincare premium",
      "routine coreenne",
      "soin anti age",
      "peau lumineuse",
      "glass skin",
      "soin visage premium",
      "beaute luxe",
      "routine peau sensible",
      "cosmetique coreenne",
      "rituel skincare"
    ],
    estheticienne: [
      "estheticienne independante",
      "institut beaute",
      "soin visage",
      "cabine esthetique",
      "centre esthetique",
      "soin anti age",
      "soin peau sensible",
      "esthetique premium",
      "beauty expert",
      "soin visage haut de gamme"
    ],
    facialiste: [
      "facialiste",
      "massage visage",
      "kobido",
      "glow facial",
      "soin liftant naturel",
      "face sculpting",
      "gym faciale",
      "soin visage premium",
      "massage facialiste",
      "rituel visage"
    ],
    "spa-institut": [
      "spa soin visage",
      "institut haut de gamme",
      "spa premium",
      "centre bien etre",
      "soin signature",
      "rituel visage",
      "hotel spa",
      "centre esthetique",
      "spa urbain",
      "institut beaute premium"
    ],
    entrepreneuse: [
      "entrepreneuse bien etre",
      "coach beaute",
      "business feminin",
      "independante bien etre",
      "personal branding",
      "createur contenu beaute",
      "entrepreneuse lifestyle",
      "revenu complementaire",
      "femme entrepreneure",
      "business beaute"
    ],
    "future-distributrice": [
      "revenu complementaire",
      "business a domicile",
      "reconversion professionnelle",
      "skincare addict",
      "ambassadrice beaute",
      "vente relationnelle",
      "marque coreenne",
      "opportunite beaute",
      "business flexible",
      "conseillere beaute"
    ],
    "personne-recommandee": [
      "peau sensible",
      "routine skincare",
      "soin visage",
      "beaute naturelle",
      "routine coreenne",
      "rituel peau",
      "anti age",
      "peau lumineuse",
      "conseil beaute",
      "skincare premium"
    ]
  };

  return terms[avatarId] || terms["cliente-premium-skincare"];
}

function instagramAccountSearches(avatarId, city) {
  const citySlug = slugForHandle(city);
  const nearby = nearbyCities(city).map(slugForHandle).filter(Boolean);
  const local = [citySlug, ...nearby.filter((place) => place !== citySlug)].slice(0, 4);
  const byAvatar = {
    "cliente-premium-skincare": ["skinexpert", "skinclinic", "skincare", "beautyexpert", "glowskin", "peausensible", "institutbeaute"],
    estheticienne: ["estheticienne", "institut", "institutbeaute", "centreesthetique", "beautyexpert", "skinexpert", "soinvisage"],
    facialiste: ["facialiste", "kobido", "massagevisage", "facegym", "facesculpting", "skinexpert", "soinvisage"],
    "spa-institut": ["spa", "spapremium", "institut", "institutbeaute", "skinclinic", "wellness", "soinvisage"],
    entrepreneuse: ["entrepreneuse", "businessbeaute", "beautyexpert", "coachbeaute", "skincare", "skinexpert", "glowskin"],
    "future-distributrice": ["ambassadricebeaute", "conseillerebeaute", "businessbeaute", "skincare", "beautyexpert", "skinexpert", "glowskin"],
    "personne-recommandee": ["skincare", "peausensible", "soinvisage", "skinexpert", "glowskin", "institutbeaute", "beautyexpert"]
  };
  const bases = byAvatar[avatarId] || byAvatar["cliente-premium-skincare"];
  const localSearches = bases.slice(0, 5).flatMap((base) => local.slice(0, 2).map((place) => `${base}${place}`));
  return unique([...localSearches, ...bases, "skinclinic", "aestheticclinic"]).slice(0, 16);
}

function instagramBroadHashtags(avatarId) {
  const common = ["#facialiste", "#kobido", "#soinvisage", "#antiage", "#antiaging", "#glassskin", "#glowskin", "#skincareroutine", "#beautenaturelle", "#peausensible"];
  const byAvatar = {
    "cliente-premium-skincare": ["#skincare", "#koreanskincare", "#luxuryskincare", "#skincareaddict", "#glowyskin"],
    estheticienne: ["#estheticienne", "#institutdebeaute", "#esthetique", "#soinsvisage", "#beautyexpert"],
    facialiste: ["#facialmassage", "#facegym", "#facesculpting", "#massagevisage", "#glowfacial"],
    "spa-institut": ["#spa", "#spalife", "#wellness", "#beautysalon", "#institutdebeaute"],
    entrepreneuse: ["#entrepreneuse", "#businessfeminin", "#beautybusiness", "#womeninbusiness", "#personalbranding"],
    "future-distributrice": ["#beautybusiness", "#ambassadrice", "#revenucomplementaire", "#skincarebusiness", "#businessadomicile"],
    "personne-recommandee": ["#skincare", "#peausensible", "#beautenaturelle", "#routinebeaute", "#glowyskin"]
  };
  return unique([...common, ...(byAvatar[avatarId] || [])]).slice(0, 16);
}

function instagramSpyTargets(avatarId) {
  const premium = ["Hydrafacial", "Biologique Recherche", "Dermalogica", "Valmont", "La Mer", "Sisley Paris", "Augustinus Bader", "skin clinic", "aesthetic clinic"];
  const byAvatar = {
    estheticienne: ["Esthederm", "Sothys", "Guinot", "Payot", "Mesoestetic"],
    facialiste: ["FaceGym", "Kobido", "Joelle Ciocco", "Sarah Chapman", "FaceKult"],
    "spa-institut": ["Four Seasons Spa", "Hotel Spa", "Clinique La Prairie", "Cinq Mondes", "Ritz Club Spa"],
    entrepreneuse: ["Sephora", "Oh My Cream", "Typology", "Aime Skincare", "Blissim"],
    "future-distributrice": ["Sephora", "Oh My Cream", "Typology", "Aime Skincare", "skincare business"],
    "personne-recommandee": ["Oh My Cream", "Sephora", "Typology", "Aime Skincare", "skin clinic"]
  };
  return unique([...premium, ...(byAvatar[avatarId] || [])]).slice(0, 16);
}

function instagramActionPlan() {
  return [
    "Ouvrir les comptes trouves et verifier que l'univers correspond a la cible.",
    "Regarder les abonnes des comptes pertinents.",
    "Lire les commentaires recents pour reperer les profils actifs.",
    "Observer les likes sur les publications recentes quand ils sont visibles.",
    "Identifier les profils coherents : beaute, soin, bien-etre, premium, recommandation.",
    "Enregistrer le prospect dans le CRM avec source Instagram et tags utiles.",
    "Laisser un commentaire public naturel avant le DM si le contenu s'y prete.",
    "Envoyer un DM court uniquement apres une interaction credible."
  ];
}

function instagramPublicComments(avatarId) {
  const common = [
    "J'aime beaucoup votre approche du soin, c'est tres elegant.",
    "Votre univers est tres coherent, on sent une vraie attention au detail.",
    "Tres beau contenu, j'aime beaucoup cette vision du soin."
  ];
  const byAvatar = {
    "cliente-premium-skincare": [
      "Votre routine a l'air tres soignee, le rendu est vraiment lumineux.",
      "J'aime beaucoup cette approche douce et premium du skincare.",
      "Tres belle selection, on sent une vraie exigence dans vos choix."
    ],
    estheticienne: [
      "Votre approche cabine est tres professionnelle, c'est inspirant.",
      "On sent une belle attention portee a l'experience cliente.",
      "Tres beau contenu, votre expertise ressort vraiment."
    ],
    facialiste: [
      "Votre gestuelle a l'air tres precise, c'est beau a voir.",
      "J'aime beaucoup votre vision du soin visage, tres elegante.",
      "On sent une vraie maitrise et beaucoup de sensibilite dans votre approche."
    ],
    "spa-institut": [
      "Votre univers est tres apaisant, on sent une vraie experience premium.",
      "Tres belle atmosphere, cela donne vraiment envie de decouvrir le lieu.",
      "J'aime beaucoup la coherence entre le soin, le lieu et l'experience."
    ],
    entrepreneuse: [
      "Votre univers est tres clair, on sent une vraie direction.",
      "J'aime beaucoup votre facon de presenter les choses, c'est naturel.",
      "Tres beau positionnement, on sent une vraie coherence."
    ],
    "future-distributrice": [
      "Votre contenu est tres naturel, on sent une belle energie.",
      "J'aime beaucoup votre maniere de partager, c'est authentique.",
      "Votre univers est chaleureux et tres coherent."
    ],
    "personne-recommandee": [
      "Tres beau contenu, c'est simple et tres agreable a suivre.",
      "J'aime beaucoup votre univers, il est tres naturel.",
      "On sent une vraie attention au detail dans ce que vous partagez."
    ]
  };

  return byAvatar[avatarId] || common;
}

function instagramDmAfterInteraction(city) {
  const cleanCity = city.trim();
  const localHint = cleanCity ? ` autour de ${cleanCity}` : "";
  return `Bonjour {nom}, je viens de decouvrir votre univers et j'ai beaucoup aime votre approche. Je developpe actuellement un rituel skincare coreen premium${localHint} et je me suis dit que cela pourrait eventuellement vous parler. Est-ce que je peux vous poser une petite question ?`;
}

function generateConversationVariants({ message, context }) {
  const intent = detectConversationIntent(message, context);
  return ["A", "B", "C"].map((label, index) => ({
    label: `Variante ${label}`,
    text: buildConversationReply(intent, context, index)
  }));
}

function detectConversationIntent(message, context) {
  const text = normalizeText(message);
  if (!text.trim() || context === "Relance") return "silence";
  if (hasAny(text, ["trop cher", "cher", "budget", "prix", "combien"])) return "too_expensive";
  if (hasAny(text, ["deja une routine", "ma routine", "deja mes produits", "j ai deja mes produits"])) return "routine";
  if (hasAny(text, ["reflechir", "je reflechis", "je vais reflechir", "je dois voir"])) return "think";
  if (hasAny(text, ["pas le temps", "trop occupe", "occupee", "debordee", "pas dispo"])) return "no_time";
  if (hasAny(text, ["pas maintenant", "plus tard", "pas le moment"])) return "not_now";
  if (hasAny(text, ["deja avec une marque", "travaille deja", "deja une marque", "partenaire d une marque"])) return "brand";
  if (hasAny(text, ["pas vendre", "je ne veux pas vendre", "vente", "commercial"])) return "no_selling";
  if (hasAny(text, ["pas de reseau", "je connais personne", "personne a qui"])) return "no_network";
  if (hasAny(text, ["envoie", "infos", "info", "lien", "document"])) return "send_info";
  if (hasAny(text, ["comment ca marche", "comment cela marche", "explique", "fonctionne", "principe"])) return "how_it_works";
  if (hasAny(text, ["ca m interesse", "interessee", "interessant", "curieuse", "pourquoi pas", "oui"])) return "interested";
  if (hasAny(text, ["produits", "tester", "rituel", "commander", "routine"])) return "product_interest";
  if (hasAny(text, ["opportunite", "business", "revenu", "partenaire", "distributrice"])) return "business_interest";
  if (hasAny(text, ["je te redis", "je reviens vers toi", "je vous redis"])) return "come_back";
  if (context === "Opportunite business") return "business_interest";
  if (context === "Objection") return "objection";
  if (context === "Apres rituel" || context === "Apres test produit") return "product_interest";
  return "neutral";
}

function buildConversationReply(intent, context, variantIndex) {
  const objection = {
    too_expensive: [
      "Je comprends, c'est normal de regarder le budget avant de se projeter.\nPour moi, l'idee n'est pas de pousser, mais de voir si la logique du rituel a vraiment du sens pour toi.\nL'univers RIMAN est assez different, plus construit autour d'une approche globale que d'un simple produit.\nTu es sensible a ce type d'approche, ou pas vraiment ?",
      "Je comprends totalement, le prix est toujours un vrai sujet.\nJe prefere qu'on le regarde seulement si le rituel te parle deja sur le fond.\nRIMAN s'inscrit dans une logique skincare coreenne premium, tres coherente, sans promesse magique.\nEst-ce que c'est un univers qui t'attire un peu ?",
      "Oui je comprends, et je n'ai pas envie de te convaincre sur un prix.\nLe plus important est de voir si l'approche correspond a ta facon de prendre soin de ta peau.\nC'est un concept tres fort dans d'autres pays, avec une vraie logique de rituel.\nTu veux qu'on regarde d'abord si le principe te parle ?"
    ],
    routine: [
      "Je comprends, et c'est plutot positif d'avoir deja une routine.\nJe ne cherche pas a remplacer ce qui te convient.\nRIMAN peut surtout se comprendre comme une approche differente du skincare coreen premium.\nTu es ouverte a decouvrir la logique, juste pour voir si ca fait sens ?",
      "Oui, je comprends tres bien.\nQuand une routine fonctionne deja, l'idee n'est pas de tout changer.\nCe qui m'interesse ici, c'est plutot la coherence du rituel et la facon dont il est pense.\nCa te parle ce genre d'approche ?",
      "Je comprends, c'est important de garder ce qui marche pour toi.\nDe mon cote, je peux simplement te partager l'univers RIMAN sans pression.\nC'est moins un catalogue qu'une logique de soin assez complete.\nTu serais curieuse de comprendre le principe ?"
    ],
    think: [
      "Bien sur, prends le temps.\nJe prefere que ce soit naturel plutot que presse.\nSi tu veux, on peut juste garder l'idee en tete et voir si l'univers RIMAN te parle sur le fond.\nQu'est-ce qui te ferait hesiter le plus aujourd'hui ?",
      "Oui bien sur, c'est normal de reflechir.\nJe ne veux pas te pousser dans une decision rapide.\nLe plus simple est peut-etre de voir d'abord si la logique du rituel te parle.\nTu veux que je te pose une question pour mieux cerner ton besoin ?",
      "Je comprends totalement.\nPrends le temps qu'il faut, vraiment.\nDe mon cote, je peux t'aider a clarifier si c'est le sujet, le timing ou l'approche qui te questionne.\nC'est quoi ton ressenti la maintenant ?"
    ],
    no_time: [
      "Je comprends, les journees sont vite pleines.\nJe ne veux pas ajouter quelque chose de lourd.\nL'idee RIMAN peut se decouvrir tres simplement, sans rentrer dans tous les details.\nTu preferes que je te laisse revenir quand ce sera plus calme ?",
      "Oui je comprends, ce n'est peut-etre pas le bon moment.\nJe prefere garder ca leger.\nSi le sujet skincare coreen premium t'intrigue quand meme, on peut en reparler plus tard tranquillement.\nTu veux que je revienne vers toi dans quelques jours ?",
      "Je comprends tout a fait.\nOn peut rester sur quelque chose de simple, sans pression.\nL'univers est interessant, mais il doit arriver au bon moment.\nTu preferes que je mette ca de cote pour l'instant ?"
    ],
    not_now: [
      "Je comprends, aucun souci.\nCe n'est peut-etre simplement pas le bon moment.\nJe prefere te laisser de l'espace plutot que d'insister.\nSi le sujet te reparle plus tard, tu me diras ?",
      "Bien sur, je respecte totalement.\nJe garde ca tres simple et sans pression.\nL'univers RIMAN peut se decouvrir quand le timing est meilleur.\nTu veux que je revienne vers toi plus tard, ou je laisse de cote ?",
      "Je comprends.\nMerci de me le dire clairement, c'est plus simple.\nJe ne veux pas forcer une conversation si ce n'est pas le moment.\nOn peut en reparler quand ce sera plus naturel pour toi."
    ],
    brand: [
      "Je comprends, et c'est tres sain d'avoir deja une marque de confiance.\nJe ne cherche pas a bousculer ce qui fonctionne.\nRIMAN m'interesse surtout pour sa logique de rituel et son univers skincare coreen premium.\nTu serais ouverte a regarder l'approche, sans idee de remplacer quoi que ce soit ?",
      "Oui, je comprends tres bien.\nSi tu travailles deja avec une marque, l'objectif n'est pas de comparer frontalement.\nJe peux simplement te partager ce qui rend l'approche differente.\nCa t'interesserait de voir la logique, juste par curiosite ?",
      "Je comprends parfaitement.\nJe respecte les choix de marque, surtout quand ils sont coherents.\nDe mon cote, je parle plutot d'un univers et d'un rituel, pas d'une vente forcee.\nTu veux que je te montre l'angle general ?"
    ],
    no_selling: [
      "Je comprends, et je te rassure : je n'aime pas non plus les approches forcees.\nLa logique ici est beaucoup plus relationnelle et qualitative.\nRIMAN s'introduit naturellement quand le sujet parle vraiment a la personne.\nTu veux que je t'explique simplement l'esprit, sans parler vente ?",
      "Oui, je comprends totalement.\nPersonne n'a envie de se sentir commerciale ou insistante.\nCe qui m'interesse dans l'approche, c'est justement le cote recommandation et liberte.\nTu es ouverte a comprendre la logique, sans engagement ?",
      "Je te rejoins completement.\nSi ca ressemble a de la vente forcee, ce n'est pas pour moi non plus.\nL'univers RIMAN est plus subtil : soin, relation, coherence, confiance.\nTu veux que je te donne la version simple ?"
    ],
    no_network: [
      "Je comprends cette crainte.\nEn realite, l'idee n'est pas d'avoir un grand reseau, mais de demarrer avec des conversations naturelles.\nL'approche RIMAN repose beaucoup sur la qualite du lien, pas sur le volume.\nTu veux que je t'explique comment ca peut commencer tres simplement ?",
      "Oui je comprends, c'est une objection tres normale.\nAvoir un reseau aide, mais ce n'est pas le point de depart principal.\nCe qui compte, c'est de savoir reconnaitre les bonnes personnes et rester naturelle.\nTu veux que je te montre la logique sans pression ?",
      "Je comprends totalement.\nOn imagine souvent qu'il faut connaitre beaucoup de monde, mais ce n'est pas forcement le cas.\nL'approche est plus progressive et relationnelle.\nTu serais curieuse de voir comment ca se construit ?"
    ],
    silence: [
      "Je me permets une petite relance, sans pression.\nSi ce n'est pas le bon moment, aucun souci.\nJe voulais juste savoir si le sujet skincare coreen premium te parle encore un peu.\nTu preferes que je le mette de cote ?",
      "Petit message tranquille de ma part.\nJe ne veux pas insister, simplement savoir si tu avais envie que je te partage la suite.\nL'idee est de rester dans quelque chose de simple et libre.\nTu me dis franchement ?",
      "Je reviens vers toi doucement.\nSi le sujet n'est pas prioritaire, je comprends tres bien.\nJe voulais juste verifier si l'approche RIMAN t'intrigue encore un peu.\nJe laisse de cote si ce n'est pas le moment."
    ]
  };

  const open = {
    send_info: [
      "Oui bien sur, je peux t'envoyer ca simplement.\nL'idee n'est pas de te noyer d'informations.\nIl y a une video d'environ 9 min sur la societe, son histoire et la culture coreenne, puis une video d'environ 25 min sur le rituel, la logique, les resultats et des temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Avec plaisir.\nJe te propose de commencer par une vision claire, sans presentation interminable.\nLa premiere video dure environ 9 min et pose l'univers, la societe et la culture coreenne ; la deuxieme dure environ 25 min et explique le rituel, la logique, les resultats et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Oui, je peux te partager les infos de facon simple.\nLe plus fluide est de voir d'abord les deux videos : environ 9 min pour la societe, l'histoire et la culture coreenne, puis environ 25 min pour le rituel, la logique, les resultats et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire."
    ],
    interested: [
      "Super, merci pour ton retour.\nJe prefere avancer simplement, sans te faire une grande presentation ici.\nL'univers RIMAN tourne autour d'un skincare coreen premium et d'un rituel tres coherent.\nJe peux te les envoyer si tu veux : video 1 environ 9 min sur la societe, l'histoire et la culture coreenne, puis video 2 environ 25 min sur le rituel, la logique, les resultats et les temoignages.",
      "Trop bien, merci.\nSi le sujet t'intrigue, le plus simple est de decouvrir l'univers dans le bon ordre.\nIl y a une premiere video d'environ 9 min sur la societe et la culture coreenne, puis une deuxieme d'environ 25 min sur le rituel, la logique, les resultats et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Super, je suis contente que ca t'interpelle.\nJe prefere te laisser te faire ton avis tranquillement.\nRIMAN a une approche skincare coreenne premium assez differente, deja forte dans d'autres pays.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire."
    ],
    how_it_works: [
      "Oui bien sur.\nEn version simple, l'approche part d'un rituel skincare coreen premium, avec une vraie logique de fond et une experience tres coherente.\nJe peux t'envoyer deux videos : environ 9 min sur la societe, l'histoire et la culture coreenne, puis environ 25 min sur le rituel, la logique, les resultats et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Oui, je t'explique simplement.\nCe n'est pas un catalogue produit, c'est plutot un univers avec une logique de rituel et une approche differente du soin.\nLe plus clair est de voir la video 9 min sur la societe et la culture coreenne, puis la video 25 min sur le rituel, la logique, les resultats et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Oui bien sur.\nL'idee est de decouvrir une approche skincare coreenne premium, tres structuree, sans te faire un long message ici.\nIl y a une video courte d'environ 9 min puis une video plus complete d'environ 25 min.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire."
    ],
    product_interest: [
      "Avec plaisir.\nAvant de parler produit, j'aimerais comprendre ce que tu recherches pour ta peau et ce que tu utilises deja.\nRIMAN fonctionne vraiment dans une logique de rituel coherent, pas de produit isole.\nTu veux me dire ce que tu aimerais ameliorer ou ressentir dans ta routine ?",
      "Oui, on peut regarder ca tranquillement.\nJe prefere d'abord comprendre ta routine actuelle et ta sensibilite de peau.\nL'univers RIMAN est pense comme un rituel skincare coreen premium, donc le contexte compte beaucoup.\nTu cherches plutot glow, confort, anti-age, sensibilite, ou quelque chose d'autre ?",
      "Avec plaisir, mais je prefere ne pas te conseiller au hasard.\nLe rituel est interessant quand il est relie a un vrai besoin.\nRIMAN a une approche tres coherente du soin et de l'experience.\nTu peux me dire ce qui t'attire le plus dans les produits ?"
    ],
    business_interest: [
      "Super, merci pour ton ouverture.\nJe prefere te le presenter calmement, sans discours de recrutement.\nL'approche repose sur un univers skincare coreen premium, une logique relationnelle et un concept deja fort dans d'autres pays.\nJe peux te les envoyer si tu veux : video 1 environ 9 min sur la societe et la culture coreenne, puis video 2 environ 25 min sur le rituel, la logique, les resultats et les temoignages.",
      "Oui, je peux t'en dire plus.\nCe qui m'interesse ici, ce n'est pas de pousser un plan, mais de voir si l'univers et la logique te parlent.\nIl y a une video d'environ 9 min sur l'histoire, la societe et la culture coreenne, puis une video d'environ 25 min sur le rituel, les resultats, la logique et les temoignages.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire.",
      "Super, on peut regarder ca simplement.\nJe veux garder ca tres clair et sans pression.\nRIMAN melange skincare coreen premium, rituel coherent et approche relationnelle.\nJe peux te les envoyer si tu veux et tu me diras ce que ca t'inspire."
    ]
  };

  const neutral = [
    "Je comprends, merci pour ton retour.\nJe prefere garder ca simple et naturel.\nDe mon cote, je decouvre surtout si l'univers RIMAN, autour du skincare coreen premium et d'un rituel coherent, peut parler a certaines personnes.\nTu es sensible a ce type d'approche ?",
    "Oui, je vois ce que tu veux dire.\nJe n'ai pas envie de te faire un grand discours.\nL'idee est juste de voir si cette approche differente du soin, plus premium et plus construite, peut t'interpeller.\nCa te parle ce genre de logique ?",
    "Merci pour ton message.\nJe prefere avancer doucement et voir si le sujet a du sens pour toi.\nRIMAN est un univers skincare coreen premium avec une logique de rituel deja forte ailleurs.\nJe ne sais pas si c'est un sujet qui te parle ?"
  ];

  if (objection[intent]) return objection[intent][variantIndex];
  if (open[intent]) return open[intent][variantIndex];
  if (intent === "come_back") return objection.think[variantIndex];
  if (context === "Apres video 9 min" && intent === "neutral") {
    return [
      "Merci d'avoir pris le temps de regarder.\nJe suis curieuse de savoir ce que tu en retiens, sans chercher a te convaincre.\nL'univers est particulier, entre histoire, culture coreenne et approche skincare premium.\nQu'est-ce qui t'a le plus parle, ou au contraire moins parle ?",
      "Merci pour ton retour.\nJe prefere d'abord comprendre ton ressenti plutot que d'enchainer.\nLa premiere video pose surtout l'univers et la logique de fond.\nTu as eu une impression plutot positive, neutre, ou pas vraiment ?",
      "Merci de l'avoir regardee.\nJe trouve interessant de voir ce qui resonne ou non chez chacun.\nLa suite va plus loin dans le rituel et la logique, mais seulement si ca t'intrigue.\nTu as envie d'en voir plus ou pas specialement ?"
    ][variantIndex];
  }
  if (context === "Apres video 25 min" && intent === "neutral") {
    return [
      "Merci d'avoir pris le temps de regarder.\nJe ne veux pas te pousser, je prefere comprendre ce que tu en penses vraiment.\nEntre le rituel, la logique et les temoignages, est-ce qu'il y a quelque chose qui t'a parle ?",
      "Merci pour ton retour.\nLa video donne deja une vision plus complete, donc ton ressenti m'interesse.\nEst-ce que tu te vois plutot curieuse d'en discuter, ou tu sens que ce n'est pas pour toi ?",
      "Merci de l'avoir regardee.\nJe prefere rester simple : soit ca ouvre une vraie curiosite, soit on laisse de cote.\nTu veux qu'on en parle 10 minutes, ou tu preferes prendre le temps ?"
    ][variantIndex];
  }
  return neutral[variantIndex];
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => text.includes(normalizeText(pattern)));
}

function termsForGoal(goal) {
  const terms = {
    "Trouver des prospects": ["prospect beaute", "client soin visage", "interessee skincare", "beaute premium"],
    "Creer une conversation": ["question skincare", "routine peau", "conseil peau", "diagnostic peau"],
    "Proposer une video": ["decouvrir rituel", "video skincare", "presentation soin visage", "rituel coreen"],
    "Obtenir un call": ["appel decouverte", "consultation beaute", "rendez vous skincare", "diagnostic visage"],
    "Rechercher partenaires": ["partenaire beaute", "collaboration institut", "ambassadrice beaute", "partenariat spa"]
  };

  return terms[goal] || terms["Trouver des prospects"];
}

function professionalTerms(avatarId) {
  const terms = {
    "cliente-premium-skincare": ["fondatrice marque beaute", "consultante image", "coach lifestyle", "creatrice contenu beaute"],
    estheticienne: ["estheticienne", "gerante institut beaute", "responsable institut", "praticienne soin visage"],
    facialiste: ["facialiste", "praticienne massage visage", "formatrice kobido", "experte soin visage"],
    "spa-institut": ["directrice spa", "spa manager", "gerant institut", "responsable wellness"],
    entrepreneuse: ["fondatrice", "entrepreneuse bien etre", "coach business feminin", "independante"],
    "future-distributrice": ["conseillere beaute", "ambassadrice marque", "independante", "reconversion professionnelle"],
    "personne-recommandee": ["contact recommande", "cliente potentielle", "profil beaute", "prescriptrice"]
  };

  return terms[avatarId] || terms["cliente-premium-skincare"];
}

function nearbyCities(city) {
  const normalized = normalizeText(city);
  const groups = {
    geneve: ["Geneve", "Carouge", "Nyon", "Lausanne", "Meyrin", "Lancy", "Versoix", "Annemasse"],
    genève: ["Geneve", "Carouge", "Nyon", "Lausanne", "Meyrin", "Lancy", "Versoix", "Annemasse"],
    paris: ["Paris", "Neuilly sur Seine", "Boulogne Billancourt", "Levallois Perret", "Saint Germain en Laye", "Versailles", "Vincennes", "Marais"],
    lyon: ["Lyon", "Villeurbanne", "Caluire", "Ecully", "Tassin", "Bron", "Croix Rousse", "Presqu ile"],
    lausanne: ["Lausanne", "Pully", "Morges", "Vevey", "Montreux", "Nyon", "Geneve", "Renens"],
    zurich: ["Zurich", "Winterthur", "Uster", "Kloten", "Meilen", "Zug", "Lucerne", "Baden"],
    zürich: ["Zurich", "Winterthur", "Uster", "Kloten", "Meilen", "Zug", "Lucerne", "Baden"],
    bruxelles: ["Bruxelles", "Ixelles", "Uccle", "Waterloo", "Woluwe", "Etterbeek", "Schaerbeek", "Saint Gilles"]
  };

  return groups[normalized] || [city, `centre ${city}`, `quartier premium ${city}`, `spa ${city}`, `institut ${city}`, `hotel ${city}`, `centre ville ${city}`, `alentours ${city}`];
}

function hashtag(term, city) {
  return `#${slugForHashtag(`${term} ${city}`)}`;
}

function slugForHashtag(value) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function slugForHandle(value) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}

function unique(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

const instagramProspectionMasterPrompt = `Tu es mon assistant de prospection Instagram pour une activité de skincare coréen premium et de partenariats qualitatifs.

Je vais te fournir :

* une capture du profil Instagram ;
* une capture d'une publication ;
* éventuellement quelques informations visibles.

OBJECTIF

Produire une analyse immédiatement exploitable dans Prospection OS.

Tu dois analyser le profil, comprendre son univers, détecter son potentiel stratégique et générer une approche de prospection naturelle, humaine et contextuelle.

DETECTION AUTOMATIQUE DU PROFIL

Identifie automatiquement le profil dominant :

* Facialiste
* Esthéticienne
* Institut
* Spa
* Thérapeute
* Professionnelle beauté
* Influenceuse beauté
* Passionnée skincare
* Entrepreneure
* Dirigeante
* Créatrice de contenu business
* Développement personnel
* Leadership
* Salariée
* Lifestyle
* Autre

DETECTION DU NIVEAU

Évalue :

* Débutant
* Intermédiaire
* Expert

ÉVALUE ÉGALEMENT

* crédibilité ;
* cohérence ;
* qualité du contenu ;
* potentiel de partenariat ;
* ouverture probable ;
* adéquation avec l'univers RIMAN ;
* capacité à devenir cliente ;
* capacité à devenir partenaire.

LOGIQUE BEAUTÉ / SKINCARE

Si le profil est orienté :

* skincare ;
* beauté ;
* facialisme ;
* anti-âge ;
* esthétique ;
* bien-être ;

alors :

* créer du lien avant tout ;
* montrer un intérêt sincère ;
* s'intéresser à sa vision de la peau ;
* s'intéresser à son activité ;
* s'intéresser à son expérience ;
* ne jamais vendre ;
* ne jamais pitcher ;
* ne jamais parler de rémunération ;
* ne jamais pousser une opportunité.

Objectif :

1. créer une conversation ;
2. créer de la curiosité ;
3. comprendre son univers ;
4. qualifier naturellement ;
5. détecter l'ouverture.

Si la personne montre de l'intérêt :

Première étape :
Vidéo d'environ 9 minutes présentant la société, son histoire, la culture coréenne et sa philosophie.

Si elle souhaite approfondir :

Deuxième étape :
Vidéo d'environ 25 minutes expliquant le rituel, la logique de fond, les résultats observés et les témoignages.

Si elle souhaite aller plus loin :

Proposer un échange ou un appel.

LOGIQUE BUSINESS / ENTREPRENEURIAT

Si le profil est orienté :

* entrepreneuriat ;
* business ;
* leadership ;
* développement personnel ;
* indépendance ;
* marketing ;
* réseau ;

alors :

utiliser principalement la logique Benjamin Franklin.

Objectifs :

* demander un avis ;
* demander un conseil ;
* demander une recommandation ;
* créer de la redevabilité ;
* créer de l'engagement ;
* créer une vraie conversation.

Ne jamais présenter directement l'activité.

Créer d'abord :

* connexion ;
* confiance ;
* curiosité ;
* qualification.

Puis seulement explorer l'ouverture éventuelle.

LOGIQUE PROFIL NEUTRE

Créer une relation naturelle.

Découvrir :

* activité ;
* centres d'intérêt ;
* motivations ;
* valeurs.

Puis déterminer si l'approche la plus pertinente est :

* skincare ;
* partenariat ;
* simple relation.

HUMANISATION OBLIGATOIRE

Tous les textes générés doivent donner l'impression d'avoir été écrits par une vraie personne.

Éviter :

* les formulations trop parfaites ;
* les compliments artificiels ;
* les tournures génériques ;
* les phrases marketing ;
* les structures répétitives ;
* les messages qui semblent copiés-collés ;
* le langage typique des intelligences artificielles.

Privilégier :

* un ton naturel ;
* une écriture conversationnelle ;
* de la spontanéité ;
* des observations crédibles ;
* de la curiosité sincère ;
* des formulations simples ;
* une approche humaine.

Les commentaires publics et messages privés doivent paraître écrits par une personne réelle qui s'intéresse sincèrement au prospect.

Le lecteur ne doit jamais avoir l'impression de recevoir :

* un script ;
* un message automatisé ;
* un message généré par une IA ;
* une tentative de vente.

RÈGLES OBLIGATOIRES

* ton humain ;
* ton élégant ;
* ton premium ;
* ton naturel ;
* ton conversationnel ;
* jamais robotique ;
* jamais agressif ;
* jamais pushy ;
* jamais MLM ;
* jamais pression ;
* jamais promesse médicale ;
* jamais promesse financière.

COMMENTAIRE_PUBLIC

Doit :

* être spécifique au contenu ;
* être crédible ;
* créer de la sympathie ;
* créer une présence ;
* donner envie d'échanger.

Maximum 2 phrases.

MESSAGE_PRIVE

Doit :

* être personnalisé ;
* être naturel ;
* être élégant ;
* créer une ouverture ;
* créer une conversation ;
* donner une porte de sortie ;
* ne jamais vendre.

Maximum 5 lignes.

SCORING

1 à 3 :
Faible intérêt.

4 à 6 :
Intérêt moyen.

7 à 8 :
Bon prospect.

9 à 10 :
Prospect premium.

FORMAT DE SORTIE OBLIGATOIRE

NOM:
Nom visible ou vide.

PSEUDO:
Pseudo Instagram.

VILLE:
Ville ou "Ville non renseignée".

SCORE:
Nombre de 1 à 10 uniquement.

PRIORITE:
Haute, Moyenne ou Faible uniquement.

COMMENTAIRE_PUBLIC:
Commentaire prêt à publier.

MESSAGE_PRIVE:
Message privé prêt à envoyer.

STRATEGIE:
4 à 8 lignes maximum.

Indiquer :

* type de profil détecté ;
* niveau estimé ;
* angle recommandé ;
* ce qu'il faut éviter ;
* prochaine étape ;
* pertinence de la vidéo 9 minutes ;
* pertinence de la vidéo 25 minutes ;
* pertinence de la méthode Benjamin Franklin.

NOTE_CRM:
3 à 6 lignes maximum.

Résumé stratégique exploitable dans le CRM :

* profil ;
* crédibilité ;
* potentiel ;
* intérêt ;
* raison du score.

Ne réponds qu'avec les champs ci-dessus.

Ne rajoute aucun autre titre.
Ne rajoute aucune autre section.
Respecte strictement ce format.`;

const prospectReplyMasterPrompt = `Tu es mon assistant conversationnel pour repondre a des prospects Instagram, WhatsApp ou Messenger.

Je vais te donner :
- le message du prospect ;
- le contexte de la conversation ;
- eventuellement l'historique precedent.

Ta mission :
Generer une reponse courte, humaine, calme, adulte, naturelle et non commerciale.

Structure obligatoire :
1. Reconnaitre la position de la personne.
2. Montrer que tu comprends.
3. Repondre brievement.
4. Ouvrir la discussion.
5. Introduire naturellement l'univers RIMAN si pertinent.
6. Valider l'interet.
7. Proposer les videos uniquement si la personne montre curiosite, ouverture ou interet.
8. Attendre la reaction.

Regles :
- 3 a 5 lignes maximum.
- 6 lignes maximum.
- Pas d'argumentaire.
- Pas de pression.
- Pas de forcing.
- Pas de catalogue produit.
- Pas de plan de remuneration.
- Ne jamais promettre de resultats medicaux.
- Ne jamais expliquer la strategie dans la reponse finale.

Univers a introduire doucement si pertinent :
- skincare coreen premium ;
- approche differente ;
- logique de fond ;
- rituel coherent ;
- concept deja fort dans d'autres pays.

Objections a gerer avec calme :
- c'est trop cher ;
- j'ai deja une routine ;
- je reflechis ;
- pas le temps ;
- pas maintenant ;
- je travaille deja avec une marque ;
- je ne veux pas vendre ;
- je n'ai pas de reseau ;
- envoie les infos ;
- comment ca marche.

Si les videos sont pertinentes, presenter ainsi :
Video 1 : environ 9 min, societe, histoire, culture coreenne.
Video 2 : environ 25 min, rituel, logique, resultats, temoignages.
Terminer par :
"Je peux te les envoyer si tu veux et tu me diras ce que ca t'inspire."

Reponds uniquement avec le message final pret a envoyer.`;

const objectionsMasterPrompt = `Tu es mon assistant pour traiter les objections de prospects avec calme, intelligence et liberte.

Je vais te donner :
- le message exact du prospect ;
- le contexte de la conversation ;
- l'objectif de la suite.

Ta mission :
Generer une reponse courte qui respecte cette structure :
1. Comprendre.
2. Respecter.
3. Ouvrir legerement.

Objections frequentes :
- c'est trop cher ;
- j'ai deja une routine ;
- je reflechis ;
- pas le temps ;
- pas maintenant ;
- je travaille deja avec une marque ;
- je ne veux pas vendre ;
- je n'ai pas de reseau ;
- envoie les infos ;
- comment ca marche.

Regles :
- ne jamais convaincre ;
- ne jamais argumenter longuement ;
- ne jamais mettre de pression ;
- ne jamais promettre de resultats medicaux ;
- rester humain, calme, adulte et premium.

Reponds uniquement avec le message final pret a envoyer.`;

const partnersMasterPrompt = `Tu es mon assistant pour approcher des partenaires professionnels dans l'univers beaute, skincare, facialisme, spa et bien-etre.

Je vais te donner :
- le profil du partenaire potentiel ;
- son metier ;
- sa ville ;
- son univers ;
- ce que j'ai observe sur son compte.

Positionnement :
Je developpe une approche de skincare coreen premium encore peu presente en Europe.
Je cherche a echanger, decouvrir des profils et creer des partenariats qualitatifs.

Ta mission :
1. Identifier l'angle de partenariat le plus naturel.
2. Adapter le vocabulaire au profil.
3. Generer un commentaire public si utile.
4. Generer un message prive court et elegant.
5. Proposer une prochaine etape douce.

Interdictions :
- discours MLM ;
- recrutement agressif ;
- vente directe ;
- promesse medicale ;
- message trop long.

Reponds avec :
- Angle recommande
- Commentaire public
- Message prive
- Prochaine etape`;

function ChatGPTAssistant() {
  const [copied, setCopied] = useState("");

  const copyPrompt = async (label, text) => {
    await navigator.clipboard?.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean">Bibliotheque</p>
        <h2 className="mt-1 text-2xl font-semibold">Assistant IA</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">Prompts maitres a copier dans ChatGPT selon le besoin de prospection.</p>
      </Card>

      {copied && <Card className="border-ocean/20 bg-mist p-4 text-sm font-semibold text-ocean">Prompt copie</Card>}

      <div className="grid gap-6 lg:grid-cols-2">
        <PromptCard
          title="Prompt Prospection Instagram"
          text={instagramProspectionMasterPrompt}
          onCopy={() => copyPrompt("instagram", instagramProspectionMasterPrompt)}
        />
        <PromptCard
          title="Prompt Reponse Prospect"
          text={prospectReplyMasterPrompt}
          onCopy={() => copyPrompt("reply", prospectReplyMasterPrompt)}
        />
        <PromptCard
          title="Prompt Objections"
          text={objectionsMasterPrompt}
          onCopy={() => copyPrompt("objections", objectionsMasterPrompt)}
        />
        <PromptCard
          title="Prompt Partenaires"
          text={partnersMasterPrompt}
          onCopy={() => copyPrompt("partners", partnersMasterPrompt)}
        />
      </div>
    </div>
  );
}

function PromptCard({ title, text, onCopy }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="secondary" onClick={onCopy}>
          <Copy size={16} /> Copier le prompt
        </Button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-ivory p-4 text-sm leading-relaxed text-ink/75">{text}</pre>
    </Card>
  );
}

function ScriptsLibrary() {
  const [query, setQuery] = useState("");
  const scripts = [...scriptLibrary, ...objectionScripts.map((o) => ({ category: "Objection", title: o.objection, text: o.answer }))].filter((s) =>
    `${s.category} ${s.title} ${s.text}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-ocean" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un script ou une objection..." />
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Methode objection</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Accepter", "Contourner", "Recadrer", "Retirer la pression"].map((step) => (
            <div key={step} className="rounded-lg bg-ivory p-4">
              <p className="font-semibold">{step}</p>
              <p className="mt-2 text-sm text-ink/60">{stepText(step)}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {scripts.map((item) => (
          <Card key={`${item.category}-${item.title}`} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ocean">{item.category}</p>
            <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigator.clipboard?.writeText(item.text)}><Copy size={16} /> Copier</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FollowUps({ prospects, tasks = [], updateProspect }) {
  const due = prospects.filter((p) => isDue(p));
  const pendingTasks = tasks.filter((task) => !["done", "completed"].includes(String(task.status || "pending").toLowerCase())).slice(0, 8);
  const prospectById = prospects.reduce((acc, prospect) => {
    acc[prospect.id] = prospect;
    return acc;
  }, {});
  return (
       <Card className="p-5">
        <h2 className="text-xl font-semibold">Prospects a suivre</h2>
        <div className="mt-4 space-y-3">
          {due.map((p) => (
            <div key={p.id} className="rounded-lg border border-black/10 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-ink/55">Relance prevue le {formatDate(p.nextFollowUp)} · {p.score}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => updateProspect(p.id, { nextFollowUp: addDays(2), status: "A relancer" }, "Relance J+2")}>J+2</Button>
                  <Button variant="secondary" onClick={() => updateProspect(p.id, { nextFollowUp: addDays(7), status: "A relancer" }, "Relance J+7")}>J+7</Button>
                  <Button variant="secondary" onClick={() => updateProspect(p.id, { nextFollowUp: addDays(30), status: "A relancer" }, "Relance J+30")}>J+30</Button>
                  <Button onClick={() => updateProspect(p.id, { nextFollowUp: calculateNextFollowUp(p, { afterDone: true }).dueDate }, "Relance effectuee")}>Fait</Button>
                </div>
              </div>
            </div>
          ))}
          {due.length === 0 && <p className="text-sm text-ink/60">Aucune relance a traiter.</p>}
        </div>
      </Card>
  );
}

function emptyProspect() {
  return {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    profession: "",
    referredBy: "",
    network: "Instagram",
    profileUrl: "",
    avatarId: avatars[0].id,
    status: "A contacter",
    rimanStage: "Prospect",
    instagramStage: "Discussion en cours",
    score: "Tiede",
    interest: 3,
    firstContact: todayISO(),
    nextFollowUp: addDays(2),
    notes: "",
    tags: "",
    history: []
  };
}

function emptyAiAnalysisForm() {
  return {
    prospectName: "",
    instagramHandle: "",
    city: "",
    analysisDate: todayISO(),
    priority: "Moyenne",
    score: 5,
    publicComment: "",
    privateMessage: "",
    strategy: "",
    personalNotes: "",
    profileImageUrl: "",
    postImageUrl: "",
    prospectId: null,
    convertedToCrm: false
  };
}

function normalizeProspect(prospect) {
  return {
    ...emptyProspect(),
    ...prospect,
    status: normalizeLegacy(prospect.status || "A contacter"),
    rimanStage: normalizeLegacy(prospect.rimanStage || statusToRiman[normalizeLegacy(prospect.status)] || "Prospect"),
    instagramStage: instagramStages.includes(prospect.instagramStage) ? prospect.instagramStage : "Discussion en cours",
    score: scoreLabels.includes(prospect.score) ? prospect.score : scoreFromInterest(prospect.interest),
    history: Array.isArray(prospect.history) ? prospect.history : [historyItem("Import local", "Fiche existante normalisee")]
  };
}

function normalizeLegacy(value = "") {
  const map = {
    "Ã€ contacter": "A contacter",
    "ContactÃ©": "Contacte",
    "RÃ©ponse reÃ§ue": "Reponse recue",
    "VidÃ©o 9 min envoyÃ©e": "Video 9 min envoyee",
    "VidÃ©o 25 min envoyÃ©e": "Video 25 min envoyee",
    "Call proposÃ©": "Call propose",
    "Call prÃ©vu": "Call prevu",
    "Ã€ relancer": "A relancer",
    "Pas intÃ©ressÃ©": "Pas interesse"
  };
  return map[value] || value;
}

function scoreFromInterest(interest) {
  const value = Number(interest || 3);
  if (value >= 4) return "Chaud";
  if (value <= 2) return "Froid";
  return "Tiede";
}

function normalizeInstagramProfileUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const duplicatedUrl = raw.match(/^https?:\/\/(?:www\.)?instagram\.com\/(https?:\/\/.+)$/i);
  if (duplicatedUrl) return normalizeInstagramProfileUrl(decodeURIComponent(duplicatedUrl[1]));
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  const handle = raw
    .replace(/^@+/, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/^\/+|\/+$/g, "");
  return handle ? `https://www.instagram.com/${handle}` : "";
}

function buildCrmNotesFromAnalysis(analysis) {
  const angle = summarizeAnalysisAngle(analysis.strategy);
  return [
    "Prospect cree depuis une analyse IA.",
    `Ville : ${analysis.city || "-"}`,
    `Score IA : ${analysis.score || 5}/10`,
    `Priorite : ${analysis.priority || "Moyenne"}`,
    `Angle recommande : ${angle}`
  ].join("\n");
}

function summarizeAnalysisAngle(strategy = "") {
  const text = String(strategy || "").replace(/\s+/g, " ").trim();
  if (!text) return "A verifier dans l'Historique IA";
  return text.length > 140 ? `${text.slice(0, 137).trim()}...` : text;
}

function enrichPatch(current, patch, automaticFollowUp = null) {
  const next = { ...patch };
  if (patch.status && patch.status !== current.status) {
    if (automaticFollowUp && !patch.nextFollowUp) next.nextFollowUp = automaticFollowUp.dueDate;
    const normalizedStatus = normalizeFollowUpKey(patch.status);
    if (statusToRiman[normalizedStatus] && !patch.rimanStage) next.rimanStage = statusToRiman[normalizedStatus];
    if (["Client", "Partenaire"].includes(patch.status) && !patch.score) next.score = "Chaud";
  }
  if (patch.rimanStage && patch.rimanStage !== current.rimanStage) {
    if (automaticFollowUp && !patch.nextFollowUp) next.nextFollowUp = automaticFollowUp.dueDate;
  }
  if (patch.rimanStage === "Commande" && !patch.status) next.status = "Client";
  if (patch.rimanStage === "Partenaire" && !patch.status) next.status = "Partenaire";
  return next;
}

function getAutomaticFollowUp(before, patch = {}) {
  const prospect = { ...before, ...patch };
  if (patch.status && before.status !== patch.status) {
    const target = normalizeFollowUpKey(patch.status);
    const rule = followUpRules[target];
    if (rule && rule.source === "statut") return automaticFollowUpFromRule(rule, target, prospect);
  }
  if (patch.rimanStage && before.rimanStage !== patch.rimanStage) {
    const target = normalizeFollowUpKey(patch.rimanStage);
    const rule = followUpRules[target];
    if (rule && rule.source === "pipeline") return automaticFollowUpFromRule(rule, target, prospect);
  }
  return null;
}

function isStatusOrPipelinePatch(patch = {}) {
  return Object.prototype.hasOwnProperty.call(patch, "status") || Object.prototype.hasOwnProperty.call(patch, "rimanStage");
}

function normalizeFollowUpKey(value = "") {
  return normalizeLegacy(String(value || ""))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasProspectAnswered(prospect) {
  return answeredFollowUpStatuses.includes(normalizeFollowUpKey(prospect.status));
}

function isSilentProspect(prospect) {
  return !hasProspectAnswered(prospect);
}

function calculateNextFollowUp(prospect, options = {}) {
  if (!hasProspectAnswered(prospect)) return { days: 2, dueDate: addDays(2) };

  const history = Array.isArray(prospect.history) ? prospect.history : [];
  const ordered = [...history].sort((a, b) => String(a.at || "").localeCompare(String(b.at || "")));
  const firstAnswerIndex = ordered.findIndex((entry) => {
    const text = `${entry.title || ""} ${entry.detail || ""}`;
    return answeredFollowUpStatuses.some((status) => text.includes(`"${status}"`));
  });
  const usableHistory = firstAnswerIndex >= 0 ? ordered.slice(firstAnswerIndex + 1) : ordered;
  // Sans date de reponse fiable, l'historique complet donne une estimation prudente du rang.
  const followUpEntries = usableHistory.filter((entry) => ["Relance effectuee", "Relance automatique"].includes(entry.title));
  const latestFollowUp = followUpEntries[followUpEntries.length - 1];
  const answeredFollowUps = options.afterDone && latestFollowUp?.title !== "Relance automatique" ? followUpEntries.length + 1 : followUpEntries.length;
  const sequence = [2, 7, 30];
  const rank = Math.min(answeredFollowUps, sequence.length - 1);
  const days = sequence[rank];
  return { days, dueDate: addDays(days) };
}

function automaticFollowUpFromRule(rule, target, prospect) {
  const followUp = calculateNextFollowUp(prospect);
  return {
    ...rule,
    days: followUp.days,
    dueDate: followUp.dueDate,
    detail: `Relance J+${followUp.days} creee apres changement vers "${target}"`
  };
}

function buildHistory(before, after, label, options = {}) {
  const rules = [
    {
      key: "status",
      title: "Statut CRM",
      detail: (oldValue, newValue) => `Statut change de "${oldValue}" vers "${newValue}"`
    },
    {
      key: "score",
      title: "Score prospect",
      detail: (oldValue, newValue) => `Score change de "${oldValue}" vers "${newValue}"`
    },
    {
      key: "rimanStage",
      title: "Pipeline RIMAN",
      detail: (oldValue, newValue) => `Pipeline RIMAN change de "${oldValue}" vers "${newValue}"`
    },
    !options.skipNextFollowUp && {
      key: "nextFollowUp",
      title: "Prochaine relance",
      detail: (oldValue, newValue) => {
        if (newValue && !oldValue) return `Prochaine relance definie au ${formatHistoryDate(newValue)}`;
        if (!newValue && oldValue) return "Prochaine relance retiree";
        return `Prochaine relance changee du ${formatHistoryDate(oldValue)} au ${formatHistoryDate(newValue)}`;
      }
    },
    contactHistoryRule("phone", "Telephone"),
    contactHistoryRule("whatsapp", "WhatsApp"),
    contactHistoryRule("email", "Email"),
    profileHistoryRule("city", "Ville"),
    profileHistoryRule("profession", "Profession"),
    {
      key: "notes",
      title: "Notes",
      detail: (oldValue, newValue) => {
        if (newValue && !oldValue) return "Notes CRM ajoutees";
        if (!newValue && oldValue) return "Notes CRM retirees";
        return "Notes CRM mises a jour";
      }
    },
    {
      key: "tags",
      title: "Tags",
      normalize: normalizeHistoryTags,
      detail: (oldValue, newValue) => {
        if (newValue && !oldValue) return `Tags ajoutes : ${newValue}`;
        if (!newValue && oldValue) return "Tags retires";
        return `Tags mis a jour : ${newValue}`;
      }
    }
  ].filter(Boolean);

  return rules.reduce((entries, rule) => {
    const oldValue = normalizeHistoryValue(before[rule.key], rule);
    const newValue = normalizeHistoryValue(after[rule.key], rule);
    if (oldValue !== newValue) entries.push(historyItem(rule.title, rule.detail(oldValue, newValue, label)));
    return entries;
  }, []);
}

function contactHistoryRule(key, label) {
  return {
    key,
    title: "Contact",
    detail: (oldValue, newValue) => {
      if (newValue && !oldValue) return `${label} ajoute`;
      if (!newValue && oldValue) return `${label} retire`;
      return `${label} mis a jour`;
    }
  };
}

function profileHistoryRule(key, label) {
  return {
    key,
    title: "Profil",
    detail: (oldValue, newValue) => {
      if (newValue && !oldValue) return `${label} ajoutee : ${newValue}`;
      if (!newValue && oldValue) return `${label} retiree`;
      return `${label} changee de "${oldValue}" vers "${newValue}"`;
    }
  };
}

function normalizeHistoryValue(value, rule = {}) {
  if (rule.normalize) return rule.normalize(value);
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeHistoryTags(value) {
  return splitTags(value).map((tag) => tag.toLowerCase()).sort().join(", ");
}

function formatHistoryDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function historyItem(title, detail) {
  return { id: crypto.randomUUID(), at: nowISO(), title, detail };
}

function toDbProspect(prospect, user) {
  return {
    user_id: user.id,
    team_id: null,
    name: prospect.name,
    phone: prospect.phone,
    whatsapp: prospect.whatsapp,
    email: prospect.email,
    city: prospect.city,
    profession: prospect.profession,
    referred_by: prospect.referredBy,
    network: prospect.network,
    profile_url: prospect.profileUrl,
    avatar_id: prospect.avatarId,
    status: prospect.status,
    riman_stage: prospect.rimanStage,
    instagram_stage: prospect.instagramStage,
    score: prospect.score,
notes: prospect.notes,
    interest: Number(prospect.interest || 3),
    first_contact: prospect.firstContact || null,
    next_follow_up: prospect.nextFollowUp || null,
    tags: splitTags(prospect.tags),
    updated_at: nowISO()
  };
}

function fromDbProspect(row, history = []) {
  return normalizeProspect({
    id: row.id,
    name: row.name || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    city: row.city || "",
    profession: row.profession || "",
    referredBy: row.referred_by || "",
    network: row.network || "Instagram",
    profileUrl: row.profile_url || "",
    avatarId: row.avatar_id || avatars[0].id,
    status: row.status || "A contacter",
    rimanStage: row.riman_stage || "Prospect",
    instagramStage: row.instagram_stage || "Discussion en cours",
    score: row.score || "Tiede",
    interest: row.interest || 3,
    firstContact: row.first_contact || todayISO(),
    nextFollowUp: row.next_follow_up || "",
    notes: row.notes || "",
    tags: Array.isArray(row.tags) ? row.tags.join(", ") : row.tags || "",
    history
  });
}

function toDbHistory(item, prospectId, user) {
  return {
    user_id: user.id,
    team_id: null,
    prospect_id: prospectId,
    title: item.title,
    detail: item.detail,
    created_at: item.at || nowISO()
  };
}

function fromDbHistory(row) {
  return {
    id: row.id,
    at: row.created_at,
    title: row.title,
    detail: row.detail
  };
}

function toDbNote(body, prospectId, user) {
  return {
    user_id: user.id,
    team_id: null,
    prospect_id: prospectId,
    body: body || "",
    created_at: nowISO()
  };
}

function toDbDaily(daily, user) {
  return {
    team_id: null,
    daily_date: daily.date || todayISO(),
    daily_objectives: daily.objectives,
    messages_sent: Number(daily.messagesSent || 0),
    follow_ups_done: Number(daily.followUpsDone || 0),
    calls_booked: Number(daily.callsBooked || 0),
    active_streak: Number(daily.activeStreak || 1),
    updated_at: nowISO()
  };
}

function fromDbDaily(row) {
  return {
    date: row.daily_date || todayISO(),
    objectives: row.daily_objectives || defaultDaily.objectives,
    messagesSent: row.messages_sent || 0,
    followUpsDone: row.follow_ups_done || 0,
    callsBooked: row.calls_booked || 0,
    activeStreak: row.active_streak || 1
  };
}

function computeStats(prospects, daily, aiAnalyses = []) {
  const total = prospects.length;
  const count = (predicate) => prospects.filter(predicate).length;
  const clients = count((p) => p.status === "Client" || p.rimanStage === "Cliente");
  const partners = count((p) => p.status === "Partenaire" || p.rimanStage === "Partenaire");
  const orders = count((p) => p.rimanStage === "Commande");
  const rituals = count((p) => ["Rituel propose", "Rituel realise", "Cliente", "Partenaire", "Commande"].includes(p.rimanStage));
  return {
    total,
    toContact: count((p) => p.status === "A contacter"),
    followUps: count((p) => isDue(p)),
    callsProposed: count((p) => ["Call propose", "Call prevu"].includes(p.status)),
    activeProspects: count(hasProspectAnswered),
    silentProspects: count(isSilentProspect),
    hot: count((p) => p.score === "Chaud"),
    warm: count((p) => p.score === "Tiede"),
    cold: count((p) => p.score === "Froid"),
    clients,
    partners,
    orders,
    score: total * 5 + Number(daily.messagesSent) * 3 + Number(daily.followUpsDone) * 4 + Number(daily.callsBooked) * 10,
    customerRate: percent(clients, total),
    partnerRate: percent(partners, total),
    orderRate: percent(orders, total),
    ritualRate: percent(rituals, total),
    aiCount: aiAnalyses.length,
    aiAverageScore: aiAnalyses.length ? Math.round((aiAnalyses.reduce((sum, item) => sum + Number(item.score || 0), 0) / aiAnalyses.length) * 10) / 10 : 0,
    aiHighPriority: aiAnalyses.filter((item) => item.priority === "Haute").length,
    aiConvertedToCrm: aiAnalyses.filter((item) => item.convertedToCrm).length
  };
}

function toDbAiAnalysis(analysis, user) {
  return {
    user_id: user.id,
    team_id: null,
    prospect_name: analysis.prospectName || "",
    instagram_handle: analysis.instagramHandle || "",
    city: analysis.city || "",
    analysis_date: analysis.analysisDate || todayISO(),
    priority: analysis.priority || "Moyenne",
    score: Number(analysis.score || 5),
    public_comment: analysis.publicComment || "",
    private_message: analysis.privateMessage || "",
    strategy: analysis.strategy || "",
    personal_notes: analysis.personalNotes || "",
    profile_image_url: analysis.profileImageUrl || "",
    post_image_url: analysis.postImageUrl || "",
    prospect_id: analysis.prospectId || null,
    converted_to_crm: Boolean(analysis.convertedToCrm),
    updated_at: nowISO()
  };
}

function fromDbAiAnalysis(row) {
  return {
    id: row.id,
    prospectName: row.prospect_name || "",
    instagramHandle: row.instagram_handle || "",
    city: row.city || "",
    analysisDate: row.analysis_date || todayISO(),
    priority: row.priority || "Moyenne",
    score: row.score || 5,
    publicComment: row.public_comment || "",
    privateMessage: row.private_message || "",
    strategy: row.strategy || "",
    personalNotes: row.personal_notes || "",
    profileImageUrl: row.profile_image_url || "",
    postImageUrl: row.post_image_url || "",
    prospectId: row.prospect_id || null,
    convertedToCrm: Boolean(row.converted_to_crm)
  };
}

function filterAiAnalyses(analyses, filters) {
  return analyses.filter((item) => {
    const haystack = [item.prospectName, item.instagramHandle, item.city, item.publicComment, item.privateMessage, item.strategy, item.personalNotes].join(" ").toLowerCase();
    if (filters.query && !haystack.includes(filters.query.toLowerCase())) return false;
    if (filters.priority !== "Toutes" && item.priority !== filters.priority) return false;
    if (filters.city && !item.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.date && item.analysisDate !== filters.date) return false;
    const score = Number(item.score || 0);
    if (filters.score === "8+" && score < 8) return false;
    if (filters.score === "5-7" && (score < 5 || score > 7)) return false;
    if (filters.score === "1-4" && score > 4) return false;
    return true;
  });
}

function priorityPill(priority) {
  return {
    Haute: "bg-ocean text-white",
    Moyenne: "bg-linen text-ink",
    Faible: "bg-mist text-ink"
  }[priority] || "bg-mist text-ink";
}

function filterProspects(prospects, filters) {
  const q = filters.query.trim().toLowerCase();
  return prospects.filter((p) => {
    const haystack = [p.name, p.phone, p.whatsapp, p.email, p.city, p.profession, p.referredBy, p.network, p.notes, p.tags, findAvatar(p.avatarId).name].join(" ").toLowerCase();
    if (q && !haystack.includes(q)) return false;
    if (filters.status !== "Tous" && p.status !== filters.status) return false;
    if (filters.replyStatus === "Silencieux" && !isSilentProspect(p)) return false;
    if (filters.replyStatus === "Repondu" && !hasProspectAnswered(p)) return false;
    if (filters.avatarId !== "Tous" && p.avatarId !== filters.avatarId) return false;
    if (filters.score !== "Tous" && p.score !== filters.score) return false;
    if (filters.rimanStage !== "Tous" && p.rimanStage !== filters.rimanStage) return false;
    if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.dueOnly && !isDue(p)) return false;
    return true;
  });
}

function findAvatar(id) {
  return avatars.find((a) => a.id === id) || avatars[0];
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const dashboardFollowUpPriority = [
  "Call prevu",
  "Call propose",
  "Video 25 min envoyee",
  "Video 9 min envoyee",
  "Reponse recue",
  "Contacte",
  "A contacter"
];

function getDashboardFollowUps(prospects) {
  const today = todayISO();
  const tomorrow = addDays(1);
  const eligible = prospects.filter((prospect) => prospect.nextFollowUp && !["Client", "Partenaire", "Pas interesse"].includes(prospect.status));
  const overdue = sortDashboardFollowUps(eligible.filter((prospect) => prospect.nextFollowUp < today));
  const todayItems = sortDashboardFollowUps(eligible.filter((prospect) => prospect.nextFollowUp === today));
  const tomorrowItems = sortDashboardFollowUps(eligible.filter((prospect) => prospect.nextFollowUp === tomorrow));
  const upcomingItems = sortDashboardFollowUps(eligible.filter((prospect) => prospect.nextFollowUp > tomorrow)).slice(0, 8);

  return {
    priority: sortDashboardFollowUps([...overdue, ...todayItems]).slice(0, 8),
    overdue,
    today: todayItems,
    tomorrow: tomorrowItems,
    upcoming: upcomingItems
  };
}

function sortDashboardFollowUps(prospects) {
  return [...prospects].sort((a, b) => {
    const priorityA = dashboardFollowUpPriority.indexOf(a.status);
    const priorityB = dashboardFollowUpPriority.indexOf(b.status);
    const resolvedA = priorityA === -1 ? dashboardFollowUpPriority.length : priorityA;
    const resolvedB = priorityB === -1 ? dashboardFollowUpPriority.length : priorityB;
    if (resolvedA !== resolvedB) return resolvedA - resolvedB;
    if (String(a.nextFollowUp || "") !== String(b.nextFollowUp || "")) return String(a.nextFollowUp || "").localeCompare(String(b.nextFollowUp || ""));
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function getLateDays(value) {
  if (!value || value >= todayISO()) return 0;
  const today = new Date(`${todayISO()}T00:00:00`);
  const dueDate = new Date(`${value}T00:00:00`);
  return Math.max(0, Math.round((today - dueDate) / 86400000));
}

function getLastProspectActivity(prospect) {
  const history = Array.isArray(prospect.history) ? prospect.history : [];
  const latest = history
    .filter((entry) => !Number.isNaN(new Date(entry.at).getTime()))
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
  return latest?.at || prospect.firstContact || "";
}

function isDue(prospect) {
  return prospect.nextFollowUp && prospect.nextFollowUp <= todayISO() && !["Client", "Partenaire", "Pas interesse"].includes(prospect.status);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function splitTags(tags) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function stepText(step) {
  return {
    Accepter: "Reconnaitre l'objection sans se defendre.",
    Contourner: "Deplacer vers une question plus utile.",
    Recadrer: "Remettre la valeur et le contexte au centre.",
    "Retirer la pression": "Laisser la personne libre de dire non."
  }[step];
}

createRoot(document.getElementById("root")).render(<App />);
