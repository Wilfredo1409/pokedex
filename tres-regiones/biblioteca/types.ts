export type NamedResource = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  results: NamedResource[];
};

export type PokemonStat = {
  base_stat: number;
  stat: NamedResource;
};

export type PokemonTypeSlot = {
  slot: number;
  type: NamedResource;
};

export type PokemonAbility = {
  is_hidden: boolean;
  ability: NamedResource;
};

export type PokemonSprites = {
  front_default: string | null;
  front_shiny: string | null;
};

export type PokemonCries = {
  latest: string | null;
  legacy: string | null;
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  cries?: PokemonCries;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: NamedResource;
};

export type FlavorText = {
  flavor_text: string;
  language: NamedResource;
};

export type PokemonSpecies = {
  id: number;
  name: string;
  flavor_text_entries: FlavorText[];
  evolution_chain: { url: string };
  generation: NamedResource;
};

export type EvolutionNode = {
  species: NamedResource;
  evolves_to: EvolutionNode[];
};

export type EvolutionChain = {
  chain: EvolutionNode;
};

export type TypePokemonEntry = {
  pokemon: NamedResource;
};

export type TypeResponse = {
  name: string;
  pokemon: TypePokemonEntry[];
};

export type CatalogEntry = {
  id: number;
  name: string;
};
