"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TYPE_COLORS, TYPE_LABELS, STAT_LABELS } from "@/biblioteca/constants";
import {
  artworkUrl,
  displayName,
  fetchPokemon,
  padId,
} from "@/biblioteca/pokeapi";
import type { Pokemon } from "@/biblioteca/types";

type Props = {
  a: number;
  b: number;
  onBack: () => void;
};

type Result = {
  a: number;
  b: number;
  pair: [Pokemon, Pokemon] | null;
  error: string | null;
};

export function CompareView({ a, b, onBack }: Props) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchPokemon(a, controller.signal),
      fetchPokemon(b, controller.signal),
    ])
      .then((pair) => {
        if (controller.signal.aborted) return;
        setResult({ a, b, pair, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          a,
          b,
          pair: null,
          error: err instanceof Error ? err.message : "Error al comparar",
        });
      });

    return () => controller.abort();
  }, [a, b]);

  const ready = result && result.a === a && result.b === b;
  if (!ready) return <p className="banner">Comparando...</p>;
  if (result.error || !result.pair) {
    return (
      <div className="banner-block">
        <p className="banner is-error">{result.error ?? "No se pudo comparar."}</p>
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver
        </button>
      </div>
    );
  }

  const [left, right] = result.pair;

  return (
    <section className="duel">
      <div className="sheet-bar">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver
        </button>
        <p className="duel-label">Comparativa</p>
      </div>

      <div className="duel-heads">
        <CompareHead pokemon={left} />
        <CompareHead pokemon={right} mirror />
      </div>

      <ul className="duel-stats">
        {left.stats.map((stat, index) => {
          const other = right.stats[index];
          if (!other) return null;
          const label = STAT_LABELS[stat.stat.name] ?? stat.stat.name;
          const max = Math.max(stat.base_stat, other.base_stat, 1);
          return (
            <li key={stat.stat.name}>
              <div
                className="duel-fill left"
                style={{ width: `${(stat.base_stat / max) * 100}%` }}
              />
              <p>
                <span>{stat.base_stat}</span>
                <strong>{label}</strong>
                <span>{other.base_stat}</span>
              </p>
              <div
                className="duel-fill right"
                style={{ width: `${(other.base_stat / max) * 100}%` }}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CompareHead({
  pokemon,
  mirror = false,
}: {
  pokemon: Pokemon;
  mirror?: boolean;
}) {
  return (
    <div className={`duel-head${mirror ? " is-mirror" : ""}`}>
      <Image
        src={artworkUrl(pokemon.id)}
        alt={displayName(pokemon.name)}
        width={180}
        height={180}
        unoptimized
      />
      <p>{padId(pokemon.id)}</p>
      <h2>{displayName(pokemon.name)}</h2>
      <p className="type-row">
        {pokemon.types.map((slot) => (
          <span key={slot.type.name} style={{ color: TYPE_COLORS[slot.type.name] }}>
            {TYPE_LABELS[slot.type.name] ?? slot.type.name}
          </span>
        ))}
      </p>
    </div>
  );
}

