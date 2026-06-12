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
