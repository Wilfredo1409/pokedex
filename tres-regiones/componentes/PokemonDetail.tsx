"use client";

import Image from "next/image";
import { useState } from "react";
import { EvolutionPath } from "@/componentes/EvolutionPath";
import { StatBars } from "@/componentes/StatBars";
import { TYPE_COLORS, TYPE_LABELS } from "@/biblioteca/constants";
import { useFetch } from "@/ganchos/useFetch";
import {
  artworkUrl,
  displayName,
  evolutionStages,
  heightToMeters,
  padId,
  pokemonUrl,
  regionLabel,
  weightToKg,
} from "@/biblioteca/pokeapi";
import type { EvolutionChain, Pokemon, PokemonSpecies } from "@/biblioteca/types";

type Props = {
  id: number;
  isFavorite: boolean;
  inTeam: boolean;
  teamFull: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onToggleTeam: () => void;
  onSelectRelated: (id: number) => void;
};

export function PokemonDetail({
  id,
  isFavorite,
  inTeam,
  teamFull,
  onBack,
  onToggleFavorite,
  onToggleTeam,
  onSelectRelated,
}: Props) {
  const [shiny, setShiny] = useState(false);
  const pokemon = useFetch<Pokemon>(pokemonUrl(id));
  const species = useFetch<PokemonSpecies>(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`,
  );
  const chain = useFetch<EvolutionChain>(
    species.data?.evolution_chain.url ?? null,
  );

  const data = pokemon.data;
  const flavor = species.data?.flavor_text_entries
    .find((entry) => entry.language.name === "es")
    ?.flavor_text.replaceAll("\f", " ")
    .replaceAll("\n", " ");

  const stages = chain.data ? evolutionStages(chain.data.chain) : [];

  function playCry() {
    const url = data?.cries?.latest ?? data?.cries?.legacy;
    if (!url) return;
    const audio = new Audio(url);
    void audio.play();
  }

  if (pokemon.loading && !data) {
    return <p className="banner">Cargando ficha...</p>;
  }

  if (pokemon.error || !data) {
    return (
      <div className="banner-block">
        <p className="banner is-error">{pokemon.error ?? "No se pudo cargar."}</p>
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver al atlas
        </button>
      </div>
    );
  }

  return (
    <article className="sheet">
      <div className="sheet-bar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver
        </button>
        <div className="sheet-actions">
          <button
            type="button"
            className={`ghost-btn${isFavorite ? " is-on" : ""}`}
            onClick={onToggleFavorite}
          >
            {isFavorite ? "Quitar favorito" : "Favorito"}
          </button>
          <button
            type="button"
            className={`ghost-btn${inTeam ? " is-on" : ""}`}
            onClick={onToggleTeam}
            disabled={!inTeam && teamFull}
          >
            {inTeam ? "Sacar del equipo" : teamFull ? "Equipo lleno" : "Al equipo"}
          </button>
        </div>
      </div>

      <div className="sheet-hero">
        <div className={`portrait${shiny ? " is-shiny" : ""}`}>
          <Image
            src={artworkUrl(data.id, shiny)}
            alt={displayName(data.name)}
            width={280}
            height={280}
            unoptimized
            priority
          />
        </div>
        <div className="sheet-copy">
          <p className="sheet-region">{regionLabel(data.id)}</p>
          <p className="sheet-id">{padId(data.id)}</p>
          <h1>{displayName(data.name)}</h1>
          <ul className="type-row">
            {data.types.map((slot) => (
              <li
                key={slot.type.name}
                style={{ color: TYPE_COLORS[slot.type.name] }}
              >
                {TYPE_LABELS[slot.type.name] ?? slot.type.name}
              </li>
            ))}
          </ul>
          <p className="sheet-meta">
            {heightToMeters(data.height)} · {weightToKg(data.weight)}
          </p>
          <div className="sheet-tools">
            <button
              type="button"
              className={`ghost-btn${shiny ? " is-on" : ""}`}
              aria-pressed={shiny}
              onClick={() => setShiny((value) => !value)}
            >
              {shiny ? "Variocolor" : "Ver variocolor"}
            </button>
            <button type="button" className="ghost-btn" onClick={playCry}>
              Escuchar grito
            </button>
          </div>
        </div>
      </div>

      {flavor ? <p className="flavor">{flavor}</p> : null}

      <StatBars stats={data.stats} />

      <p className="ability-row">
        {data.abilities.map((entry) => (
          <span key={entry.ability.name}>
            {displayName(entry.ability.name)}
            {entry.is_hidden ? " (oculta)" : ""}
          </span>
        ))}
      </p>

      {species.loading || chain.loading ? (
        <p className="banner">Cargando evolución...</p>
      ) : (
        <EvolutionPath
          stages={stages}
          currentId={data.id}
          onSelect={onSelectRelated}
        />
      )}
    </article>
  );
}

