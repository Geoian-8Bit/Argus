import { useState, type ReactNode } from 'react';
import { ChevronDown, GripVertical, Pencil } from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product } from './useProducts';
import type { ProductGroup } from './useProductGroups';
import type { GroupSectionOf } from './groupSections';
import { SortableProductList } from './SortableProductList';
import { useReorderGroups } from './useReorderGroups';
import { ascendingPositions, changedPositions, useReorderSensors } from './reorder';
import { Card } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

export type GroupSection = GroupSectionOf<Product, ProductGroup>;

interface SortableGroupSectionsProps {
  sections: GroupSection[];
  expanded: Set<string>;
  /** Buscando no se arrastra y todos los grupos salen abiertos. */
  isSearching: boolean;
  onToggle: (key: string) => void;
  onEditGroup: (group: ProductGroup) => void;
}

/**
 * Acordeón de grupos, arrastrable para reordenarlo. Solo se arrastran los
 * grupos reales: "Sin grupo" no es un grupo, así que se queda siempre al final
 * y sin asa.
 */
export function SortableGroupSections({
  sections,
  expanded,
  isSearching,
  onToggle,
  onEditGroup,
}: SortableGroupSectionsProps) {
  const reorder = useReorderGroups();
  const sensors = useReorderSensors();
  // Orden local mientras la mutación optimista está en vuelo.
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const groups = sections.filter((s) => s.group);
  const ungrouped = sections.filter((s) => !s.group);

  const ordered = localOrder
    ? (localOrder.map((key) => groups.find((s) => s.key === key)).filter(Boolean) as GroupSection[])
    : groups;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((s) => s.key);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    setLocalOrder(newIds);
    const positions = ascendingPositions(
      ordered.map((s) => ({ position: s.group?.position ?? null })),
    );
    reorder.mutate(changedPositions(ids, newIds, positions), {
      onSettled: () => setLocalOrder(null),
    });
  }

  const body = (section: GroupSection, handle?: ReactNode) => (
    <GroupSectionBody
      section={section}
      isOpen={isSearching || expanded.has(section.key)}
      isSearching={isSearching}
      onToggle={onToggle}
      onEditGroup={onEditGroup}
      handle={handle}
    />
  );

  const tail = ungrouped.map((section) => <Card key={section.key}>{body(section)}</Card>);

  if (isSearching) {
    return (
      <>
        {groups.map((section) => (
          <Card key={section.key}>{body(section)}</Card>
        ))}
        {tail}
      </>
    );
  }

  return (
    <>
      {reorder.isError && (
        <p className="text-sm text-destructive" role="alert">
          No se pudo guardar el orden de los grupos: {reorder.error.message}
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          {ordered.map((section) => (
            <SortableGroupCard key={section.key} section={section} render={body} />
          ))}
        </SortableContext>
      </DndContext>
      {tail}
    </>
  );
}

function SortableGroupCard({
  section,
  render,
}: {
  section: GroupSection;
  render: (section: GroupSection, handle?: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
  });

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Reordenar grupo ${section.name}`}
      className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/60 transition-colors hover:text-muted-foreground active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10')}
    >
      <Card className={cn(isDragging && 'shadow-md')}>{render(section, handle)}</Card>
    </div>
  );
}

function GroupSectionBody({
  section,
  isOpen,
  isSearching,
  onToggle,
  onEditGroup,
  handle,
}: {
  section: GroupSection;
  isOpen: boolean;
  isSearching: boolean;
  onToggle: (key: string) => void;
  onEditGroup: (group: ProductGroup) => void;
  handle?: ReactNode;
}) {
  const units = section.products.reduce((sum, p) => sum + p.stock, 0);
  const value = section.products.reduce((sum, p) => sum + p.stock * p.price, 0);

  return (
    <>
      <div className="flex items-center">
        {handle}
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => {
            if (!isSearching) onToggle(section.key);
          }}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pr-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            handle ? 'pl-1' : 'pl-4',
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{section.name}</p>
            <p className="text-xs text-muted-foreground">
              {section.products.length} {section.products.length === 1 ? 'producto' : 'productos'} ·{' '}
              <span className="tabular-nums">{units}</span> uds
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {formatMoney(value)}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border">
          {section.products.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Este grupo no tiene productos.
            </p>
          )}
          <SortableProductList products={section.products} reorderable={!isSearching} />
          {section.group && (
            <button
              type="button"
              onClick={() => onEditGroup(section.group as ProductGroup)}
              className={cn(
                'flex w-full items-center justify-center gap-1.5 rounded-b-lg px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                section.products.length > 0 && 'border-t border-border',
              )}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Editar grupo
            </button>
          )}
        </div>
      )}
    </>
  );
}
