import { TOTAL_POKEMON, POKEAPI, REGIONS, type RegionId } from "@/biblioteca/constants";
import type { EvolutionNode, Pokemon } from "@/biblioteca/types";

const memoryCache = new Map<string, unknown>();

export function idFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export function inAtlas(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= TOTAL_POKEMON;
}

export function regionOf(id: number): Exclude<RegionId, "all"> {
  if (id <= 151) return "kanto";
  if (id <= 251) return "johto";
  return "hoenn";
}

export function regionLabel(id: number): string {
  const region = REGIONS.find((item) => item.id === regionOf(id));
  return region?.label ?? "Kanto";
}

export function displayName(name: string): string {
  return name.replaceAll("-", " ");
}

export function padId(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

export function spriteUrl(id: number, shiny = false): string {
  const folder = shiny ? "pokemon/shiny" : "pokemon";
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/${folder}/${id}.png`;
}

export function artworkUrl(id: number, shiny = false): string {
  const path = shiny
    ? "pokemon/other/official-artwork/shiny"
    : "pokemon/other/official-artwork";
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/${path}/${id}.png`;
}

export function pokemonUrl(idOrName: string | number): string {
  return `${POKEAPI}/pokemon/${idOrName}`;
}

export function heightToMeters(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

export function weightToKg(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const cached = memoryCache.get(url);
  if (cached) return cached as T;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Pokémon no encontrado"
        : `HTTP ${response.status}`,
    );
  }

  const data = (await response.json()) as T;
  memoryCache.set(url, data);
  return data;
}

export function fetchPokemon(id: number, signal?: AbortSignal): Promise<Pokemon> {
  return fetchJson<Pokemon>(pokemonUrl(id), signal);
}

export function evolutionStages(
  root: EvolutionNode,
): { id: number; name: string }[][] {
  const stages: { id: number; name: string }[][] = [];

  function walk(node: EvolutionNode, depth: number) {
    const id = idFromUrl(node.species.url);
    const allowed = inAtlas(id);
    if (allowed) {
      if (!stages[depth]) stages[depth] = [];
      if (!stages[depth].some((p) => p.id === id)) {
        stages[depth].push({ id, name: node.species.name });
      }
    }
    const nextDepth = allowed ? depth + 1 : depth;
    for (const child of node.evolves_to) walk(child, nextDepth);
  }

  walk(root, 0);
  return stages.filter((stage) => stage.length > 0);
}

