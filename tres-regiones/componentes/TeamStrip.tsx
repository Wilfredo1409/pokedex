import Image from "next/image";
import { displayName, padId, spriteUrl } from "@/biblioteca/pokeapi";

type Props = {
  team: number[];
  onOpen: (id: number) => void;
};

export function TeamStrip({ team, onOpen }: Props) {
  return (
    <section className="team-strip" aria-label="Equipo de 6">
      <div className="team-head">
        <h2>Equipo</h2>
        <p>{team.length}/6</p>
      </div>
      <ul>
        {Array.from({ length: 6 }, (_, index) => {
          const id = team[index];
          return (
            <li key={index}>
              {id ? (
                <button type="button" onClick={() => onOpen(id)}>
                  <Image
                    src={spriteUrl(id)}
                    alt={displayName(String(id))}
                    width={56}
                    height={56}
                    unoptimized
                  />
                  <span>{padId(id)}</span>
                </button>
              ) : (
                <span className="team-empty">{index + 1}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

