import { Link } from 'react-router-dom';

export function ProductsPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            Da de alta productos para generar su QR y poder escanearlos.
          </p>
        </div>
        <Link
          to="/products/new"
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          + Nuevo
        </Link>
      </header>

      <p className="text-sm text-muted-foreground">
        Listado y búsqueda llegan en la siguiente iteración.
      </p>
    </div>
  );
}
