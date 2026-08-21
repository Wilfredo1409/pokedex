import { STAT_LABELS } from "@/biblioteca/constants";
import type { PokemonStat } from "@/biblioteca/types";

type Props = {
  stats: PokemonStat[];
};

export function StatBars({ stats }: Props) {
  return (
    <dl className="stat-list">
      {stats.map((entry) => {
        const label = STAT_LABELS[entry.stat.name] ?? entry.stat.name;
        const pct = Math.min(100, (entry.base_stat / 255) * 100);
        return (
          <div key={entry.stat.name} className="stat-row">
            <dt>
              {label}
              <span>{entry.base_stat}</span>
            </dt>
            <dd>
              <span className="stat-meter" style={{ width: `${pct}%` }} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

