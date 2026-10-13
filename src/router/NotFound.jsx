import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-2xl font-semibold">Página no encontrada</p>
      <Link to="/" className="text-sm underline">
        Volver al panel
      </Link>
    </div>
  );
}
