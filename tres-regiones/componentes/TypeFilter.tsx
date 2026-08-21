import { FILTER_TYPES, TYPE_LABELS } from "@/biblioteca/constants";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function TypeFilter({ value, onChange }: Props) {
  return (
    <label className="field">
      <span>Tipo</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filtrar por tipo"
      >
        <option value="">Todos los tipos</option>
        {FILTER_TYPES.map((type) => (
          <option key={type} value={type}>
            {TYPE_LABELS[type]}
          </option>
        ))}
      </select>
    </label>
  );
}

