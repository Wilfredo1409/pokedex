"use client";

import { FormEvent, startTransition, useState } from "react";
import { CompareView } from "@/componentes/CompareView";
import { PokemonDetail } from "@/componentes/PokemonDetail";
import { PokemonGrid } from "@/componentes/PokemonGrid";
import { TeamStrip } from "@/componentes/TeamStrip";
import { TypeFilter } from "@/componentes/TypeFilter";
import { useAtlasStorage } from "@/ganchos/useAtlasStorage";
import { useDebouncedValue } from "@/ganchos/useDebouncedValue";
import { useFetch } from "@/ganchos/useFetch";
import {
  LIST_URL,
  PAGE_SIZE,
  POKEAPI,
  REGIONS,
  type RegionId,
} from "@/biblioteca/constants";
import { idFromUrl, inAtlas } from "@/biblioteca/pokeapi";
import type { CatalogEntry, PokemonListResponse, TypeResponse } from "@/biblioteca/types";

type View =
  | { kind: "grid" }
  | { kind: "detail"; id: number }
  | { kind: "compare"; a: number; b: number };

type SortMode = "id" | "name";

export function AtlasApp() {
  const list = useFetch<PokemonListResponse>(LIST_URL);
  const storage = useAtlasStorage();

  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionId>("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("id");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>({ kind: "grid" });
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 350);
  const typeUrl = typeFilter ? `${POKEAPI}/type/${typeFilter}` : null;
  const typeData = useFetch<TypeResponse>(typeUrl);

  const catalog: CatalogEntry[] =
    list.data?.results.map((item) => ({
      id: idFromUrl(item.url),
      name: item.name,
    })) ?? [];

  const regionRange = REGIONS.find((item) => item.id === region) ?? REGIONS[0];
  const typeIds = typeData.data
    ? new Set(
        typeData.data.pokemon
          .map((entry) => idFromUrl(entry.pokemon.url))
          .filter(inAtlas),
      )
    : null;

  let filtered = catalog.filter(
    (item) => item.id >= regionRange.min && item.id <= regionRange.max,
  );

  if (typeFilter && typeIds) {
    filtered = filtered.filter((item) => typeIds.has(item.id));
  }
  if (favoritesOnly) {
    filtered = filtered.filter((item) => storage.isFavorite(item.id));
  }
  if (debouncedQuery) {
    filtered = filtered.filter(
      (item) =>
        item.name.includes(debouncedQuery) || String(item.id) === debouncedQuery,
    );
  }

  if (sortMode === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function openDetail(id: number) {
    setPicking(false);
    setPicked([]);
    setView({ kind: "detail", id });
  }

  function handleSelect(id: number) {
    if (!picking) {
      openDetail(id);
      return;
    }
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return [current[1], id];
      const next = [...current, id];
      if (next.length === 2) {
        setPicking(false);
        setView({ kind: "compare", a: next[0], b: next[1] });
      }
      return next;
    });
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = catalog.find(
      (item) => item.name === q || String(item.id) === q,
    );
    if (match) {
      setSearchError(null);
      openDetail(match.id);
      return;
    }
    setSearchError(
      "Solo hay Pokémon de las primeras 3 regiones (Kanto, Johto y Hoenn: 1–386).",
    );
  }

  function backToGrid() {
    setView({ kind: "grid" });
    setPicked([]);
    setPicking(false);
  }

  function randomEncounter() {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    openDetail(pick.id);
  }

  const screenBusy = list.loading || (Boolean(typeFilter) && typeData.loading);
  const showGrid = view.kind === "grid";

  return (
    <div className="atlas">
      <header className="hero">
        <p className="brand">POKEDEX</p>
        <p className="tagline">Kanto · Johto · Hoenn · 386 especies</p>
        <form className="search" onSubmit={handleSearch}>
          <label htmlFor="atlas-q">Buscar</label>
          <input
            id="atlas-q"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchError(null);
              setPage(1);
            }}
            placeholder="treecko, lugia, 250..."
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit">Buscar</button>
        </form>
      </header>

      <div className="regions" role="tablist" aria-label="Región">
        {REGIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={region === item.id}
            className={region === item.id ? "is-on" : undefined}
            onClick={() => {
              startTransition(() => {
                setRegion(item.id);
                setPage(1);
              });
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <TypeFilter
          value={typeFilter}
          onChange={(value) => {
            startTransition(() => {
              setTypeFilter(value);
              setPage(1);
            });
          }}
        />
        <label className="field">
          <span>Orden</span>
          <select
            value={sortMode}
            onChange={(event) => {
              setSortMode(event.target.value as SortMode);
              setPage(1);
            }}
          >
            <option value="id">Por número</option>
            <option value="name">Por nombre</option>
          </select>
        </label>
        <button
          type="button"
          className={`tool${favoritesOnly ? " is-on" : ""}`}
          onClick={() => {
            setFavoritesOnly((value) => !value);
            setPage(1);
          }}
        >
          Favoritos
          {storage.favorites.length ? ` (${storage.favorites.length})` : ""}
        </button>
        <button
          type="button"
          className={`tool${picking ? " is-on" : ""}`}
          onClick={() => {
            if (picking) {
              setPicking(false);
              setPicked([]);
              return;
            }
            setView({ kind: "grid" });
            setPicking(true);
            setPicked([]);
          }}
        >
          {picking ? `Elige 2 (${picked.length}/2)` : "Comparar"}
        </button>
        <button type="button" className="tool" onClick={randomEncounter}>
          Encuentro
        </button>
      </div>

      <main className="paper" aria-live="polite">
        {list.error ? <p className="banner is-error">{list.error}</p> : null}
        {searchError && showGrid ? (
          <p className="banner is-error">{searchError}</p>
        ) : null}

        {showGrid && screenBusy ? (
          <p className="banner">Abriendo el atlas...</p>
        ) : null}

        {showGrid && !screenBusy && !list.error ? (
          pageItems.length === 0 ? (
            <p className="banner">Ningún Pokémon coincide.</p>
          ) : (
            <PokemonGrid
              items={pageItems}
              picked={picked}
              favorites={storage.favorites}
              team={storage.team}
              picking={picking}
              onSelect={handleSelect}
            />
          )
        ) : null}

        {view.kind === "detail" ? (
          <PokemonDetail
            id={view.id}
            isFavorite={storage.isFavorite(view.id)}
            inTeam={storage.inTeam(view.id)}
            teamFull={storage.team.length >= 6}
            onBack={backToGrid}
            onToggleFavorite={() => storage.toggleFavorite(view.id)}
            onToggleTeam={() => storage.toggleTeam(view.id)}
            onSelectRelated={openDetail}
          />
        ) : null}

        {view.kind === "compare" ? (
          <CompareView a={view.a} b={view.b} onBack={backToGrid} />
        ) : null}
      </main>

      {showGrid ? (
        <nav className="pager" aria-label="Paginación">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() =>
              startTransition(() => setPage((p) => Math.max(1, p - 1)))
            }
          >
            Anterior
          </button>
          <p>
            {currentPage} / {pageCount}
            <span>{filtered.length} en vista</span>
          </p>
          <button
            type="button"
            disabled={currentPage >= pageCount}
            onClick={() =>
              startTransition(() => setPage((p) => Math.min(pageCount, p + 1)))
            }
          >
            Siguiente
          </button>
        </nav>
      ) : null}

      <TeamStrip team={storage.team} onOpen={openDetail} />
    </div>
  );
}

