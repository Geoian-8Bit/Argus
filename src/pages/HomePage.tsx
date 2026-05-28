import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Elige una acción para empezar. Al escanear un código se buscará en el inventario.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/scan?action=in"
          className="flex h-32 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          Añadir
        </Link>
        <Link
          to="/scan?action=out"
          className="flex h-32 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
        >
          Retirar
        </Link>
      </div>
    </div>
  );
}
