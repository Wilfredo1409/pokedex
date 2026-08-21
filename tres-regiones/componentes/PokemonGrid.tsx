import type { CSSProperties } from "react";
import Image from "next/image";
import { displayName, padId, regionLabel, spriteUrl } from "@/biblioteca/pokeapi";
import type { CatalogEntry } from "@/biblioteca/types";

type Props = {
  items: CatalogEntry[];
  picked: number[];
  favorites: number[];
  team: number[];
  picking: boolean;
  onSelect: (id: number) => void;
};

export function PokemonGrid({
  items,
  picked,
  favorites,
  team,
  picking,
  onSelect,
}: Props) {
  return (
    <ul className="atlas-grid">
      {items.map((pokemon, index) => {
        const isPicked = picked.includes(pokemon.id);
        const isFav = favorites.includes(pokemon.id);
        const isTeam = team.includes(pokemon.id);
        return (
          <li key={pokemon.id} style={{ "--i": index } as CSSProperties}>
            <button
              type="button"
              className={`entry${isPicked ? " is-picked" : ""}`}
              onClick={() => onSelect(pokemon.id)}
              aria-pressed={picking ? isPicked : undefined}
            >
              <span className="entry-meta">
                <span>{padId(pokemon.id)}</span>
                <span>{regionLabel(pokemon.id)}</span>
              </span>
              <Image
                src={spriteUrl(pokemon.id)}
                alt=""
                width={96}
                height={96}
                unoptimized
              />
              <span className="entry-name">{displayName(pokemon.name)}</span>
              <span className="entry-marks">
                {isFav ? <span title="Favorito">F</span> : null}
                {isTeam ? <span title="En el equipo">E</span> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

