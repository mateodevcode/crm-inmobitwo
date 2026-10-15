import { Button } from "@/components/ui/button.jsx";
import { URL_BACKEND } from "@/config/config.js";

// Redirige al backend, que inicia el flujo OAuth con Google (app=crm).
export function GoogleButton() {
  const irAGoogle = () => {
    const params = new URLSearchParams(window.location.search);
    const origen = params.get("origen");
    const qs = new URLSearchParams({ app: "crm" });
    if (origen && origen.startsWith("/")) qs.set("next", origen);
    window.location.href = `${URL_BACKEND}/auth/oauth/google?${qs.toString()}`;
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={irAGoogle}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.6-5.35 3.6a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 1 0 12 20.9c4.4 0 8.15-3.05 8.15-8.2 0-.55-.05-1.05-.15-1.6h-.65z"
        />
      </svg>
      Google
    </Button>
  );
}
