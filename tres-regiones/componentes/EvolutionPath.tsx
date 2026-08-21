import Image from "next/image";
import { displayName, padId, spriteUrl } from "@/biblioteca/pokeapi";

type Stage = { id: number; name: string };

type Props = {
  stages: Stage[][];
  currentId: number;
  onSelect: (id: number) => void;
};

export function EvolutionPath({ stages, currentId, onSelect }: Props) {
  if (stages.length === 0) return null;

  return (
    <section className="evo-block" aria-label="Línea evolutiva">
      <h2>Evolución</h2>
      <ol className="evo-line">
        {stages.map((stage, index) => (
          <li key={stage.map((p) => p.id).join("-")} className="evo-step">
            {index > 0 ? <span className="evo-link" aria-hidden="true" /> : null}
            <div className="evo-cluster">
              {stage.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  className={`evo-node${pokemon.id === currentId ? " is-current" : ""}`}
                  onClick={() => onSelect(pokemon.id)}
                >
                  <Image
                    src={spriteUrl(pokemon.id)}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                  />
                  <span>
                    {padId(pokemon.id)} {displayName(pokemon.name)}
                  </span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

