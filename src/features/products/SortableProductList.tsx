import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product } from './useProducts';
import { useReorderProducts } from './useReorderProducts';
import { StockBadge } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

interface SortableProductListProps {
  products: Product[];
  /** Desactiva el arrastre (p. ej. mientras se busca: el orden no aplica). */
  reorderable?: boolean;
}

/**
 * Lista de productos arrastrable para reordenarla a mano. El orden se guarda
 * en products.position; al soltar solo se reasignan las positions que ya
 * usaba el propio subconjunto mostrado, así que nunca pisa el orden de
 * productos de otros grupos o vistas.
 */
export function SortableProductList({ products, reorderable = true }: SortableProductListProps) {
  const reorder = useReorderProducts();
  // Orden local mientras la mutación (optimista) está en vuelo, para que el
  // arrastre se sienta inmediato incluso antes de que llegue la respuesta.
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  // Lo que se está pintando ahora mismo: el orden local si hay una mutación en
  // vuelo, si no el que llega por props. El arrastre se calcula sobre este
  // mismo array para que índices y ids no puedan desincronizarse.
  const ordered = localOrder
    ? (localOrder.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[])
    : products;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((p) => p.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    setLocalOrder(newIds);
    reorder.mutate(
      { ids: newIds, positions: ascendingPositions(ordered) },
      { onSettled: () => setLocalOrder(null) },
    );
  }

  if (!reorderable) {
    return (
      <ul className="divide-y divide-border">
        {products.map((p) => (
          <Row key={p.id} product={p} />
        ))}
      </ul>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-border">
          {ordered.map((p) => (
            <SortableRow key={p.id} product={p} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Positions que ya usa el subconjunto mostrado, en orden ascendente y sin
 * repetidos. Si dos productos comparten position (o no la tienen), se separan
 * sumando 1 al anterior: de lo contrario el orden guardado sería ambiguo y las
 * filas «saltarían» al recargar.
 */
function ascendingPositions(products: Product[]): number[] {
  const sorted = products.map((p, i) => p.position ?? i).sort((a, b) => a - b);
  return sorted.reduce<number[]>((acc, pos) => {
    const prev = acc[acc.length - 1];
    acc.push(prev === undefined || pos > prev ? pos : prev + 1);
    return acc;
  }, []);
}

function RowContent({ product }: { product: Product }) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {product.name}
          {product.variant ? (
            <span className="text-muted-foreground"> · {product.variant}</span>
          ) : null}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">{product.code}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <StockBadge stock={product.stock} minStock={product.min_stock} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatMoney(product.stock * product.price)}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </>
  );
}

function Row({ product }: { product: Product }) {
  return (
    <li>
      <Link
        to={`/products/${product.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors last:rounded-b-lg hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <RowContent product={product} />
      </Link>
    </li>
  );
}

function SortableRow({ product }: { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-1 bg-card', isDragging && 'relative z-10 shadow-md')}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${product.name}`}
        className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/60 transition-colors hover:text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <Link
        to={`/products/${product.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <RowContent product={product} />
      </Link>
    </li>
  );
}
