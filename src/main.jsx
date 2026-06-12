import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
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

const todayISO = () => new Date().toISOString().slice(0, 10);
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

const scoreLabels = ["Froid", "Tiede", "Chaud"];

const followUpRules = {
  Contacte: 2,
  "Reponse recue": 2,
  "Video 9 min envoyee": 2,
  "Video 25 min envoyee": 3,
  "Call propose": 2,
  "Call prevu": 1,
  "A relancer": 0,
  "Rituel propose": 2,
  "Rituel realise": 3
};

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
const replyContexts = [
  "Premier echange",
  "Apres video 9 min",
  "Apres video 25 min",
  "Apres proposition de rituel",
  "Apres test produit",
  "Apres objection",
  "Apres silence / relance",
  "Opportunite business"
];
const replyTones = ["Doux", "Professionnel", "Curieux", "Direct", "Premium", "Rassurant"];

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
  const [form, setForm] = useState(emptyProspect());
  const {
    prospects,
    daily,
    loading,
    error,
    setDaily,
    addProspect,
    updateProspect,
    removeProspect
  } = useSupabaseCrm(session.user);

  const normalizedProspects = useMemo(() => prospects.map(normalizeProspect), [prospects]);
  const stats = useMemo(() => computeStats(normalizedProspects, daily), [normalizedProspects, daily]);

  const handleAddProspect = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    addProspect(form);
    setForm(emptyProspect());
  };

  const tabs = [
    ["Dashboard", LayoutDashboard],
    ["CRM", UsersRound],
    ["Pipeline RIMAN", ClipboardList],
    ["Statistiques", BarChart3],
    ["Avatars", UserRound],
    ["Generateurs", Sparkles],
    ["Scripts", Library],
    ["Relances", CalendarClock],
    ["Mon compte", UserRound]
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
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
        {activeTab === "Dashboard" && <Dashboard daily={daily} setDaily={setDaily} stats={stats} prospects={normalizedProspects} updateProspect={updateProspect} />}
        {activeTab === "CRM" && (
          <CRM
            prospects={normalizedProspects}
            form={form}
            setForm={setForm}
            addProspect={handleAddProspect}
            updateProspect={updateProspect}
            removeProspect={removeProspect}
          />
        )}
        {activeTab === "Pipeline RIMAN" && <RimanPipeline prospects={normalizedProspects} updateProspect={updateProspect} />}
        {activeTab === "Statistiques" && <StatsView stats={stats} prospects={normalizedProspects} />}
        {activeTab === "Avatars" && <Avatars />}
        {activeTab === "Generateurs" && <Generators />}
        {activeTab === "Scripts" && <ScriptsLibrary />}
        {activeTab === "Relances" && <FollowUps prospects={normalizedProspects} updateProspect={updateProspect} />}
        {activeTab === "Mon compte" && <AccountPage user={session.user} />}
      </main>
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
      { error: tasksError },
      { data: profileRow, error: profileError }
    ] = await Promise.all([
      supabase.from("prospects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    ]);

    handleError(prospectsError || historyError || notesError || tasksError || profileError);

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
    setDailyState(profileRow ? fromDbDaily(profileRow) : defaultDaily);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const setDaily = async (next) => {
    const resolved = typeof next === "function" ? next(daily) : next;
    setDailyState(resolved);
    const { error: upsertError } = await supabase.from("profiles").update(toDbDaily(resolved, user)).eq("id", user.id);
    handleError(upsertError);
  };

  const addProspect = async (form) => {
    const payload = normalizeProspect({ ...form, tags: form.tags.trim() });
    const { data, error: insertError } = await supabase.from("prospects").insert(toDbProspect(payload, user)).select().single();
    if (insertError) {
      handleError(insertError);
      return;
    }

    const history = historyItem("Creation fiche", "Prospect ajoute au CRM");
    await supabase.from("history").insert(toDbHistory(history, data.id, user));
    if (payload.notes) await supabase.from("notes").insert(toDbNote(payload.notes, data.id, user));
    if (payload.nextFollowUp) await createTask(data.id, user, payload.nextFollowUp, "Premiere relance");

    setProspects((items) => [fromDbProspect(data, [history]), ...items]);
  };

  const updateProspect = async (id, patch, label = "Mise a jour") => {
    const current = prospects.find((item) => item.id === id);
    if (!current) return;
    const enrichedPatch = enrichPatch(current, patch);
    const next = normalizeProspect({ ...current, ...enrichedPatch });
    const entries = buildHistory(current, next, label);

    setProspects((items) => items.map((item) => (item.id === id ? { ...next, history: [...entries, ...item.history].slice(0, 80) } : item)));

    const { error: updateError } = await supabase.from("prospects").update(toDbProspect(next, user)).eq("id", id).eq("user_id", user.id);
    handleError(updateError);

    if (!updateError && entries.length) {
      await supabase.from("history").insert(entries.map((entry) => toDbHistory(entry, id, user)));
    }

    if (!updateError && Object.prototype.hasOwnProperty.call(enrichedPatch, "notes")) {
      await supabase.from("notes").insert(toDbNote(next.notes, id, user));
    }

    if (!updateError && enrichedPatch.nextFollowUp) {
      await createTask(id, user, enrichedPatch.nextFollowUp, label);
    }
  };

  const removeProspect = async (id) => {
    setProspects((items) => items.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("prospects").delete().eq("id", id).eq("user_id", user.id);
    handleError(deleteError);
  };

  const createTask = async (prospectId, currentUser, dueDate, label) => {
    const { error: taskError } = await supabase.from("tasks").insert({
      user_id: currentUser.id,
      team_id: null,
      prospect_id: prospectId,
      due_date: dueDate,
      title: label,
      status: "pending"
    });
    handleError(taskError);
  };

  return { prospects, daily, loading, error, setDaily, addProspect, updateProspect, removeProspect };
}

function Dashboard({ daily, setDaily, stats, prospects, updateProspect }) {
  const due = prospects.filter((p) => isDue(p)).slice(0, 6);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Target} label="Prospects a contacter" value={stats.toContact} />
        <Metric icon={MessageCircle} label="Messages envoyes" value={daily.messagesSent} />
        <Metric icon={CalendarClock} label="Relances a faire" value={stats.followUps} />
        <Metric icon={Video} label="Calls proposes" value={stats.callsProposed} />
        <Metric icon={BarChart3} label="Score prospection" value={stats.score} />
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
                <Button variant="secondary" className="px-3" onClick={() => updateProspect(p.id, { status: "Contacte" }, "Relance effectuee")}>
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

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">{label}</p>
        <Icon size={20} className="text-ocean" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
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

function CRM({ prospects, form, setForm, addProspect, updateProspect, removeProspect }) {
  const [filters, setFilters] = useState({
    query: "",
    status: "Tous",
    avatarId: "Tous",
    score: "Tous",
    rimanStage: "Tous",
    city: "",
    dueOnly: false
  });

  const filtered = useMemo(() => filterProspects(prospects, filters), [prospects, filters]);

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
        <CRMFilters filters={filters} setFilters={setFilters} count={filtered.length} />
        {filtered.map((p) => (
          <ProspectCard key={p.id} prospect={p} updateProspect={updateProspect} removeProspect={removeProspect} />
        ))}
        {filtered.length === 0 && <Card className="p-6 text-sm text-ink/60">Aucun prospect ne correspond aux filtres.</Card>}
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
      <div className="mt-3 grid gap-3 md:grid-cols-5">
        <Field label="Statut"><Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option>Tous</option>{statuses.map((s) => <option key={s}>{s}</option>)}</Select></Field>
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

function ProspectCard({ prospect, updateProspect, removeProspect }) {
  const [open, setOpen] = useState(false);
  const scoreStyle = {
    Chaud: "bg-ocean text-white",
    Tiede: "bg-linen text-ink",
    Froid: "bg-mist text-ink"
  }[prospect.score];

  return (
    <Card className="p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{prospect.name}</h3>
            <span className="rounded-full bg-ink px-2 py-1 text-xs text-white">{prospect.status}</span>
            <span className={`rounded-full px-2 py-1 text-xs ${scoreStyle}`}>{prospect.score}</span>
            <span className="rounded-full border border-black/10 px-2 py-1 text-xs">{prospect.rimanStage}</span>
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
  return (
    <div className="mt-5 border-t border-black/10 pt-4">
      <h4 className="text-sm font-semibold">Historique chronologique</h4>
      <div className="mt-3 space-y-3">
        {history.length === 0 && <p className="text-sm text-ink/60">Aucune action enregistree.</p>}
        {history.map((item) => (
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
  const [smartReply, setSmartReply] = useState({ message: "", context: "Premier echange", tone: "Doux", result: "" });
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
        <h2 className="text-xl font-semibold">Reponse intelligente au prospect</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <Field label="Colle ici le message du prospect">
              <Textarea value={smartReply.message} onChange={(e) => setSmartReply({ ...smartReply, message: e.target.value })} placeholder="Ex. C'est interessant mais je trouve ca un peu cher..." />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contexte">
                <Select value={smartReply.context} onChange={(e) => setSmartReply({ ...smartReply, context: e.target.value })}>
                  {replyContexts.map((context) => <option key={context}>{context}</option>)}
                </Select>
              </Field>
              <Field label="Ton">
                <Select value={smartReply.tone} onChange={(e) => setSmartReply({ ...smartReply, tone: e.target.value })}>
                  {replyTones.map((tone) => <option key={tone}>{tone}</option>)}
                </Select>
              </Field>
            </div>
            <Button onClick={() => setSmartReply({ ...smartReply, result: generateSmartReply(smartReply) })}>
              <Sparkles size={16} /> Generer une reponse
            </Button>
          </div>
          <div className="rounded-lg bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/55">Resultat</p>
            <p className="mt-3 min-h-32 whitespace-pre-line text-sm leading-relaxed text-ink/80">
              {smartReply.result || "La reponse apparaitra ici. Elle restera courte, humaine et sans pression."}
            </p>
            <Button className="mt-4" variant="secondary" disabled={!smartReply.result} onClick={() => navigator.clipboard?.writeText(smartReply.result)}>
              <Copy size={16} /> Copier
            </Button>
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

function generateSmartReply({ message, context, tone }) {
  const intent = detectProspectIntent(message, context);
  const intro = tonePrefix(tone);
  const answer = smartReplyTemplates[intent] || smartReplyTemplates.default;
  const next = nextStepForIntent(intent, context);
  return [intro, answer, next].filter(Boolean).join(" ");
}

function detectProspectIntent(message, context) {
  const text = normalizeText(message);
  if (!text.trim() || context === "Apres silence / relance") return "silence";
  if (hasAny(text, ["trop cher", "cher", "budget", "prix", "combien"])) return "too_expensive";
  if (hasAny(text, ["pas le temps", "trop occupe", "occupee", "debordee", "pas dispo"])) return "no_time";
  if (hasAny(text, ["reflechir", "je reflechis", "je vais reflechir", "je dois voir"])) return "think";
  if (hasAny(text, ["deja une routine", "ma routine", "j ai deja mes produits", "deja mes produits"])) return "routine";
  if (hasAny(text, ["deja avec une marque", "travaille deja", "deja une marque", "partenaire d une marque"])) return "brand";
  if (hasAny(text, ["envoie", "infos", "info", "documents", "lien"])) return "send_info";
  if (hasAny(text, ["pas vendre", "je ne veux pas vendre", "vente", "commercial"])) return "no_selling";
  if (hasAny(text, ["pas de reseau", "pas un reseau", "je connais personne", "personne a qui"])) return "no_network";
  if (hasAny(text, ["ca m interesse", "interessee", "interessant", "pourquoi pas", "oui"])) return "interested";
  if (hasAny(text, ["comment ca marche", "comment cela marche", "explique", "fonctionne", "principe"])) return "how_it_works";
  if (hasAny(text, ["produits", "tester", "routine", "rituel", "commander"])) return "product_interest";
  if (hasAny(text, ["opportunite", "business", "revenu", "partenaire", "distributrice"])) return "business_interest";
  if (hasAny(text, ["pas maintenant", "plus tard", "pas le moment", "moment"])) return "not_now";
  if (hasAny(text, ["je te redis", "je reviens vers toi", "je vous redis", "plus tard"])) return "come_back";
  if (context === "Opportunite business") return "business_interest";
  if (context === "Apres proposition de rituel" || context === "Apres test produit") return "product_interest";
  return "default";
}

const smartReplyTemplates = {
  too_expensive: "Je comprends totalement, c'est normal de regarder le budget avant de se projeter. L'idee n'est pas de comparer juste un prix, mais de voir si le rituel a du sens pour votre peau et votre usage.",
  no_time: "Je comprends, les journees sont deja bien remplies. Justement, je peux vous partager la version la plus courte pour que vous puissiez voir tranquillement si le sujet vous parle.",
  think: "Bien sur, prenez le temps. Pour vous aider a reflechir simplement, on peut deja clarifier si votre hesitation vient plutot du timing, du budget ou du besoin de mieux comprendre.",
  routine: "Je comprends, et c'est plutot positif d'avoir deja une routine. Je ne cherche pas a remplacer ce qui vous convient, mais a voir si ce rituel peut completer quelque chose ou repondre a un besoin precis.",
  brand: "Je comprends parfaitement. Si vous travaillez deja avec une marque, l'objectif n'est pas de bousculer ce qui fonctionne, mais de voir s'il existe une complementarite interessante.",
  send_info: "Avec plaisir. Je vous envoie une version simple, sans vous noyer d'informations, et vous me dites ensuite si cela vaut la peine d'aller plus loin.",
  no_selling: "Je vous comprends, personne n'a envie de forcer une vente. L'approche ici est beaucoup plus relationnelle : recommander seulement quand c'est pertinent et garder une vraie liberte.",
  no_network: "Je comprends cette crainte. Le point de depart n'est pas d'avoir un grand reseau, mais d'identifier quelques conversations naturelles avec les bonnes personnes.",
  interested: "Super, merci pour votre retour. Le plus simple est de vous partager une premiere vue claire pour que vous puissiez voir si cela correspond vraiment a vos attentes.",
  how_it_works: "Oui bien sur. Le principe est simple : on part du besoin de la personne, on presente le rituel ou l'opportunite de facon claire, puis chacun avance uniquement si cela lui parle.",
  product_interest: "Avec plaisir. Avant de vous conseiller quoi que ce soit, j'aimerais comprendre votre peau, votre routine actuelle et ce que vous aimeriez ameliorer.",
  business_interest: "Super. L'opportunite repose surtout sur la recommandation, l'accompagnement et une approche relationnelle, sans forcer les gens ni jouer un role commercial agressif.",
  not_now: "Je comprends totalement, ce n'est peut-etre simplement pas le bon moment. Je prefere vous laisser de l'espace et revenir plus tard si cela vous convient.",
  come_back: "Bien sur, aucun souci. Je vous laisse regarder tranquillement et je me permets de revenir vers vous dans quelques jours si je n'ai pas de nouvelles.",
  silence: "Je me permets une petite relance, sans pression. Si ce n'est pas le bon moment ou si le sujet n'est pas prioritaire, dites-le moi simplement et je le mets de cote.",
  default: "Merci pour votre retour. Je comprends votre point de vue, et l'idee est simplement de voir si cela peut etre pertinent pour vous, sans pression ni engagement."
};

function nextStepForIntent(intent, context) {
  if (["too_expensive", "routine", "product_interest"].includes(intent)) return "Est-ce que je peux vous poser 2 questions rapides avant de vous proposer le rituel le plus adapte ?";
  if (["send_info", "interested", "how_it_works"].includes(intent)) return context.includes("25") ? "Je peux vous proposer un court echange de 10 a 15 minutes si vous voulez gagner du temps." : "Je peux vous envoyer la video de 9 minutes pour commencer ?";
  if (["business_interest", "no_selling", "no_network"].includes(intent)) return "Je peux vous envoyer la video de 25 minutes qui explique l'approche business, et vous me dites simplement si cela vous parle ?";
  if (["no_time", "think", "not_now", "come_back", "silence"].includes(intent)) return "Aucun souci si vous preferez que je revienne vers vous plus tard.";
  if (context === "Apres video 9 min") return "Voulez-vous que je vous envoie la version plus complete de 25 minutes ?";
  if (context === "Apres video 25 min") return "Si vous voulez, on peut en parler 10 a 15 minutes pour voir si c'est adapte.";
  return "Est-ce que vous voulez que je vous envoie la suite la plus simple ?";
}

function tonePrefix(tone) {
  return {
    Doux: "Je comprends tout a fait.",
    Professionnel: "Merci pour votre retour, je comprends votre point.",
    Curieux: "Je comprends, et c'est justement interessant de creuser un peu.",
    Direct: "Oui, je comprends.",
    Premium: "Je comprends, et je prefere justement garder une approche tres qualitative.",
    Rassurant: "Je comprends totalement, et il n'y a aucune pression."
  }[tone] || "Je comprends.";
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

function FollowUps({ prospects, updateProspect }) {
  const due = prospects.filter((p) => isDue(p));
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Regles de relance automatique</h2>
        <div className="mt-4 space-y-3">
          {Object.entries(followUpRules).map(([status, days]) => (
            <div key={status} className="flex items-center justify-between rounded-lg bg-ivory p-3 text-sm">
              <span className="font-semibold">{status}</span>
              <span>{days === 0 ? "aujourd'hui" : `J+${days}`}</span>
            </div>
          ))}
        </div>
      </Card>
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
                  <Button variant="secondary" onClick={() => updateProspect(p.id, { nextFollowUp: addDays(5), status: "A relancer" }, "Relance J+5")}>J+5</Button>
                  <Button onClick={() => updateProspect(p.id, { status: "Contacte" }, "Relance effectuee")}>Fait</Button>
                </div>
              </div>
            </div>
          ))}
          {due.length === 0 && <p className="text-sm text-ink/60">Aucune relance a traiter.</p>}
        </div>
      </Card>
    </div>
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
    score: "Tiede",
    interest: 3,
    firstContact: todayISO(),
    nextFollowUp: addDays(2),
    notes: "",
    tags: "",
    history: []
  };
}

function normalizeProspect(prospect) {
  return {
    ...emptyProspect(),
    ...prospect,
    status: normalizeLegacy(prospect.status || "A contacter"),
    rimanStage: normalizeLegacy(prospect.rimanStage || statusToRiman[normalizeLegacy(prospect.status)] || "Prospect"),
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

function enrichPatch(current, patch) {
  const next = { ...patch };
  if (patch.status && patch.status !== current.status) {
    const days = followUpRules[patch.status];
    if (days !== undefined && !patch.nextFollowUp) next.nextFollowUp = addDays(days);
    if (statusToRiman[patch.status] && !patch.rimanStage) next.rimanStage = statusToRiman[patch.status];
    if (["Client", "Partenaire"].includes(patch.status) && !patch.score) next.score = "Chaud";
  }
  if (patch.rimanStage === "Commande" && !patch.status) next.status = "Client";
  if (patch.rimanStage === "Partenaire" && !patch.status) next.status = "Partenaire";
  return next;
}

function buildHistory(before, after, label) {
  const entries = [];
  const tracked = [
    ["status", "Statut"],
    ["rimanStage", "Pipeline RIMAN"],
    ["score", "Score"],
    ["nextFollowUp", "Prochaine relance"],
    ["notes", "Notes"],
    ["phone", "Telephone"],
    ["whatsapp", "WhatsApp"],
    ["email", "Email"],
    ["city", "Ville"],
    ["profession", "Profession"],
    ["referredBy", "Recommande par"]
  ];
  tracked.forEach(([key, labelName]) => {
    if (before[key] !== after[key]) {
      entries.push(historyItem(label, `${labelName}: ${before[key] || "-"} -> ${after[key] || "-"}`));
    }
  });
  return entries.length ? entries : [historyItem(label, "Fiche mise a jour")];
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
    score: prospect.score,
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

function computeStats(prospects, daily) {
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
    ritualRate: percent(rituals, total)
  };
}

function filterProspects(prospects, filters) {
  const q = filters.query.trim().toLowerCase();
  return prospects.filter((p) => {
    const haystack = [p.name, p.phone, p.whatsapp, p.email, p.city, p.profession, p.referredBy, p.network, p.notes, p.tags, findAvatar(p.avatarId).name].join(" ").toLowerCase();
    if (q && !haystack.includes(q)) return false;
    if (filters.status !== "Tous" && p.status !== filters.status) return false;
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
