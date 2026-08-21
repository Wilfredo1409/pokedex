"use client";

import { useSyncExternalStore } from "react";
import { inAtlas } from "@/biblioteca/pokeapi";

const FAV_KEY = "atlas:favs:v1";
const TEAM_KEY = "atlas:team:v1";
const EMPTY: number[] = [];
const listeners = new Set<() => void>();

type Store = {
  favRaw: string;
  teamRaw: string;
  favs: number[];
  team: number[];
};

let store: Store = {
  favRaw: "[]",
  teamRaw: "[]",
  favs: EMPTY,
  team: EMPTY,
};

function parse(raw: string): number[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const ids = parsed.filter(
      (id): id is number => typeof id === "number" && inAtlas(id),
    );
    return ids.length ? ids : EMPTY;
  } catch {
    return EMPTY;
  }
}

function readStore(): Store {
  try {
    const favRaw = localStorage.getItem(FAV_KEY) ?? "[]";
    const teamRaw = localStorage.getItem(TEAM_KEY) ?? "[]";
    if (favRaw === store.favRaw && teamRaw === store.teamRaw) return store;
    store = {
      favRaw,
      teamRaw,
      favs: parse(favRaw),
      team: parse(teamRaw),
    };
    return store;
  } catch {
    return store;
  }
}

const SERVER_SNAPSHOT: Store = {
  favRaw: "[]",
  teamRaw: "[]",
  favs: EMPTY,
  team: EMPTY,
};

function getSnapshot() {
  return readStore();
}

function getServerSnapshot(): Store {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notify() {
  for (const listener of listeners) listener();
}

function write(key: string, ids: number[], kind: "favs" | "team") {
  try {
    const raw = JSON.stringify(ids);
    localStorage.setItem(key, raw);
    store = {
      ...store,
      [kind === "favs" ? "favRaw" : "teamRaw"]: raw,
      [kind]: ids,
    };
    notify();
  } catch {
    // privado / cuota
  }
}

export function useAtlasStorage() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    favorites: snapshot.favs,
    team: snapshot.team,
    toggleFavorite(id: number) {
      const next = snapshot.favs.includes(id)
        ? snapshot.favs.filter((item) => item !== id)
        : [...snapshot.favs, id];
      write(FAV_KEY, next, "favs");
    },
    toggleTeam(id: number) {
      if (snapshot.team.includes(id)) {
        write(
          TEAM_KEY,
          snapshot.team.filter((item) => item !== id),
          "team",
        );
        return;
      }
      if (snapshot.team.length >= 6) return;
      write(TEAM_KEY, [...snapshot.team, id], "team");
    },
    isFavorite(id: number) {
      return snapshot.favs.includes(id);
    },
    inTeam(id: number) {
      return snapshot.team.includes(id);
    },
  };
}

