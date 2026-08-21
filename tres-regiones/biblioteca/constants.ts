export const POKEAPI = "https://pokeapi.co/api/v2";
export const TOTAL_POKEMON = 386;
export const PAGE_SIZE = 24;
export const LIST_URL = `${POKEAPI}/pokemon?limit=${TOTAL_POKEMON}`;

export const REGIONS = [
  { id: "all", label: "Todas", min: 1, max: 386 },
  { id: "kanto", label: "Kanto", min: 1, max: 151 },
  { id: "johto", label: "Johto", min: 152, max: 251 },
  { id: "hoenn", label: "Hoenn", min: 252, max: 386 },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. especial",
  "special-defense": "Def. especial",
  speed: "Velocidad",
};

export const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export const TYPE_COLORS: Record<string, string> = {
  normal: "#6d6d4e",
  fire: "#c44d0a",
  water: "#1f6bb5",
  grass: "#3d8c28",
  electric: "#b89100",
  ice: "#2f8a8a",
  fighting: "#9a241c",
  poison: "#6e2a74",
  ground: "#9a7420",
  flying: "#2f6f9a",
  psychic: "#b03a68",
  bug: "#6e7c18",
  rock: "#8a7020",
  ghost: "#4a4a6e",
  dragon: "#35557a",
  dark: "#3a3030",
  steel: "#5a5a72",
  fairy: "#a85a70",
};

export const FILTER_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;
