import { Field, Input, Select } from '@/components/ui';
import { useProductGroups } from './useProductGroups';

/** Valor especial del select para "crear un grupo nuevo". */
export const NEW_GROUP = '__new__';

interface GroupSelectProps {
  /** '' = sin grupo, NEW_GROUP = crear uno nuevo, otro valor = id del grupo. */
  value: string;
  onChange: (value: string) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
  disabled?: boolean;
}

export function GroupSelect({
  value,
  onChange,
  newName,
  onNewNameChange,
  disabled,
}: GroupSelectProps) {
  const groups = useProductGroups();

  return (
    <>
      <Field label="Grupo" hint="Los productos del mismo grupo se muestran juntos en el listado">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label="Grupo del producto"
        >
          <option value="">Sin grupo</option>
          {(groups.data ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
          <option value={NEW_GROUP}>+ Crear grupo nuevo…</option>
        </Select>
      </Field>
      {value === NEW_GROUP && (
        <Field label="Nombre del grupo nuevo" required>
          <Input
            required
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="p. ej. Almohadas"
            disabled={disabled}
          />
        </Field>
      )}
    </>
  );
}
